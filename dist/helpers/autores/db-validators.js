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
exports.existeId = exports.existeNombreYApellido = void 0;
const models_1 = require("../../models");
const mongoose_1 = require("mongoose");
const __1 = require("../");
const objectId = mongoose_1.Types.ObjectId;
const existeNombreYApellido = (nombre, { req }) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { id: idLogueado } = req.payload;
    const metodo = req.method; //asi se puede saber el metodo http que invocamos al llegar a esta funcion
    nombre = (0, __1.capitalizar)(nombre);
    const apellido = (0, __1.capitalizar)(req.body.apellido);
    const autor = yield models_1.Autor.findOne({
        nombre,
        apellido,
        usuario: idLogueado,
        $or: [
            {
                $and: [
                    { $expr: { $eq: [metodo, 'PUT'] } },
                    {
                        $nor: [
                            {
                                _id: new objectId(id)
                            }
                        ]
                    }
                ]
            },
            {
                $and: [
                    { $expr: { $eq: [metodo, 'POST'] } }
                ]
            }
        ]
    });
    if (autor) {
        throw new Error('Existe autor con ese nombre y apellido');
    }
});
exports.existeNombreYApellido = existeNombreYApellido;
const existeId = (id, { req }) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: idLogueado } = req.payload;
    const autor = yield models_1.Autor.findById(id);
    if (!autor) {
        throw new Error('No existe un autor con este id');
    }
    if (autor.usuario.toString() != idLogueado) {
        throw new Error('No puede ver o modificar un autor que no le pertenece');
    }
    return true;
});
exports.existeId = existeId;
//# sourceMappingURL=db-validators.js.map