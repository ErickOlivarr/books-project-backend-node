"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// const generarJWT = (usuario: UsuarioObjeto) => {
const generarJWT = (id, nombre, apellido, rol) => {
    return new Promise((resolve, reject) => {
        const payload = { id, nombre: `${nombre} ${apellido}`, rol };
        jsonwebtoken_1.default.sign(payload, process.env.SECRET_JWT_SEED, {
            expiresIn: '2h'
        }, (err, token) => {
            if (err) {
                return reject('No se pudo agregar el token');
            }
            resolve(token);
        });
    });
};
exports.default = generarJWT;
//# sourceMappingURL=generar-jwt.js.map