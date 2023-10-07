"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../middlewares");
const controllers_1 = require("../controllers");
const express_validator_1 = require("express-validator");
const helpers_1 = require("../helpers");
const router = (0, express_1.default)();
exports.router = router;
router.use([middlewares_1.validarJWT, middlewares_1.validarEliminado, (0, middlewares_1.esRol)('ROLE_ADMIN', 'ROLE_USER'),]);
router.post('/', [
    (0, express_validator_1.check)('nombre', 'El nombre es requerido').notEmpty(),
    (0, express_validator_1.check)('apellido', 'El apellido es requerido').notEmpty(),
    (0, express_validator_1.check)('nombre', 'El nombre debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
        .isLength({ min: 3, max: 20 }),
    (0, express_validator_1.check)('apellido', 'El apellido debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
        .isLength({ min: 3, max: 20 }),
    middlewares_1.validarCampos,
    (0, express_validator_1.check)('nombre').custom(helpers_1.existeNombreYApellidoAutor),
    middlewares_1.validarCampos
], controllers_1.crearAutor);
router.put('/:id', [
    (0, express_validator_1.check)('id', 'Debe ser un id de mongo valido y debe ser un autor que exista').isMongoId().custom(helpers_1.existeIdAutor),
    (0, express_validator_1.check)('nombre', 'El nombre es requerido').notEmpty(),
    (0, express_validator_1.check)('apellido', 'El apellido es requerido').notEmpty(),
    (0, express_validator_1.check)('nombre', 'El nombre debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
        .isLength({ min: 3, max: 20 }),
    (0, express_validator_1.check)('apellido', 'El apellido debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
        .isLength({ min: 3, max: 20 }),
    middlewares_1.validarCampos,
    (0, express_validator_1.check)('nombre').custom(helpers_1.existeNombreYApellidoAutor),
    middlewares_1.validarCampos
], controllers_1.actualizarAutor);
router.delete('/:id', [
    (0, express_validator_1.check)('id', 'Debe ser un id de mongo valido y debe ser un autor que exista').isMongoId().custom(helpers_1.existeIdAutor),
    middlewares_1.validarCampos
], controllers_1.eliminarAutor);
router.get('/', [
//sin middlewares
], controllers_1.obtenerAutores);
router.get('/:id', [
    (0, express_validator_1.check)('id', 'Debe ser un id de mongo valido y debe ser un autor que exista').isMongoId().custom(helpers_1.existeIdAutor),
    middlewares_1.validarCampos
], controllers_1.obtenerAutor);
//# sourceMappingURL=autores.js.map