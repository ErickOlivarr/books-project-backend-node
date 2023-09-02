import { NextFunction, Request, Response } from "express";
import { tokenUsuario } from "../interfaces/usuario";
import { Usuario } from "../models";

const esRol = (...rol: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { rol: rolUsuario } = await Usuario.findById((req as any as tokenUsuario).payload.id);
        if( !rol.some((rolElement: string) => (rolUsuario as string[]).includes(rolElement)) ) {
            return res.status(403).json({
                ok: false,
                error: 'Su rol no tiene acceso a este recurso'
            });
        }

        next();

    };
};

export default esRol;