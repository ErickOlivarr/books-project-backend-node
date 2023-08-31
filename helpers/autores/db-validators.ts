import Autor from "../../models/autor";
import { tokenUsuario } from "../../interfaces/usuario";
import { Types, ObjectId, Schema } from 'mongoose';
import { capitalizar } from "../funciones";
import { AutorObjeto } from "../../interfaces/autor";
const objectId = Types.ObjectId;

const existeNombreYApellido = async (nombre: string, {req}) => {
    const { id } = req.params;
    const { id: idLogueado } = (req as tokenUsuario).payload;
    const metodo: string = req.method; //asi se puede saber el metodo http que invocamos al llegar a esta funcion
    nombre = capitalizar(nombre);
    const apellido = capitalizar((req.body as AutorObjeto).apellido);

    const autor = await Autor.findOne({ 
        nombre,
        apellido,
        usuario: idLogueado,
        $or: [
            {
                $and: [
                    { $expr: { $eq: [ metodo, 'PUT' ] } },
                    {
                        $nor: [
                            {
                                _id: new objectId(id) 
                            }
                        ]
                    }
                ]
            },
            {
                $and: [
                    { $expr: { $eq: [ metodo, 'POST' ] } }
                ]
            }
        ]
    });


    if(autor) {
        throw new Error('Existe autor con ese nombre y apellido');
    }

};

const existeId = async (id: ObjectId, { req }) => {
    const { id: idLogueado } = (req as tokenUsuario).payload;
    
    const autor = await Autor.findById(id);
    if(!autor) {
        throw new Error('No existe un autor con este id');
    }

    if( autor.usuario.toString() != (idLogueado as any as string) ) {
        throw new Error('No puede ver o modificar un autor que no le pertenece');
    }

    return true;
};

export {
    existeNombreYApellido,
    existeId
};