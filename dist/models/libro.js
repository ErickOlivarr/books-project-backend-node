"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const mongoose_1 = require("mongoose");
const LibroSchema = new mongoose_1.Schema({
    nombre: {
        type: String,
        // unique: true,
        required: [true, 'El nombre es requerido']
    },
    isbn: {
        type: String,
        required: [true, 'El codigo isbn es requerido'],
        // unique: true
    },
    usuario: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    autores: [
        { type: mongoose_1.Schema.Types.ObjectId, ref: 'Autor', required: [true, 'Debes asignarle autores al libro'] }
    ],
    favorito: {
        type: Number,
        required: true,
        enum: [1, 0]
    },
    img: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});
LibroSchema.index({
    nombre: 1,
    usuario: 1
}, {
    unique: true
});
LibroSchema.index({
    isbn: 1,
    usuario: 1
}, {
    unique: true
});
LibroSchema.method('toJSON', function () {
    var _a;
    const _b = this.toObject(), { _id, __v, createdAt, updatedAt } = _b, objeto = __rest(_b, ["_id", "__v", "createdAt", "updatedAt"]);
    objeto.id = _id;
    if (createdAt) {
        objeto.publicado = (0, moment_1.default)(createdAt).format('DD/MM/YYYY');
    }
    if ((_a = objeto.usuario) === null || _a === void 0 ? void 0 : _a.nombre) { //si se hizo el populate con el atributo de relacion usuario
        objeto.usuario.id = objeto.usuario._id;
        objeto.usuario.nombre = `${objeto.usuario.nombre} ${objeto.usuario.apellido}`;
        delete objeto.usuario._id;
        delete objeto.usuario.apellido;
    }
    else {
        delete objeto.usuario;
    }
    if (objeto.autores) {
        objeto.autores = objeto.autores.map(autor => {
            const object = {};
            if (autor.nombre) {
                object.id = autor._id;
                object.nombre = `${autor.nombre} ${autor.apellido}`;
                // if(autor.usuario?.nombre) {
                //     const {_id, apellido, ...userObj} = autor.usuario;
                //     object.usuario = {...userObj};
                //     object.usuario.nombre = `${userObj.nombre} ${apellido}`;
                //     object.usuario.id = _id;
                // }
            }
            return object;
        });
    }
    return objeto;
});
exports.default = (0, mongoose_1.model)('Libro', LibroSchema);
//# sourceMappingURL=libro.js.map