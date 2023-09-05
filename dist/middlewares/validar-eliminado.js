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
const validarEliminado = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield models_1.Usuario.findById(req.payload.id);
    if (!(user === null || user === void 0 ? void 0 : user.estado)) {
        return res.status(401).json({
            ok: false,
            error: 'El usuario fue eliminado',
            cierre: true
        });
    }
    next();
});
exports.default = validarEliminado;
//# sourceMappingURL=validar-eliminado.js.map