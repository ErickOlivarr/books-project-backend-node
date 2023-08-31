import moment from "moment";
import { Schema, model } from "mongoose";

const AutorSchema = new Schema({
    nombre: {
        type: String,
        required: [ true, 'El nombre es requerido' ]
    },
    apellido: {
        type: String,
        required: [ true, 'El apellido es requerido' ]
    },
    birthday: {
        type: Date,
        default: null
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    libros: [
        { type: Schema.Types.ObjectId, ref: 'Libro' }
    ]
});

AutorSchema.index({
    nombre: 1,
    apellido: 1,
    usuario: 1
}, {
    unique: true
});


AutorSchema.method('toJSON', function() {
    const { _id, __v, nombre, apellido, usuario, libros, birthday, ...objeto } = this.toObject();

    objeto.id = _id;
    objeto.nombre = nombre + ' ' + apellido;
    if(libros) {
        objeto.libros = libros.map(l => ({ id: l._id, nombre: l.nombre }));
    }
    if(birthday) {
        objeto.birthday = (birthday) ? moment(birthday).add(6, 'hours').format('DD/MM/YYYY') : null;
    }

    return objeto;
});


export default model('Autor', AutorSchema);