import Router from 'express';
import { validarJWT, validarEliminado, validarCampos, validarIdsAurores } from '../middlewares';
import { check } from 'express-validator';
import { existeIdLibro } from '../helpers';
import { actualizarLibro, añadirFavorito, crearLibro, eliminarLibro, mostrarFotoLibro, obtenerFavoritos, obtenerLibro, obtenerLibros, subirFotoLibro } from '../controllers';

const router = Router();

router.use([ validarJWT, validarEliminado ]);

router.post('/', [
    check('nombre', 'El nombre es requerido').notEmpty(),
    check('nombre', 'El nombre debe ser un texto, minimo 2 letras, maximo 50').isString()
                                                                        .isLength({ min: 2, max: 50 }),
    check('isbn', 'El codigo isbn es requerido').trim().notEmpty(), //con el trim() no solo modifica el valor de este campo aqui para hacer la validacion, tambien llega asi con esa modificacion del trim() al controlador con el req.body
    check('isbn', 'Debe ser un codigo isbn de 5 caracteres').trim().isString().isLength({ min: 5, max: 5 }),
    check('autores', 'El array de id de autores es requerido y debe ser un array').notEmpty().isArray(),
    validarCampos,
    validarIdsAurores
], crearLibro);

router.put('/:id', [
    check('id', 'Debe ser un id de mongo valido y debe ser un libro que exista').isMongoId().custom(existeIdLibro),
    check('nombre', 'El nombre es requerido').notEmpty(),
    check('nombre', 'El nombre debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
                                                                        .isLength({ min: 3, max: 20 }),
    check('isbn', 'El codigo isbn es requerido').trim().notEmpty(),
    check('isbn', 'Debe ser un codigo isbn de 5 caracteres').trim().isString().isLength({ min: 5, max: 5 }),
    check('autores', 'El array de id de autores es requerido y debe ser un array').notEmpty().isArray(),
    check('favorito', 'Debe ser 1 o 0').isIn([ 1, 0 ]),
    validarCampos,
    validarIdsAurores
], actualizarLibro);

router.delete('/:id', [
    check('id', 'Debe ser un id de mongo valido y debe ser un libro que exista').isMongoId().custom(existeIdLibro),
    validarCampos
], eliminarLibro);

router.get('/', [
    //sin middlewares
], obtenerLibros);

router.get('/favoritos', [ //OJO que el orden en poner los endpoints importa ya que si este endpoint lo hubieramos puesto abajo del siguiente endpoint con el /:id y el GET entonces como ambos son con el metodo GET al poner en la url este endpoint que termina en favoritos entonces esa palabra de favoritos lo iba a tomar como el id, osea del endpoint de /:id la palabra favoritos la tomaría como si ese valor fuera el id ahí y pues se ejecutaría primero ese endpoint porque estaría primero aqui, asi que no podríamos acceder a este endpoint de /favoritos, por eso este endpoint se puso arriba del /:id de abajo para que primero cheque si pusimos esa palabra de favoritos y asi se ejecute este endpoint, y si no que entonces se ejecute el endpoint de abajo con el /:id
    //sin middlewares
], obtenerFavoritos);

router.get('/:id', [
    check('id', 'Debe ser un id de mongo valido y debe ser un libro que exista').isMongoId().custom(existeIdLibro),
    validarCampos
], obtenerLibro);

router.put('/favoritos/:id', [
    check('id', 'Debe ser un id de mongo valido y debe ser un libro que exista').isMongoId().custom(existeIdLibro),
    check('favorito', 'Debe ser 1 o 0').isIn([ 1, 0 ]),
    validarCampos
], añadirFavorito);

router.put('/uploads/:id', [
    check('id', 'Debe ser un id de mongo valido y debe ser un libro que exista').isMongoId().custom(existeIdLibro),
    validarCampos
], subirFotoLibro);

router.get('/uploads/:id', [
    check('id', 'Debe ser un id de mongo valido y debe ser un libro que exista').isMongoId().custom(existeIdLibro),
    validarCampos
], mostrarFotoLibro);


export { router };