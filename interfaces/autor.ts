import { Document, ObjectId } from "mongoose";

export interface AutorObjeto {
    nombre: string;
    apellido: string;
    birthday?: string | number,
    libros?: Document<any>[],
    [ key: string ]: any;
};