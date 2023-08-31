import { Document, ObjectId } from "mongoose";

export interface LibroObjeto {
    id?: ObjectId;
    nombre: string;
    isbn: string;
    usuario: Document<any>;
    autores: Document<any>[];
    favoritos?: number;
    [ key: string ]: any;
};