import Router from 'express';
import validarJWT from '../middlewares/validar-jwt';
import validarEliminado from '../middlewares/validar-eliminado';
import { actualizarAutor, crearAutor, eliminarAutor, obtenerAutor, obtenerAutores } from '../controllers/autores';
import { check } from 'express-validator';
import validarCampos from '../middlewares/validar-campos';
import { existeId, existeNombreYApellido } from '../helpers/autores/db-validators';

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
    check('nombre').custom(existeNombreYApellido),
    validarCampos
], crearAutor);

router.put('/:id', [
    check('id', 'Debe ser un id de mongo valido y debe ser un autor que exista').isMongoId().custom(existeId),
    check('nombre', 'El nombre es requerido').notEmpty(),
    check('apellido', 'El apellido es requerido').notEmpty(),
    check('nombre', 'El nombre debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
                                                                        .isLength({ min: 3, max: 20 }),
    check('apellido', 'El apellido debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
                                                                        .isLength({ min: 3, max: 20 }),
    validarCampos,
    check('nombre').custom(existeNombreYApellido),
    validarCampos
], actualizarAutor);

router.delete('/:id', [
    check('id', 'Debe ser un id de mongo valido y debe ser un autor que exista').isMongoId().custom(existeId),
    validarCampos
], eliminarAutor);

router.get('/', [
    //sin middlewares
], obtenerAutores);

router.get('/:id', [
    check('id', 'Debe ser un id de mongo valido y debe ser un autor que exista').isMongoId().custom(existeId),
    validarCampos
], obtenerAutor);


export { router };