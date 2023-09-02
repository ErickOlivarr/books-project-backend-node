import moment from "moment";
import { Schema, model } from "mongoose";

const LibroSchema = new Schema({
    nombre: {
        type: String,
        // unique: true,
        required: [ true, 'El nombre es requerido' ]
    },
    isbn: {
        type: String,
        required: [ true, 'El codigo isbn es requerido' ],
        // unique: true
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    autores: [
        { type: Schema.Types.ObjectId, ref: 'Autor', required: [ true, 'Debes asignarle autores al libro' ] }
    ],
    favorito: {
        type: Number,
        required: true,
        enum: [ 1, 0 ]
    },
    img: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});


LibroSchema.index({
    nombre: 1,
    usuario: 1
}, {
    unique: true
});

LibroSchema.index({
    isbn: 1,
    usuario: 1
}, {
    unique: true
});


LibroSchema.method('toJSON', function() {
    const { _id, __v, createdAt, updatedAt, ...objeto } = this.toObject();
    objeto.id = _id;
    if(createdAt) {
        objeto.publicado = moment(createdAt).add(6, 'hours').format('DD/MM/YYYY');
    }

    if(objeto.usuario?.nombre) { //si se hizo el populate con el atributo de relacion usuario
        objeto.usuario.id = objeto.usuario._id;
        objeto.usuario.nombre = `${objeto.usuario.nombre} ${objeto.usuario.apellido}`;
        delete objeto.usuario._id;
        delete objeto.usuario.apellido;
    }
    else {
        delete objeto.usuario;
    }

    if(objeto.autores) {
        objeto.autores = objeto.autores.map(autor => {
            const object: { [key:string]: any } = {};
            if(autor.nombre) {
                object.id = autor._id;
                object.nombre = `${autor.nombre} ${autor.apellido}`;
                // if(autor.usuario?.nombre) {
                //     const {_id, apellido, ...userObj} = autor.usuario;
                //     object.usuario = {...userObj};
                //     object.usuario.nombre = `${userObj.nombre} ${apellido}`;
                //     object.usuario.id = _id;
                // }
            }
            return object;
        });
    }

    return objeto;

});

export default model('Libro', LibroSchema);