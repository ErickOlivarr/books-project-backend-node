import { Types, ObjectId } from 'mongoose';
import { Autor } from '../models';
import { NextFunction, Request, Response } from 'express';
import { tokenUsuario } from '../interfaces/usuario';
const objectId = Types.ObjectId;

const validarIdsAurores = async (req: Request, res: Response, next: NextFunction) => {
    const { autores }: { autores: string[] } = req.body;

    const idArray = Array.from(new Set( autores )); //se eliminan repetidos en caso que se haya repetido ids en el array de autores

    if( idArray.length == 0 || !idArray.every(id => objectId.isValid(id) && typeof id === 'string') ) {
        return res.status(400).json({
            ok: false,
            error: 'Debe ser un array con ids de mongo validos'
        });
    }

    const { id: idLogueado } = (req as any as tokenUsuario).payload;

    const array = idArray.map(id => Autor.findOne({ _id: id, usuario: idLogueado }));

    const resultArray = await Promise.all([...array]);
    if( resultArray.some(result => result === null || result === undefined) ) {
        return res.status(400).json({
            ok: false,
            error: 'Deben existir todos los ids en el array y deben pertenecer al usuario logueado'
        });
    }

    req.body.autores = idArray; //si todo salió bien arriba entonces se le pone al atributo autores del body el idArray que ya viene sin ids repetidos por lo que se hizo arriba con el Set

    next();
};

export {
    validarIdsAurores
};