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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validarJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.header('x-token');
    if (!token) {
        return res.status(400).json({
            ok: false,
            error: 'No se encuentra el token en el header'
        });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.SECRET_JWT_SEED);
        req.payload = payload; //aqui se puso el req as any para que typescript me permitiera agregar dinamicamente el atributo de payload al objeto de req, y que en este punto req era de tipo Request como se ve arriba, y eso es un objeto y ese objeto es de express y pues ese objeto no tiene el [key: string] para que nos permita agregarle atributos dinamicamente como se explicó en el archivo usuario.ts de la carpeta interfaces, pero igual como se vio en ese archivo al ser de tipo any typescript sí me permite hacer esto sin que dé error en tiempo de compilacion, y pues ya en tiempo de ejecucion typescript sea como sea sí permite hacer esto como en javascript, solo es en tiempo de compilacion cuando sucede esto y por eso aqui se puso que sea de tipo any, esto se explica en el archivo usuario.ts de la carpeta interfaces
        next();
    }
    catch (err) {
        return res.status(401).json({
            ok: false,
            error: 'Token no valido',
            cierre: true
        });
    }
});
exports.default = validarJWT;
//# sourceMappingURL=validar-jwt.js.map