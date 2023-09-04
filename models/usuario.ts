import { Schema, model } from 'mongoose';
import moment from 'moment';
import { Autor, Libro } from './';
import { Types, } from 'mongoose';
const objectId = Types.ObjectId;


const UsuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido']
    },
    apellido: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        // unique: true //se comentó esto porque aqui eliminamos gracias a poner el atributo estado en true, no eliminar el documento fisicamente de la coleccion, pero al hacerlo asi entonces para checar en el archivo db-validators.ts de la carpeta helpers/usuarios-auth debemos hacer el filtro si el estado es true al checar si ya existe ese email o la combinacion del nombre y apellido (mas abajo se puso ese unique con la combinacion de esos 2 campos), pero entonces si tenemos aqui el unique en esos campos y un usuario se eliminó entonces ese usuario seguirá existiendo en la base de datos pero su atributo de estado será en false, pero ese email y combinacion de nombre y apellido ahi seguirá, y como en el db-validators.ts hacemos esas validaciones junto con el estado en true (porque se debe tomar en cuenta solo a los usuarios activos, no a los eliminados para saber si ese email existe o no y asi) entonces ahi no se detectará que ese email o combinacion de nombre y apellido existe por el filtro de estado en true, esto al crear un usuario, y entonces al final se podría intentar guardar en base de datos pero daría un error por esto del unique aqui, porque para la coleccion ese email seguirá existiendo pues, y otra manera de hacerlo sería sí ponerle aqui lo del unique y en el db.validators.ts no checar si el estado está en true cuando se hacen esas validaciones, y asi entonces si existe aunque ya tenga el estado en false (aunque ya haya sido eliminado) se hará esa validacion y entonces si ya se eliminó un usuario con ese email pues ya no se podrá crear otro usuario con ese mismo email ni con esa misma combinacion de nombre y apellido, podríamos hacerlo asi aunque para este proyecto no queremos eso, queremos que si se borra ese usuario que se pueda crear otro usuario con ese mismo email que tenía o combinacion de nombre y apellido, como si hicieramos el borrado fisicamente de la base de datos y no solo con el atributo de estado pues, ya que asi se comportaría de esa manera, asi que por eso debemos poner que se valide tambien considerando el estado en true en el archivo db-validators.ts, y por eso debemos quitar aqui el unique porque si lo dejamos podríamos tener ese problema que se explicó, por eso aqui comentamos esto y tambien por eso comentamos lo del UsuarioSchema.index para poner el unique en la combinacion del nombre y apellido mas abajo. Esto tambien aplica para el actualizar el usuario ya que con la actualizacion tambien podría chocar la combinacion del nombre y apellido si dejamos lo del unique mas abajo. Aunque con las validaciones puestas en el db-validators.ts nos aseguramos que solo haya 1 solo usuario con ese email o combinacion de nombre y apellido, asi que esto del unique aqui no hará falta
    },
    password: {
        type: String,
        required: true,
    },
    estado: {
        type: Boolean,
        default: true
    },
    //NOTA: Con los siguientes 2 roles si le pasamos un string en el atributo rol del body al crear un usuario, lo guarda como un array de string, solo que el primero tiene la validacion del enum y el segundo no. Y si le mandamos un array en el atributo rol del body pues ese array lo va a guardar, siempre y cuando cumpla con los valores del enum dentro del array. Para declarar un array de string no se puede poner por ejemplo string[] o string[2], eso no se puede hacer, se debe declarar los arrays de esta forma
    rol: [ { type: String, enum: ['ROLE_ADMIN', 'ROLE_USER', 'ROLE_NUEVO'] } ], //asi tenemos que un atributo será un array de strings, esto debido a que en este caso el usuario podrá tener mas de 1 rol
    // rol: [String]
    detalle: { //NOTA: Aqui se puso un objeto anidado de detalle, esto se puede hacer en mongodb porque pues los documentos son practicamente objetos literales o JSON, y asi podemos hacer una alternativa a la relacion de one to one por ejemplo, aunque si en este objeto de detalle tuvieramos muchos atributos pudieramos crear una coleccion aparte (modelo aparte) del detalle de los usuarios y ya aqui ponerlo como un id como se vio en el curso de node js con las relaciones entre colecciones, tambien podríamos hacer eso, pero como en este caso son pocos atributos pues lo hicimos de esta forma creando un objeto anidado en los documentos del usuario llamado detalle. Este tipo de relacion que pusimos aqui con un objeto anidado se llama Modelo de datos integrados (Desnormalizacion) y es menos recomendado pero funciona bien cuando hay pocos atributos en el objeto anidado como se dijo anteriormente, y si ponemos aqui el id de otro esquema o coleccion como referencia como lo visto en el curso de node js o en mysql por ejemplo eso se llama Modelo de datos referenciados (Normalizacion), y esta ultima es la forma mas recomendada, aunque en este caso se hizo de esta manera con la Desnormalizacion porque pues teníamos pocos atributos en el detalle del usuario
        fechaNacimiento: {
            type: Date,
            required: true,
            //asi se puede hacer validaciones en los campos, como se ve abajo comentado, pero se comentó porque mejor usamos el metodo pre con el validate que está mas abajo, asi igual podemos hacer validaciones personalizadas pero justo antes de guardarse en la base de datos, mas abajo se ve eso
            // validate: {
            //     validator: validarFecha,
            //     message: ({ value }) => `el valor ${value} no es una fecha valida`
            // }
        },
        peso: {
            type: Number,
            default: 0
        },
    },
    img: {
        type: String,
        default: null
    }

}, {
    timestamps: true
});


type numero = number;

//la siguiente funcion fue un ejemplo de una forma de hacer validaciones en un campo que se vio arriba
function validarFecha(valor: any) {
    if(Number.isNaN(valor)) return false;
    if(!moment.isDate(valor) || (valor as unknown as numero) > Date.now()) return false;

    return true;
}


//NOTA: con lo siguiente se hace que 2 campos en combinacion sean unicos, no cada uno por separado sino la combinacion de esos 2, de modo que no podrá haber usuarios con la misma combinacion de nombre y apellido, pueden tener el mismo nombre o el mismo apellido pero nunca la combinacion de esos 2 repetidos
//lo siguiente se comentó por lo que se explicó arriba en el atributo email al comentar el unique ahí, checarlo
// UsuarioSchema.index({
//     nombre: 1,
//     apellido: 1
// }, {
//     unique: true
// });


UsuarioSchema.pre('validate', function(next) { //esto se ejecuta justo antes de guardar en la base de datos y como vemos abajo se puede usar con el this los valores que tendrá el documento justo antes de guardarse en base de datos, como para hacer validaciones aqui antes de que se guarde en la base de datos, y ya para que se guarde ponemos el next como parametro de la funcion, y si no queremos que se guarde retornamos un error con el thro new Error y su mensaje del error 
    if(!moment(this.detalle.fechaNacimiento).isValid) { //NOTA: aqui la fecha de nacimiento ya tendrá el valor en string de la fecha, no será el numero que le mandamos en el body, ya que esa conversion la hace antes de guardar en la base de datos, pero esta funcion del validate la hace justo antes de guardar en la base de datos, ya cuando se hizo la conversion a fecha
        throw new Error(`el valor ${this.detalle.fechaNacimiento} no es una fecha valida`);
    }

    if( moment().diff(moment(this.detalle.fechaNacimiento), 'years') < 18 ) {
        throw new Error(`la edad debe ser mayor a 18`);
    }

    next();
});


UsuarioSchema.pre('aggregate', function() { //esto se explicó en la funcion obtenerUsuarios del archivo usuario.ts de la carpeta controllers, checarlo
    const edadCalculo = {
        $subtract: [
            {
                $subtract: [ { $year: '$$NOW' }, { $year: '$detalle.fechaNacimiento' } ]
            },
            {
                $cond: {
                    if: {
                        $lt: [ 
                            { $dayOfYear: '$detalle.fechaNacimiento' }, 
                            { $dayOfYear: '$$NOW' } 
                        ]
                    },
                    then: 0,
                    else: 1
                }
            }
        ]
    };

    this.pipeline().unshift({
        $addFields: {
            edad: edadCalculo
        }
    });

});

UsuarioSchema.pre('updateOne', async function(next) { //esto se explicó en la funcion borrarUsuario del archivo usuarios.ts de la carpeta controllers, checarlo
    //Algo a tener en cuenta es que el this dentro de las funciones aqui puestas en el modelo va a cambiar segun el tipo de funcion, por ejemplo en la funcion de abajo del toJSON se puede usar el this.toObject(), y tambien en la funcion pre de mas arriba con el 'validate', pero en las funciones pre diferentes como con el 'aggregate' o 'find' o 'updateOne' como aqui no se puede usar el this.toObject, y tambien en la funcion pre con el 'validate' sí se puede acceder directamente a los atributos del modelo como el nombre, apellido, etc del usuario, pero en las funciones pre con el 'find', 'updateOne', etc no se puede acceder asi de esa manera poniendo this.nombre por ejemplo, sino que se acceden asi como se ve en la siguiente linea de this.getQuery()['_id'] o this.getQuery()['nombre'] por ejemplo, y tambien el this.pipeline() visto en el pre con el 'aggregate' de arriba no se puede usar en el pre con el 'find', 'updateOne', etc, ya que lo del pipeline solo es cosa del aggregate como se ve en el archivo usuarios.ts de la carpeta controllers, y tambien con el aggregate no se puede usar el populate, por eso con el pre con el 'aggregate' no se puede usar el this.populate(), pero sí se puede usar para el pre con el 'find' o 'updateOne' como aqui, asi que los metodos que se pueden usar con el pre por ejemplo depende del metodo que le pongamos ya sea si es 'aggregate' o 'updateOne' como aqui, etc
    const id = this.getQuery()['_id'];

    await Promise.all([
        Autor.deleteMany({
            usuario: new objectId(id)
        }),

        Libro.deleteMany({
            usuario: new objectId(id)
        })
    ]);

    next();
});

UsuarioSchema.method('toJSON', function() {
    const { __v, _id, createdAt, updatedAt, password, estado, img, detalle, detalle:{peso}, detalle:{fechaNacimiento}, ...objeto } = this.toObject();
    
    objeto.nombre = `${objeto.nombre} ${objeto.apellido}`;
    delete objeto.apellido; //eliminamos el atributo apellido de la respuesta JSON

    // objeto.peso = detalle.peso.toString() + ' kg'; //esta linea y la siguiente serían por si queremos que el atributo peso y el atributo fechaNacimiento no estén en el objeto anidado del atributo detalle en la respuesta del JSON, sino que estén directamente en el objeto del usuario
    // objeto.fechaNacimiento = detalle.fechaNacimiento;
    objeto.detalle = detalle;
    objeto.detalle.peso = (peso != 0) ? peso.toString() + ' kg' : null;
    objeto.detalle.fechaNacimiento = moment(fechaNacimiento).add(6, 'hours').format('DD/MM/YYYY');
    objeto.id = _id;
    objeto.edad = moment().diff(moment(fechaNacimiento), 'years') //para obtener la edad
    objeto.rol = objeto.rol.filter(r => [ 'ROLE_USER', 'ROLE_ADMIN' ].includes(r));
    if(objeto.rol.length == 1) objeto.rol = objeto.rol[0];

    return objeto;
});


export default model('Usuario', UsuarioSchema);