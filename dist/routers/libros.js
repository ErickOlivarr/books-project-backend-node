"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const validar_jwt_1 = __importDefault(require("../middlewares/validar-jwt"));
const validar_eliminado_1 = __importDefault(require("../middlewares/validar-eliminado"));
const express_validator_1 = require("express-validator");
const db_validators_1 = require("../helpers/libros/db-validators");
const validar_campos_1 = __importDefault(require("../middlewares/validar-campos"));
const libros_1 = require("../controllers/libros");
const validar_arrayUsuarios_1 = require("../middlewares/validar-arrayUsuarios");
const router = (0, express_1.default)();
exports.router = router;
router.use([validar_jwt_1.default, validar_eliminado_1.default]);
router.post('/', [
    (0, express_validator_1.check)('nombre', 'El nombre es requerido').notEmpty(),
    (0, express_validator_1.check)('nombre', 'El nombre debe ser un texto, minimo 2 letras, maximo 50').isString()
        .isLength({ min: 2, max: 50 }),
    (0, express_validator_1.check)('isbn', 'El codigo isbn es requerido').trim().notEmpty(),
    (0, express_validator_1.check)('isbn', 'Debe ser un codigo isbn de 5 caracteres').trim().isString().isLength({ min: 5, max: 5 }),
    (0, express_validator_1.check)('autores', 'El array de id de autores es requerido y debe ser un array').notEmpty().isArray(),
    validar_campos_1.default,
    validar_arrayUsuarios_1.validarIdsAurores
], libros_1.crearLibro);
router.put('/:id', [
    (0, express_validator_1.check)('id', 'Debe ser un id de mongo valido y debe ser un libro que exista').isMongoId().custom(db_validators_1.existeId),
    (0, express_validator_1.check)('nombre', 'El nombre es requerido').notEmpty(),
    (0, express_validator_1.check)('nombre', 'El nombre debe ser un texto, minimo 3 letras, maximo 20').isString().matches(/[a-zA-Z]+/)
        .isLength({ min: 3, max: 20 }),
    (0, express_validator_1.check)('isbn', 'El codigo isbn es requerido').trim().notEmpty(),
    (0, express_validator_1.check)('isbn', 'Debe ser un codigo isbn de 5 caracteres').trim().isString().isLength({ min: 5, max: 5 }),
    (0, express_validator_1.check)('autores', 'El array de id de autores es requerido y debe ser un array').notEmpty().isArray(),
    (0, express_validator_1.check)('favorito', 'Debe ser 1 o 0').isIn([1, 0]),
    validar_campos_1.default,
    validar_arrayUsuarios_1.validarIdsAurores
], libros_1.actualizarLibro);
router.delete('/:id', [
    (0, express_validator_1.check)('id', 'Debe ser un id de mongo valido y debe ser un libro que exista').isMongoId().custom(db_validators_1.existeId),
    validar_campos_1.default
], libros_1.eliminarLibro);
router.get('/', [
//sin middlewares
], libros_1.obtenerLibros);
router.get('/favoritos', [ //OJO que el orden en poner los endpoints importa ya que si este endpoint lo hubieramos puesto abajo del siguiente endpoint con el /:id y el GET entonces como ambos son con el metodo GET al poner en la url este endpoint que termina en favoritos entonces esa palabra de favoritos lo iba a tomar como el id, osea del endpoint de /:id la palabra favoritos la tomaría como si ese valor fuera el id ahí y pues se ejecutaría primero ese endpoint porque estaría primero aqui, asi que no podríamos acceder a este endpoint de /favoritos, por eso este endpoint se puso arriba del /:id de abajo para que primero cheque si pusimos esa palabra de favoritos y asi se ejecute este endpoint, y si no que entonces se ejecute el endpoint de abajo con el /:id
//sin middlewares
], libros_1.obtenerFavoritos);
router.get('/:id', [
    (0, express_validator_1.check)('id', 'Debe ser un id de mongo valido y debe ser un libro que exista').isMongoId().custom(db_validators_1.existeId),
    validar_campos_1.default
], libros_1.obtenerLibro);
router.put('/favoritos/:id', [
    (0, express_validator_1.check)('id', 'Debe ser un id de mongo valido y debe ser un libro que exista').isMongoId().custom(db_validators_1.existeId),
    (0, express_validator_1.check)('favorito', 'Debe ser 1 o 0').isIn([1, 0]),
    validar_campos_1.default
], libros_1.añadirFavorito);
//# sourceMappingURL=libros.js.map