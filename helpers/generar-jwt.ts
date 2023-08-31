import { ObjectId } from "mongoose";
import { UsuarioObjeto } from "../interfaces/usuario";
import jwt from 'jsonwebtoken';

// const generarJWT = (usuario: UsuarioObjeto) => {
const generarJWT = (id: ObjectId, nombre: string, apellido: string, rol: string[]): Promise<Error | string> => {
    return new Promise((resolve, reject) => {
        const payload = { id, nombre: `${nombre} ${apellido}`, rol };
        jwt.sign(payload, process.env.SECRET_JWT_SEED, {
            expiresIn: '2h'
        }, (err, token) => {
            if(err) {
                return reject('No se pudo agregar el token');
            }
            
            resolve(token);
        });
    });
};

export default generarJWT;