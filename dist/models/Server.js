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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("../db/config");
const routers_1 = require("../routers");
const express_fileupload_1 = __importDefault(require("express-fileupload"));
class Server {
    constructor() {
        this.paths = {
            auth: '/api/auth',
            usuarios: '/api/usuarios',
            libros: '/api/libros',
            autores: '/api/autores'
        };
        this.dbConexion = () => __awaiter(this, void 0, void 0, function* () {
            yield (0, config_1.conexion)();
        });
        this.middlewares = () => {
            this.app.use((0, cors_1.default)());
            this.app.use(express_1.default.json());
            this.app.use(express_1.default.static('public'));
            this.app.use((0, express_fileupload_1.default)({
                useTempFiles: true,
                tempFileDir: '/tmp/',
                //limits: { fileSize: 50 * 1024 * 1024 } //esto tambien se puede poner opcionalmente para ponerle un limite de tamño a los archivos que carguemos
                createParentPath: true //esto es opcional ponerlo para guardar archivos, y esto hace que si no existe la carpeta sobre la que queremos guardar el archivo que se cree automaticamente, esto por default está en false y eso significa que tenemos que crear las carpetas donde guardaremos los archivos manualmente, pero con esto en true pues crea esa carpeta automaticamente en caso que no exista y si existe pues no hace nada
            }));
        };
        this.rutas = () => {
            this.app.use(this.paths.auth, routers_1.authRouter);
            this.app.use(this.paths.usuarios, routers_1.usuarioRouter);
            this.app.use(this.paths.libros, routers_1.libroRouter);
            this.app.use(this.paths.autores, routers_1.autorRouter);
        };
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || '8000';
        this.dbConexion();
        this.middlewares();
        this.rutas();
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`Puerto corriengo en: ${this.port}`);
        });
    }
}
exports.default = Server;
//# sourceMappingURL=server.js.map