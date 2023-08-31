"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.esPesoValido = exports.esFechaValida = exports.capitalizar = void 0;
const moment_1 = __importDefault(require("moment"));
const capitalizar = (sentencia) => {
    return sentencia.trim().split(' ').map(palabra => //se quitan los espacios al principio y al final y se capitaliza cada palabra del nombre para asi guardarla en base de datos
     palabra[0].toUpperCase() + palabra.slice(1).toLowerCase()).join(' ');
};
exports.capitalizar = capitalizar;
const esFechaValida = (birthday) => {
    if (Number.isNaN(Number(birthday))) {
        return false;
    }
    if (birthday < 0) {
        return false;
    }
    if (!(0, moment_1.default)(birthday).isValid) {
        return false;
    }
    const theDate = (0, moment_1.default)(birthday).add(6, 'hours').format('YYYY-MM-DD');
    if ((0, moment_1.default)().diff((0, moment_1.default)(theDate), 'years') < 18) {
        return false;
    }
    return true;
};
exports.esFechaValida = esFechaValida;
const esPesoValido = (peso) => {
    if (peso) {
        if (Number.isNaN(Number(peso))) {
            return false;
        }
        if (Number(peso) < 0) {
            return false;
        }
    }
    return true;
};
exports.esPesoValido = esPesoValido;
//# sourceMappingURL=funciones.js.map