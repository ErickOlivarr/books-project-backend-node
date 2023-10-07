"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const express_validator_1 = require("express-validator");
const helpers_1 = require("../helpers");
const middlewares_1 = require("../middlewares");
const router = (0, express_1.default)();
exports.router = router;
router.post('/login', [
    (0, express_validator_1.check)('email', 'No es un correo valido').isString().matches(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
    (0, express_validator_1.check)('email').custom(helpers_1.existeEmailAuth),
    (0, express_validator_1.check)('password', 'La contraseña debe tener minimo 5 caracteres, sin espacios en blanco').isString()
        .isLength({ min: 5 }).not().matches(/[' ']+/),
    middlewares_1.validarCampos
], controllers_1.iniciarSesion);
router.get('/renew', [
    middlewares_1.validarJWT,
    middlewares_1.validarEliminado,
    (0, middlewares_1.esRol)('ROLE_ADMIN', 'ROLE_USER')
], controllers_1.renovarToken);
//# sourceMappingURL=auth.js.map