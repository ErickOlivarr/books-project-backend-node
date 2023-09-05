import { NextFunction, Request, Response } from "express";
import { Usuario } from "../models";
import { tokenUsuario } from "../interfaces/usuario";

const validarEliminado = async (req: Request, res: Response, next: NextFunction) => { //ponerlo despues del validarJWT en los routers
    
    const user = await Usuario.findById((req as any as tokenUsuario).payload.id);
    if(!user?.estado) {
        return res.status(401).json({
            ok: false,
            error: 'El usuario fue eliminado',
            cierre: true
        });
    }

    next();
};

export default validarEliminado;