"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const validar_jwt_1 = __importDefault(require("../middlewares/validar-jwt"));
const validar_eliminado_1 = __importDefault(require("../middlewares/validar-eliminado"));
const autores_1 = require("../controllers/autores");
const express_validator_1 = require("express-validator");
const validar_campos_1 = __importDefault(require("../middlewares/validar-campos"));
const db_validators_1 = require("../helpers/autores/db-validators");
const router = (0, express_1.default)();
exports.router = router;
router.use([validar_jwt_1.default, validar_eliminado_1.default]);
router.post('/', [
    (0, express_validator_1.check)('nombre', 'El nombre es requerido').notEmpty(),
    (0, express_validator_1.check)('apellido', 'El apellido es requerido').notEmpty(),
    (0, express_validator_1.check)('nombre', 'El nombre debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
        .isLength({ min: 3, max: 20 }),
    (0, express_validator_1.check)('apellido', 'El apellido debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
        .isLength({ min: 3, max: 20 }),
    validar_campos_1.default,
    (0, express_validator_1.check)('nombre').custom(db_validators_1.existeNombreYApellido),
    validar_campos_1.default
], autores_1.crearAutor);
router.put('/:id', [
    (0, express_validator_1.check)('id', 'Debe ser un id de mongo valido y debe ser un autor que exista').isMongoId().custom(db_validators_1.existeId),
    (0, express_validator_1.check)('nombre', 'El nombre es requerido').notEmpty(),
    (0, express_validator_1.check)('apellido', 'El apellido es requerido').notEmpty(),
    (0, express_validator_1.check)('nombre', 'El nombre debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
        .isLength({ min: 3, max: 20 }),
    (0, express_validator_1.check)('apellido', 'El apellido debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
        .isLength({ min: 3, max: 20 }),
    validar_campos_1.default,
    (0, express_validator_1.check)('nombre').custom(db_validators_1.existeNombreYApellido),
    validar_campos_1.default
], autores_1.actualizarAutor);
router.delete('/:id', [
    (0, express_validator_1.check)('id', 'Debe ser un id de mongo valido y debe ser un autor que exista').isMongoId().custom(db_validators_1.existeId),
    validar_campos_1.default
], autores_1.eliminarAutor);
router.get('/', [
//sin middlewares
], autores_1.obtenerAutores);
router.get('/:id', [
    (0, express_validator_1.check)('id', 'Debe ser un id de mongo valido y debe ser un autor que exista').isMongoId().custom(db_validators_1.existeId),
    validar_campos_1.default
], autores_1.obtenerAutor);
//# sourceMappingURL=autores.js.map