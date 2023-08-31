"use strict";
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
exports.existeId = exports.existeEmailAuth = exports.esFechaValida = exports.esRolValido = exports.existeEmail = exports.existeNombreYApellido = void 0;
const usuario_1 = __importDefault(require("../models/usuario"));
const rol_1 = __importDefault(require("../models/rol"));
const moment_1 = __importDefault(require("moment"));
//NOTA: si la funcion que se ponga dentro de un custom del express-validator en los routers es async entonces para generar un error pero para validarlo en el archivo validar-campos.ts de la carpeta middlewares se pone throw new Error como se vio en las lecciones del curso de node js, y ya con eso, no hace falta que le pongamos nada para decir que está bien todo, y en cambio si la funcion no es async entonces forzozamente se debe retornar un true para que avance y no retorne error, y se debe retornar false para que se tenga un error y se valide en el validar-campos.ts, tal como se ve en el backend de express de la carpeta 09-calendar-backend del curso de react
const existeNombreYApellido = (nombre, { req }) => __awaiter(void 0, void 0, void 0, function* () {
    const usuario = yield usuario_1.default.findOne({
        nombre,
        apellido: req.body.apellido,
        estado: true
    });
    if (usuario) {
        throw new Error('Existe usuario con ese nombre y apellido');
    }
});
exports.existeNombreYApellido = existeNombreYApellido;
const existeEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const usuario = yield usuario_1.default.findOne({
        email,
        estado: true
    });
    if (usuario) {
        throw new Error('Existe usuario con ese email');
    }
});
exports.existeEmail = existeEmail;
const esRolValido = (rol) => __awaiter(void 0, void 0, void 0, function* () {
    let condicion = false;
    if (!Array.isArray(rol)) {
        const theRol = yield rol_1.default.findOne({ rol });
        condicion = !!theRol;
    }
    else {
        for (let roleOne of rol) {
            const theRol = yield rol_1.default.findOne({
                rol: {
                    $in: [
                        roleOne
                    ]
                }
            });
            condicion = !!theRol;
            if (!condicion)
                break;
        }
    }
    if (!condicion) {
        throw new Error('No se encuentra registrado el rol proporcionado');
    }
});
exports.esRolValido = esRolValido;
const esFechaValida = (fecha) => {
    if (!(0, moment_1.default)(fecha).isValid) {
        throw new Error(`el valor ${fecha} no es una fecha valida`);
    }
    const theDate = (0, moment_1.default)(fecha).add(6, 'hours').format('YYYY-MM-DD');
    if ((0, moment_1.default)().diff((0, moment_1.default)(theDate), 'years') < 18) {
        throw new Error(`la edad debe ser mayor a 18`);
    }
    return true;
};
exports.esFechaValida = esFechaValida;
const existeEmailAuth = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const usuarioTrue = yield usuario_1.default.findOne({ email, estado: true });
    const usuarios = yield usuario_1.default.find({ email });
    if (!usuarioTrue) {
        if (usuarios.length > 0) {
            throw new Error('Se eliminó este usuario. Es posible que un administrador haya realizado la accion');
        }
        throw new Error('Email o contraseña incorrecta');
    }
    return true;
});
exports.existeEmailAuth = existeEmailAuth;
const existeId = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const usuario = yield usuario_1.default.findById(id);
    if (!usuario || !usuario.estado) {
        throw new Error('No existe un usuario con este id o fue eliminado');
    }
    return true;
});
exports.existeId = existeId;
//# sourceMappingURL=db-validators.js.map