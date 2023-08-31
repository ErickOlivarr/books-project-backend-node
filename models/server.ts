import express, { Application } from 'express';
import cors from 'cors';
import { conexion } from '../db/config';
import { autorRouter, libroRouter, usuarioRouter, authRouter } from '../routers'

class Server {

    private app: Application;
    private port: string;
    private paths = {
        auth: '/api/auth',
        usuarios: '/api/usuarios',
        libros: '/api/libros',
        autores: '/api/autores'
    };

    constructor() {
        this.app = express();
        this.port = process.env.PORT || '8000';

        this.dbConexion();

        this.middlewares();

        this.rutas();

    }

    private dbConexion = async () => {
        await conexion();
    };

    private middlewares = () => {
        this.app.use(cors());

        this.app.use(express.json());

        this.app.use(express.static('public'));
    };

    private rutas = () => {
        this.app.use( this.paths.auth, authRouter );
        this.app.use( this.paths.usuarios, usuarioRouter );
        this.app.use( this.paths.libros, libroRouter );
        this.app.use( this.paths.autores, autorRouter );
    };

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`Puerto corriengo en: ${this.port}`);
        });
    }


}

export default Server;