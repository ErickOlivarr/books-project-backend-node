import Router from 'express';
import { iniciarSesion, renovarToken } from '../controllers/auth';
import { check } from 'express-validator';
import { existeEmailAuth } from '../helpers/usuarios-auth/db-validators';
import validarCampos from '../middlewares/validar-campos';
import validarJWT from '../middlewares/validar-jwt';
import validarEliminado from '../middlewares/validar-eliminado';

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
    validarEliminado
], renovarToken);

export { router };

