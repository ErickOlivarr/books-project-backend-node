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
const AutorSchema = new mongoose_1.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido']
    },
    apellido: {
        type: String,
        required: [true, 'El apellido es requerido']
    },
    birthday: {
        type: Date,
        default: null
    },
    usuario: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    libros: [
        { type: mongoose_1.Schema.Types.ObjectId, ref: 'Libro' }
    ]
});
AutorSchema.index({
    nombre: 1,
    apellido: 1,
    usuario: 1
}, {
    unique: true
});
AutorSchema.method('toJSON', function () {
    const _a = this.toObject(), { _id, __v, nombre, apellido, usuario, libros, birthday } = _a, objeto = __rest(_a, ["_id", "__v", "nombre", "apellido", "usuario", "libros", "birthday"]);
    objeto.id = _id;
    objeto.nombre = nombre + ' ' + apellido;
    if (libros) {
        objeto.libros = libros.map(l => ({ id: l._id, nombre: l.nombre }));
    }
    if (birthday) {
        objeto.birthday = (birthday) ? (0, moment_1.default)(birthday).add(6, 'hours').format('DD/MM/YYYY') : null;
    }
    return objeto;
});
exports.default = (0, mongoose_1.model)('Autor', AutorSchema);
//# sourceMappingURL=autor.js.map