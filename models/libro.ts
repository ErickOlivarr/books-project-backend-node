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
    usuario: { //asi se pone una relacion de uno a muchos siendo este atributo el uno, ya que un libro puede tener un solo usuarios, y un usuario puede tener muchos libros, aunque en el modelo de usuario del archivo usuario.ts de la carpeta models no se le puso lo de sus libros, por lo tanto esta relacion es unidireccional, y si en el modelo del usuario hubieramos puesto sus libros entonces sería una relacion bidireccional, y en el modelo del usuario hubieramos puesto ese atributo de libros como un array asi como el atributo autores de abajo, pero si solo tiene uno y no muchos entonces el atributo se pone como un objeto como se puso aqui
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    autores: [ //asi se pone una relacion de muchos a muchos ya que un libro puede tener 1 o mas autores, y un autor puede tener muchos libros, y como vemos en mongodb no hace falta crear otra coleccion aparte para la relacion de muchos a muchos como pasa en mysql, y como un libro puede tener muchos autores por eso aqui se puso como un array como se explicó arriba, y esta relacion de libros y autores se puso de forma bidireccional porque en el modelo del autor en el archivo autor.ts de esta carpeta de models se puso tambien su atributo de libros para decir todos los libros que tiene el autor, igual como un array, asi se hace la relacion de muchos a muchos de forma bidireccional, y si fuera unidireccional pues aqui solo pondríamos los autores y en el modelo del autor no pondríamos sus libros o viceversa
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
        objeto.publicado = moment(createdAt).format('DD/MM/YYYY');
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