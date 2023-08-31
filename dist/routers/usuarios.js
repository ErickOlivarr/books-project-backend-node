"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const validar_campos_1 = __importDefault(require("../middlewares/validar-campos"));
const db_validators_1 = require("../helpers/usuarios-auth/db-validators");
const usuarios_1 = require("../controllers/usuarios");
const validar_jwt_1 = __importDefault(require("../middlewares/validar-jwt"));
const validar_eliminado_1 = __importDefault(require("../middlewares/validar-eliminado"));
const esRol_1 = __importDefault(require("../middlewares/esRol"));
const router = (0, express_1.default)();
exports.router = router;
router.post('/', [
    (0, express_validator_1.check)('nombre', 'El nombre es requerido').not().isEmpty(),
    (0, express_validator_1.check)('nombre', 'El nombre debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
        .isLength({ min: 3, max: 20 }),
    (0, express_validator_1.check)('apellido', 'El apellido es requerido').not().isEmpty(),
    (0, express_validator_1.check)('apellido', 'El apellido debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
        .isLength({ min: 3, max: 20 }),
    validar_campos_1.default,
    (0, express_validator_1.check)('nombre').custom(db_validators_1.existeNombreYApellido),
    (0, express_validator_1.check)('email', 'No es un correo valido').isString().matches(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
    //con lo de la anterior linea, tambien está el isEmail() para checar si es un email como se ha visto en el curso de node js, pero tambien para validar un email o otras cosas se puede checar con una expresion regular usando el matches del express-validator como se ve aqui, con esta expresion regular se checa tambien si es un correo valido, para eso sirve el matches del express-validator, para checar si coincide con una expresion regular
    (0, express_validator_1.check)('email').custom(db_validators_1.existeEmail),
    (0, express_validator_1.check)('password', 'La contraseña debe tener minimo 5 caracteres, sin espacios en blanco').isString()
        .isLength({ min: 5 }).not().matches(/[' ']+/),
    // check('rol').custom(esRolValido),
    (0, express_validator_1.check)('detalle.fechaNacimiento', 'No es fecha de nacimiento valida, con numero').isNumeric(),
    (0, express_validator_1.check)('detalle.fechaNacimiento', 'Debe ser un numero minimo de 0').isInt({ min: 0 }),
    validar_campos_1.default,
    (0, express_validator_1.check)('detalle.fechaNacimiento').custom(db_validators_1.esFechaValida),
    validar_campos_1.default
], usuarios_1.crearUsuario);
router.get('/', [
    validar_jwt_1.default,
    validar_eliminado_1.default,
    (0, esRol_1.default)('ROLE_ADMIN')
], usuarios_1.obtenerUsuarios);
router.get('/:id', [
    validar_jwt_1.default,
    validar_eliminado_1.default,
    (0, express_validator_1.check)('id', 'No es un id de mongo valido').isMongoId(),
    (0, express_validator_1.check)('id').custom(db_validators_1.existeId),
    validar_campos_1.default
], usuarios_1.obtenerUsuario);
router.put('/:id', [
    validar_jwt_1.default,
    validar_eliminado_1.default,
    (0, express_validator_1.check)('id', 'No es un id de mongo valido').isMongoId(),
    (0, express_validator_1.check)('id').custom(db_validators_1.existeId),
    (0, express_validator_1.check)('nombre', 'El nombre es requerido').not().isEmpty(),
    (0, express_validator_1.check)('nombre', 'El nombre debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
        .isLength({ min: 3, max: 20 }),
    (0, express_validator_1.check)('apellido', 'El apellido es requerido').not().isEmpty(),
    (0, express_validator_1.check)('apellido', 'El apellido debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
        .isLength({ min: 3, max: 20 }),
    validar_campos_1.default,
    (0, express_validator_1.check)('nombre').custom(db_validators_1.existeNombreYApellido),
    (0, express_validator_1.check)('passwordOld', 'La contraseña vieja debe tener minimo 5 caracteres, sin espacios en blanco').isString()
        .isLength({ min: 5 }).not().matches(/[' ']+/),
    (0, express_validator_1.check)('passwordNew', 'La contraseña nueva debe tener minimo 5 caracteres, sin espacios en blanco').isString()
        .isLength({ min: 5 }).not().matches(/[' ']+/),
    // check('rol').custom(esRolValido),
    (0, express_validator_1.check)('detalle.fechaNacimiento', 'No es fecha de nacimiento valida, con numero').isNumeric(),
    (0, express_validator_1.check)('detalle.fechaNacimiento', 'Debe ser un numero minimo de 0').isInt({ min: 0 }),
    validar_campos_1.default,
    (0, express_validator_1.check)('detalle.fechaNacimiento').custom(db_validators_1.esFechaValida),
    validar_campos_1.default
], usuarios_1.actualizarUsuario);
router.post('/rol', [
    validar_jwt_1.default,
    validar_eliminado_1.default,
    (0, esRol_1.default)('ROLE_ADMIN'),
    (0, express_validator_1.check)('rol', "Debe ser 'ROLE_ADMIN'").isString().equals('ROLE_ADMIN'),
    (0, express_validator_1.check)('ids').custom(db_validators_1.validarIds),
    validar_campos_1.default
], usuarios_1.actualizarUsuarioRol);
router.delete('/:id', [
    validar_jwt_1.default,
    validar_eliminado_1.default,
    (0, express_validator_1.check)('id', 'No es un id de mongo valido').isMongoId(),
    (0, express_validator_1.check)('id').custom(db_validators_1.existeId),
    validar_campos_1.default
], usuarios_1.borrarUsuario);
//# sourceMappingURL=usuarios.js.map