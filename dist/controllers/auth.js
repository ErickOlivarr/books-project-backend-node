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
exports.renovarToken = exports.iniciarSesion = void 0;
const models_1 = require("../models");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const helpers_1 = require("../helpers");
const iniciarSesion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const usuario = yield models_1.Usuario.findOne({ email }); //Asi como se comentó aqui se puede hacer proyecciones, tal como lo vimos en el curso de mongdb
    const { id, password: passResult, nombre, apellido, rol } = usuario;
    const passwordCoincide = bcryptjs_1.default.compareSync(password, passResult);
    if (!passwordCoincide) {
        return res.status(400).json({
            ok: false,
            error: 'Email o contraseña incorrecta'
        });
    }
    const token = yield (0, helpers_1.generarJWT)(id, nombre, apellido, rol);
    res.json({
        ok: true,
        data: usuario,
        token
    });
});
exports.iniciarSesion = iniciarSesion;
const renovarToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { payload: { id, nombre, apellido, rol } } = req;
    const token = yield (0, helpers_1.generarJWT)(id, nombre, apellido, rol);
    res.json({
        ok: true,
        token
    });
});
exports.renovarToken = renovarToken;
//# sourceMappingURL=auth.js.map