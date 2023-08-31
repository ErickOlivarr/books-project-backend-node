import { NextFunction, Request, Response } from "express";
import Usuario from "../models/usuario";
import { tokenUsuario } from "../interfaces/usuario";

const validarEliminado = async (req: Request, res: Response, next: NextFunction) => { //ponerlo despues del validarJWT en los routers
    const { estado } = await Usuario.findById((req as any as tokenUsuario).payload.id);
    if(!estado) {
        return res.status(404).json({
            ok: false,
            error: 'El usuario fue eliminado'
        });
    }

    next();
};

export default validarEliminado;