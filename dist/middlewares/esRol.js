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
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const esRol = (...rol) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { rol: rolUsuario } = yield models_1.Usuario.findById(req.payload.id);
        if (!rol.some((rolElement) => rolUsuario.includes(rolElement))) {
            return res.status(403).json({
                ok: false,
                error: 'Su rol no tiene acceso a este recurso'
            });
        }
        next();
    });
};
exports.default = esRol;
//# sourceMappingURL=esRol.js.map