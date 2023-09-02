import { ObjectId } from "mongoose";
import { Libro } from "../../models";
import { tokenUsuario } from "../../interfaces/usuario";

const existeId = async (id: ObjectId, { req }) => {
    const { id: idLogueado } = (req as tokenUsuario).payload;
    
    const libro = await Libro.findById(id);
    if(!libro) {
        throw new Error('No existe un libro con este id');
    }

    if( libro.usuario.toString() != (idLogueado as any as string) ) {
        throw new Error('No puede ver o modificar un libro que no le pertenece');
    }

    return true;
};

export {
    existeId
};