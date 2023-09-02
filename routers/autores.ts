import Router from 'express';
import { validarJWT, validarEliminado, validarCampos } from '../middlewares';
import { actualizarAutor, crearAutor, eliminarAutor, obtenerAutor, obtenerAutores } from '../controllers';
import { check } from 'express-validator';
import { existeIdAutor, existeNombreYApellidoAutor } from '../helpers';

const router = Router();

router.use([validarJWT, validarEliminado]);

router.post('/', [
    check('nombre', 'El nombre es requerido').notEmpty(),
    check('apellido', 'El apellido es requerido').notEmpty(),
    check('nombre', 'El nombre debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
                                                                        .isLength({ min: 3, max: 20 }),
    check('apellido', 'El apellido debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
                                                                        .isLength({ min: 3, max: 20 }),
    validarCampos,
    check('nombre').custom(existeNombreYApellidoAutor),
    validarCampos
], crearAutor);

router.put('/:id', [
    check('id', 'Debe ser un id de mongo valido y debe ser un autor que exista').isMongoId().custom(existeIdAutor),
    check('nombre', 'El nombre es requerido').notEmpty(),
    check('apellido', 'El apellido es requerido').notEmpty(),
    check('nombre', 'El nombre debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
                                                                        .isLength({ min: 3, max: 20 }),
    check('apellido', 'El apellido debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
                                                                        .isLength({ min: 3, max: 20 }),
    validarCampos,
    check('nombre').custom(existeNombreYApellidoAutor),
    validarCampos
], actualizarAutor);

router.delete('/:id', [
    check('id', 'Debe ser un id de mongo valido y debe ser un autor que exista').isMongoId().custom(existeIdAutor),
    validarCampos
], eliminarAutor);

router.get('/', [
    //sin middlewares
], obtenerAutores);

router.get('/:id', [
    check('id', 'Debe ser un id de mongo valido y debe ser un autor que exista').isMongoId().custom(existeIdAutor),
    validarCampos
], obtenerAutor);


export { router };