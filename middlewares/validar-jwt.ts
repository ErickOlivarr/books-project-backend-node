import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';


const validarJWT = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('x-token');

    if(!token) {
        return res.status(400).json({
            ok: false,
            error: 'No se encuentra el token en el header'
        });
    }

    try {
        const payload = jwt.verify(token, process.env.SECRET_JWT_SEED);

        (req as any).payload = payload; //aqui se puso el req as any para que typescript me permitiera agregar dinamicamente el atributo de payload al objeto de req, y que en este punto req era de tipo Request como se ve arriba, y eso es un objeto y ese objeto es de express y pues ese objeto no tiene el [key: string] para que nos permita agregarle atributos dinamicamente como se explicó en el archivo usuario.ts de la carpeta interfaces, pero igual como se vio en ese archivo al ser de tipo any typescript sí me permite hacer esto sin que dé error en tiempo de compilacion, y pues ya en tiempo de ejecucion typescript sea como sea sí permite hacer esto como en javascript, solo es en tiempo de compilacion cuando sucede esto y por eso aqui se puso que sea de tipo any, esto se explica en el archivo usuario.ts de la carpeta interfaces
    
        next();
    } catch(err) {
        return res.status(401).json({ //si el token fue manipulado o si expiró (en el archivo generar-jwt.ts le dimos 1 hora para estar activo el jwt generado)
            ok: false,
            error: 'Token no valido'
        });
    }

};

export default validarJWT;