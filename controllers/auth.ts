import { Request, Response } from "express";
import Usuario from "../models/usuario";
import bcrypt from 'bcryptjs';
import generarJWT from "../helpers/generar-jwt";
import { tokenUsuario } from "../interfaces/usuario";

const iniciarSesion = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email }, /*{ 
        id: true, nombre: true, apellido: true, password: true, detalle: true 
    }*/); //Asi como se comentó aqui se puede hacer proyecciones, tal como lo vimos en el curso de mongdb
    const { id, password: passResult, nombre, apellido, rol } = usuario;

    const passwordCoincide = bcrypt.compareSync(password, passResult);

    if(!passwordCoincide) {
        return res.status(400).json({
            ok: false,
            error: 'Email o contraseña incorrecta'
        });
    }

    const token = await generarJWT(id, nombre, apellido, rol);

    res.json({
        ok: true,
        data: usuario,
        token
    });
};

const renovarToken = async (req: Request, res: Response) => {
    const { payload: { id, nombre, apellido, rol } } = req as any as tokenUsuario;

    const token = await generarJWT(id, nombre, apellido, rol);

    res.json({
        ok: true,
        token
    });


};


export {
    iniciarSesion,
    renovarToken
};