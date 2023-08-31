"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = exports.usuarioRouter = exports.libroRouter = exports.autorRouter = void 0;
const autores_1 = require("./autores");
Object.defineProperty(exports, "autorRouter", { enumerable: true, get: function () { return autores_1.router; } });
const libros_1 = require("./libros");
Object.defineProperty(exports, "libroRouter", { enumerable: true, get: function () { return libros_1.router; } });
const usuarios_1 = require("./usuarios");
Object.defineProperty(exports, "usuarioRouter", { enumerable: true, get: function () { return usuarios_1.router; } });
const auth_1 = require("./auth");
Object.defineProperty(exports, "authRouter", { enumerable: true, get: function () { return auth_1.router; } });
//# sourceMappingURL=index.js.map