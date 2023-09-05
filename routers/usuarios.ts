import Router from 'express';
import { check } from 'express-validator';
import { validarCampos, validarJWT, validarEliminado, esRol } from '../middlewares';
import { esFechaValidaUsuario, esRolValido, existeEmail, existeIdUsuario, existeNombreYApellidoUsuario, validarIds } from '../helpers';
import { actualizarUsuario, actualizarUsuarioRol, borrarUsuario, validarUsuarioCreado, crearUsuarioYEnviarEmail, mostrarFotoUsuario, obtenerUsuario, obtenerUsuarios, subirFotoUsuario, reenviarCorreo } from '../controllers';


const router = Router();

router.post('/email/crear', [ //este endpoint antes era para crear un usuario antes de añadirle lo del nodemailer
    check('nombre', 'El nombre es requerido').not().isEmpty(),
    check('nombre', 'El nombre debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
                                                                        .isLength({ min: 3, max: 20 }),
    check('apellido', 'El apellido es requerido').not().isEmpty(),
    check('apellido', 'El apellido debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
                                                                        .isLength({ min: 3, max: 20 }),
    validarCampos,
    check('nombre').custom(existeNombreYApellidoUsuario),
    check('email', 'No es un correo valido').trim().isString().matches(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/), 
    //con lo de la anterior linea, tambien está el isEmail() para checar si es un email como se ha visto en el curso de node js, pero tambien para validar un email o otras cosas se puede checar con una expresion regular usando el matches del express-validator como se ve aqui, con esta expresion regular se checa tambien si es un correo valido, para eso sirve el matches del express-validator, para checar si coincide con una expresion regular
    check('email').custom(existeEmail),
    check('password', 'La contraseña debe tener minimo 5 caracteres, sin espacios en blanco').isString()
                                                            .isLength({ min: 5 }).not().matches(/[' ']+/),
    // check('rol').custom(esRolValido),
    check('detalle.fechaNacimiento', 'No es fecha de nacimiento valida, con numero').isNumeric(),
    check('detalle.fechaNacimiento', 'Debe ser un numero minimo de 0').isInt({ min: 0 }),
    validarCampos,
    check('detalle.fechaNacimiento').custom(esFechaValidaUsuario),
    check('baseUrl', 'La baseUrl se debe proporcionar y debe ser un string').isString(),
    validarCampos
], crearUsuarioYEnviarEmail);

router.post('/', [
    validarJWT,
    validarEliminado
], validarUsuarioCreado);

router.post('/email/reenviar', [
    check('baseUrl', 'La baseUrl se debe proporcionar y debe ser un string').isString(),
    validarCampos
], reenviarCorreo);

router.get('/', [
    validarJWT,
    validarEliminado,
    esRol('ROLE_ADMIN')
], obtenerUsuarios);

router.get('/:id', [
    validarJWT,
    validarEliminado,
    check('id', 'No es un id de mongo valido').isMongoId(),
    check('id').custom(existeIdUsuario),
    validarCampos
], obtenerUsuario);

router.put('/:id', [
    validarJWT,
    validarEliminado,
    check('id', 'No es un id de mongo valido').isMongoId(),
    check('id').custom(existeIdUsuario),
    check('nombre', 'El nombre es requerido').not().isEmpty(),
    check('nombre', 'El nombre debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
                                                                        .isLength({ min: 3, max: 20 }),
    check('apellido', 'El apellido es requerido').not().isEmpty(),
    check('apellido', 'El apellido debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
                                                                        .isLength({ min: 3, max: 20 }),
    validarCampos,
    check('nombre').custom(existeNombreYApellidoUsuario),
    check('passwordOld', 'La contraseña vieja debe tener minimo 5 caracteres, sin espacios en blanco').isString()
                                                            .isLength({ min: 5 }).not().matches(/[' ']+/),
    check('passwordNew', 'La contraseña nueva debe tener minimo 5 caracteres, sin espacios en blanco').isString()
                                                            .isLength({ min: 5 }).not().matches(/[' ']+/),
    // check('rol').custom(esRolValido),
    check('detalle.fechaNacimiento', 'No es fecha de nacimiento valida, con numero').isNumeric(),
    check('detalle.fechaNacimiento', 'Debe ser un numero minimo de 0').isInt({ min: 0 }),
    validarCampos,
    check('detalle.fechaNacimiento').custom(esFechaValidaUsuario),
    validarCampos
], actualizarUsuario);

router.post('/rol', [ 
    validarJWT,
    validarEliminado,
    esRol('ROLE_ADMIN'),
    check('rol', "Debe ser 'ROLE_ADMIN'").isString().equals('ROLE_ADMIN'),
    check('ids').custom(validarIds),
    validarCampos
 ], actualizarUsuarioRol);

router.delete('/:id', [
    validarJWT,
    validarEliminado,
    check('id', 'No es un id de mongo valido').isMongoId(),
    check('id').custom(existeIdUsuario),
    validarCampos
], borrarUsuario);

router.put('/uploads/:id', [
    validarJWT,
    validarEliminado,
    check('id', 'Debe ser un id de mongo valido y debe ser un usuario que exista').isMongoId().custom(existeIdUsuario),
    validarCampos
], subirFotoUsuario);

router.get('/uploads/:id', [
    validarJWT,
    validarEliminado,
    check('id', 'Debe ser un id de mongo valido y debe ser un usuario que exista').isMongoId().custom(existeIdUsuario),
    validarCampos
], mostrarFotoUsuario);


export { router };