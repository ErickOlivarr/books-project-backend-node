import dotenv from 'dotenv';
import Server from './models/server';
dotenv.config();

const server = new Server();
server.listen();

//aqui se hizo un cambio para probar git y github
//otro cambio de prueba