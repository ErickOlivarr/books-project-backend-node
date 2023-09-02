"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const middlewares_1 = require("../middlewares");
const helpers_1 = require("../helpers");
const controllers_1 = require("../controllers");
const router = (0, express_1.default)();
exports.router = router;
router.post('/', [
    (0, express_validator_1.check)('nombre', 'El nombre es requerido').not().isEmpty(),
    (0, express_validator_1.check)('nombre', 'El nombre debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
        .isLength({ min: 3, max: 20 }),
    (0, express_validator_1.check)('apellido', 'El apellido es requerido').not().isEmpty(),
    (0, express_validator_1.check)('apellido', 'El apellido debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
        .isLength({ min: 3, max: 20 }),
    middlewares_1.validarCampos,
    (0, express_validator_1.check)('nombre').custom(helpers_1.existeNombreYApellidoUsuario),
    (0, express_validator_1.check)('email', 'No es un correo valido').isString().matches(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
    //con lo de la anterior linea, tambien está el isEmail() para checar si es un email como se ha visto en el curso de node js, pero tambien para validar un email o otras cosas se puede checar con una expresion regular usando el matches del express-validator como se ve aqui, con esta expresion regular se checa tambien si es un correo valido, para eso sirve el matches del express-validator, para checar si coincide con una expresion regular
    (0, express_validator_1.check)('email').custom(helpers_1.existeEmail),
    (0, express_validator_1.check)('password', 'La contraseña debe tener minimo 5 caracteres, sin espacios en blanco').isString()
        .isLength({ min: 5 }).not().matches(/[' ']+/),
    // check('rol').custom(esRolValido),
    (0, express_validator_1.check)('detalle.fechaNacimiento', 'No es fecha de nacimiento valida, con numero').isNumeric(),
    (0, express_validator_1.check)('detalle.fechaNacimiento', 'Debe ser un numero minimo de 0').isInt({ min: 0 }),
    middlewares_1.validarCampos,
    (0, express_validator_1.check)('detalle.fechaNacimiento').custom(helpers_1.esFechaValidaUsuario),
    middlewares_1.validarCampos
], controllers_1.crearUsuario);
router.get('/', [
    middlewares_1.validarJWT,
    middlewares_1.validarEliminado,
    (0, middlewares_1.esRol)('ROLE_ADMIN')
], controllers_1.obtenerUsuarios);
router.get('/:id', [
    middlewares_1.validarJWT,
    middlewares_1.validarEliminado,
    (0, express_validator_1.check)('id', 'No es un id de mongo valido').isMongoId(),
    (0, express_validator_1.check)('id').custom(helpers_1.existeIdUsuario),
    middlewares_1.validarCampos
], controllers_1.obtenerUsuario);
router.put('/:id', [
    middlewares_1.validarJWT,
    middlewares_1.validarEliminado,
    (0, express_validator_1.check)('id', 'No es un id de mongo valido').isMongoId(),
    (0, express_validator_1.check)('id').custom(helpers_1.existeIdUsuario),
    (0, express_validator_1.check)('nombre', 'El nombre es requerido').not().isEmpty(),
    (0, express_validator_1.check)('nombre', 'El nombre debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
        .isLength({ min: 3, max: 20 }),
    (0, express_validator_1.check)('apellido', 'El apellido es requerido').not().isEmpty(),
    (0, express_validator_1.check)('apellido', 'El apellido debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
        .isLength({ min: 3, max: 20 }),
    middlewares_1.validarCampos,
    (0, express_validator_1.check)('nombre').custom(helpers_1.existeNombreYApellidoUsuario),
    (0, express_validator_1.check)('passwordOld', 'La contraseña vieja debe tener minimo 5 caracteres, sin espacios en blanco').isString()
        .isLength({ min: 5 }).not().matches(/[' ']+/),
    (0, express_validator_1.check)('passwordNew', 'La contraseña nueva debe tener minimo 5 caracteres, sin espacios en blanco').isString()
        .isLength({ min: 5 }).not().matches(/[' ']+/),
    // check('rol').custom(esRolValido),
    (0, express_validator_1.check)('detalle.fechaNacimiento', 'No es fecha de nacimiento valida, con numero').isNumeric(),
    (0, express_validator_1.check)('detalle.fechaNacimiento', 'Debe ser un numero minimo de 0').isInt({ min: 0 }),
    middlewares_1.validarCampos,
    (0, express_validator_1.check)('detalle.fechaNacimiento').custom(helpers_1.esFechaValidaUsuario),
    middlewares_1.validarCampos
], controllers_1.actualizarUsuario);
router.post('/rol', [
    middlewares_1.validarJWT,
    middlewares_1.validarEliminado,
    (0, middlewares_1.esRol)('ROLE_ADMIN'),
    (0, express_validator_1.check)('rol', "Debe ser 'ROLE_ADMIN'").isString().equals('ROLE_ADMIN'),
    (0, express_validator_1.check)('ids').custom(helpers_1.validarIds),
    middlewares_1.validarCampos
], controllers_1.actualizarUsuarioRol);
router.delete('/:id', [
    middlewares_1.validarJWT,
    middlewares_1.validarEliminado,
    (0, express_validator_1.check)('id', 'No es un id de mongo valido').isMongoId(),
    (0, express_validator_1.check)('id').custom(helpers_1.existeIdUsuario),
    middlewares_1.validarCampos
], controllers_1.borrarUsuario);
router.put('/uploads/:id', [
    (0, express_validator_1.check)('id', 'Debe ser un id de mongo valido y debe ser un usuario que exista').isMongoId().custom(helpers_1.existeIdUsuario),
    middlewares_1.validarCampos
], controllers_1.subirFotoUsuario);
router.get('/uploads/:id', [
    (0, express_validator_1.check)('id', 'Debe ser un id de mongo valido y debe ser un usuario que exista').isMongoId().custom(helpers_1.existeIdUsuario),
    middlewares_1.validarCampos
], controllers_1.mostrarFotoUsuario);
//# sourceMappingURL=usuarios.js.map