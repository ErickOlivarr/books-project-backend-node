"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const moment_1 = __importDefault(require("moment"));
const UsuarioDetalleSchema = new mongoose_1.Schema({
    estatura: {
        type: Number
    },
    peso: {
        type: Number
    },
    fechaNacimiento: {
        type: Date,
        required: true,
        // validate: {
        //     validator: validarFecha,
        //     message: ({ value }) => `el valor ${value} no es una fecha valida`
        // }
    },
});
function validarFecha(valor) {
    if (Number.isNaN(valor))
        return false;
    if (!moment_1.default.isDate(valor) || valor > Date.now())
        return false;
    return true;
}
UsuarioDetalleSchema.pre('validate', function (next) {
    if (!moment_1.default.isDate(this.fechaNacimiento)) {
        return next(new Error(`el valor ${this.fechaNacimiento} no es una fecha valida`));
    }
    if (this.fechaNacimiento.getTime() > Date.now()) {
        return next(new Error(`la fecha ${this.fechaNacimiento} no puede ser mayor a la fecha actual`));
    }
    next();
});
//# sourceMappingURL=usuarioDetalle.js.map