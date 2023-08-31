"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarIdsAurores = void 0;
const mongoose_1 = require("mongoose");
const autor_1 = __importDefault(require("../models/autor"));
const objectId = mongoose_1.Types.ObjectId;
const validarIdsAurores = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { autores } = req.body;
    const idArray = Array.from(new Set(autores)); //se eliminan repetidos en caso que se haya repetido ids en el array de autores
    if (idArray.length == 0 || !idArray.every(id => objectId.isValid(id) && typeof id === 'string')) {
        return res.status(400).json({
            ok: false,
            error: 'Debe ser un array con ids de mongo validos'
        });
    }
    const { id: idLogueado } = req.payload;
    const array = idArray.map(id => autor_1.default.findOne({ _id: id, usuario: idLogueado }));
    const resultArray = yield Promise.all([...array]);
    if (resultArray.some(result => result === null || result === undefined)) {
        return res.status(400).json({
            ok: false,
            error: 'Deben existir todos los ids en el array y deben pertenecer al usuario logueado'
        });
    }
    req.body.autores = idArray; //si todo salió bien arriba entonces se le pone al atributo autores del body el idArray que ya viene sin ids repetidos por lo que se hizo arriba con el Set
    next();
});
exports.validarIdsAurores = validarIdsAurores;
//# sourceMappingURL=validar-arrayUsuarios.js.map