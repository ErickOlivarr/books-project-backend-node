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
Object.defineProperty(exports, "__esModule", { value: true });
exports.existeId = void 0;
const models_1 = require("../../models");
const existeId = (id, { req }) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: idLogueado } = req.payload;
    const libro = yield models_1.Libro.findById(id);
    if (!libro) {
        throw new Error('No existe un libro con este id');
    }
    if (libro.usuario.toString() != idLogueado) {
        throw new Error('No puede ver o modificar un libro que no le pertenece');
    }
    return true;
});
exports.existeId = existeId;
//# sourceMappingURL=db-validators.js.map