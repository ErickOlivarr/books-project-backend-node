"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerAutor = exports.obtenerAutores = exports.eliminarAutor = exports.actualizarAutor = exports.crearAutor = void 0;
const autor_1 = __importDefault(require("../models/autor"));
const funciones_1 = require("../helpers/funciones");
const mongoose_1 = __importStar(require("mongoose"));
const libro_1 = __importDefault(require("../models/libro"));
const objectId = mongoose_1.Types.ObjectId;
const crearAutor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre, apellido, birthday, libros } = req.body;
    const theName = (0, funciones_1.capitalizar)(nombre);
    const theApellido = (0, funciones_1.capitalizar)(apellido);
    let fechaNac = null;
    if (birthday) {
        if (!(0, funciones_1.esFechaValida)(birthday)) {
            return res.status(400).json({
                ok: false,
                error: 'Se debe proporcionar una fecha valida, en numero positivo'
            });
        }
        fechaNac = birthday;
    }
    const { id: idLogueado } = req.payload;
    // const autor = new Autor({ nombre: theName, apellido: theApellido, birthday: fechaNac, usuario: idLogueado });
    // await autor.save();
    const autor = yield autor_1.default.create({ nombre: theName, apellido: theApellido, birthday: fechaNac, usuario: idLogueado, libros: [] }); //esta es otra forma de guardar en base de datos, con el metodo create en lugar del metodo save(), ambas formas funcionan igual
    // (autor as any).ok = 'hola'; //tanto si guardamos con el metodo save() como si guardamos con el metodo create() vistos arriba al objeto retornado podemos añadirle un atributo de esta forma y podremos leerlo a nivel de codigo, pero si ese objeto lo mandamos como respuesta al JSON entonces ahí no se va a mostrar ese atributo en este caso el atributo llamado ok, para que se muestren atributos nuevos en la respuesta JSON podemos mandar como respuesta un objeto puro de javascript que creemos aqui en el controlador, o usar la funcion toJSON en el modelo
    // console.log((autor as any).ok); //hola , aunque este atributo no se mostrará en la respuesta JSON por lo que se dijo arriba
    res.status(201).json({
        ok: true,
        data: autor
    });
});
exports.crearAutor = crearAutor;
const actualizarAutor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre, apellido, birthday, libros } = req.body;
    const { id } = req.params;
    const name = (0, funciones_1.capitalizar)(nombre);
    const lastname = (0, funciones_1.capitalizar)(apellido);
    let fechaNac = null;
    if (birthday) {
        if (!(0, funciones_1.esFechaValida)(birthday)) {
            return res.status(400).json({
                ok: false,
                error: 'Se debe proporcionar una fecha valida, en numero positivo'
            });
        }
        fechaNac = birthday;
    }
    else {
        const { birthday } = yield autor_1.default.findById(id);
        fechaNac = birthday;
    }
    const objeto = {
        nombre: name,
        apellido: lastname,
        birthday: fechaNac
    };
    const autorActualizado = yield autor_1.default.findByIdAndUpdate(id, objeto, { new: true }).populate('libros', 'nombre');
    res.status(201).json({
        ok: true,
        data: autorActualizado
    });
});
exports.actualizarAutor = actualizarAutor;
const eliminarAutor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const autor = yield autor_1.default.findById(id);
    const libros = yield libro_1.default.find({ autores: { $in: [autor.id] } }).lean();
    //aqui se aplica transacciones, esto se explica en el archivo libros.ts de esta carpeta de controllers
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        //se va a eliminar los libros que solo tenga un solo autor y sea el autor que se está eliminando, ya que no puede haber un libro sin autores, y si un libro tiene tambien ese autor a eliminar pero que tambien tenga mas autores entonces ese libro no se eliminará, solo se le eliminará del array de su atributo autores el usuario que se va a eliminar pero conservará sus demás autores
        const operacionLibros = libros.map(l => {
            if (l.autores.length > 1) {
                return libro_1.default.updateMany({
                    autores: autor.id
                }, {
                    $pull: {
                        autores: autor.id
                    }
                }, { session });
            }
            else {
                return libro_1.default.findByIdAndDelete(l._id).session(session);
            }
        });
        yield Promise.all([...operacionLibros]);
        const eliminado = yield autor_1.default.findByIdAndDelete(id).session(session);
        yield session.commitTransaction();
        res.status(200).json({
            ok: true,
            data: {
                nombre: `${eliminado.nombre} ${eliminado.apellido}`
            }
        });
    }
    catch (error) {
        yield session.abortTransaction();
        res.status(400).json({
            ok: false,
            error: 'No se pudo eliminar el autor'
        });
    }
    finally {
        session.endSession();
    }
});
exports.eliminarAutor = eliminarAutor;
const obtenerAutores = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: idLogueado } = req.payload;
    const autores = yield autor_1.default.find({
        usuario: idLogueado
    }, { birthday: false, libros: false });
    res.json({
        ok: true,
        data: autores
    });
});
exports.obtenerAutores = obtenerAutores;
const obtenerAutor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const autor = yield autor_1.default.findById(id).populate('libros', ['nombre']);
    res.json({
        ok: true,
        data: autor
    });
});
exports.obtenerAutor = obtenerAutor;
//# sourceMappingURL=autores.js.map