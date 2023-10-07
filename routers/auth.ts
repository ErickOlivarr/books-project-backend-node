import Router from 'express';
import { iniciarSesion, renovarToken } from '../controllers';
import { check } from 'express-validator';
import { existeEmailAuth } from '../helpers';
import { validarCampos, validarJWT, validarEliminado, esRol } from '../middlewares';

const router = Router();

router.post('/login', [
    check('email', 'No es un correo valido').isString().matches(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
    check('email').custom(existeEmailAuth),
    check('password', 'La contraseña debe tener minimo 5 caracteres, sin espacios en blanco').isString()
                                                            .isLength({ min: 5 }).not().matches(/[' ']+/),
    validarCampos
], iniciarSesion);

router.get('/renew', [
    validarJWT,
    validarEliminado,
    esRol('ROLE_ADMIN', 'ROLE_USER')
], renovarToken);

export { router };

