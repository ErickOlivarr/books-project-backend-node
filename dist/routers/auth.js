"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controllers/auth");
const express_validator_1 = require("express-validator");
const db_validators_1 = require("../helpers/usuarios-auth/db-validators");
const validar_campos_1 = __importDefault(require("../middlewares/validar-campos"));
const validar_jwt_1 = __importDefault(require("../middlewares/validar-jwt"));
const validar_eliminado_1 = __importDefault(require("../middlewares/validar-eliminado"));
const router = (0, express_1.default)();
exports.router = router;
router.post('/login', [
    (0, express_validator_1.check)('email', 'No es un correo valido').isString().matches(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
    (0, express_validator_1.check)('email').custom(db_validators_1.existeEmailAuth),
    (0, express_validator_1.check)('password', 'La contraseña debe tener minimo 5 caracteres, sin espacios en blanco').isString()
        .isLength({ min: 5 }).not().matches(/[' ']+/),
    validar_campos_1.default
], auth_1.iniciarSesion);
router.get('/renew', [
    validar_jwt_1.default,
    validar_eliminado_1.default
], auth_1.renovarToken);
//# sourceMappingURL=auth.js.map