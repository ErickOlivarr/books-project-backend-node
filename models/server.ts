import express, { Application } from 'express';
import cors from 'cors';
import { conexion } from '../db/config';
import { autorRouter, libroRouter, usuarioRouter, authRouter } from '../routers'
import fileUpload from 'express-fileupload';

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

        this.app.use(fileUpload({
            useTempFiles : true, //esto es obligatorio ponerlo para guardar archivos
            tempFileDir : '/tmp/', //esto es obligatorio ponerlo para guardar archivos
            //limits: { fileSize: 50 * 1024 * 1024 } //esto tambien se puede poner opcionalmente para ponerle un limite de tamño a los archivos que carguemos
            createParentPath: true //esto es opcional ponerlo para guardar archivos, y esto hace que si no existe la carpeta sobre la que queremos guardar el archivo que se cree automaticamente, esto por default está en false y eso significa que tenemos que crear las carpetas donde guardaremos los archivos manualmente, pero con esto en true pues crea esa carpeta automaticamente en caso que no exista y si existe pues no hace nada
        }));
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