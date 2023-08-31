import Usuario from '../../models/usuario';
import Rol from '../../models/rol';
import moment from 'moment';
import { Types, ObjectId, Schema } from 'mongoose';
import { UsuarioObjeto, tokenUsuario } from '../../interfaces/usuario';
import { capitalizar } from '../funciones';
const objectId = Types.ObjectId;

//NOTA: si la funcion que se ponga dentro de un custom del express-validator en los routers es async entonces para generar un error pero para validarlo en el archivo validar-campos.ts de la carpeta middlewares se pone throw new Error como se vio en las lecciones del curso de node js, y ya con eso, no hace falta que le pongamos nada para decir que está bien todo, y en cambio si la funcion no es async entonces forzozamente se debe retornar un true para que avance y no retorne error, y se debe retornar false para que se tenga un error y se valide en el validar-campos.ts, tal como se ve en el backend de express de la carpeta 09-calendar-backend del curso de react
const existeNombreYApellido = async (nombre: string, {req}) => {
    const payload = (req as tokenUsuario).payload; //si el usuario está logueado, osea si se va a actualizar el usuario, el payload existirá, pero si el usuario no está logueado, osea si se va a crear el usuario, el payload no existirá
    
    nombre = capitalizar(nombre);
    const apellido = capitalizar((req.body as UsuarioObjeto).apellido);

    const usuario = await Usuario.findOne({ 
        nombre,
        apellido,
        estado: true,
        $or: [ //lo de este $or es para que si el usuario está actualizando su usuario que no se cheque si existe ese nombre y apellido incluyendo su propio id, sino que cheque si ese nombre y apellido existe pero para los usuarios que no tengan el id del usuario logueado, ya que el usuario logueado puede que quiera que actualizar su informacion pero sin modificar su nombre y apellido, solo modificando otros atributos como su peso, contraseña y asi (no se le puede modificar su email), entonces si es asi se podría mandar el mismo nombre y apellido que ya está guardado en base de datos para ese usuario pero con diferentes valores en otros atributos pues, y por eso conviene checar solo los demas usuarios y no el suyo que está actualizando ya que puede dejar igual su nombre y apellido pero no otros atributos, y en caso que no se esté actualizando sino creando un usuario entonces !!payload será false y entonces este $or sí se va a cumplir, lo que significa que no se filtrará por ningun id ni nada porque al crear un usuario pues no se está logueado para hacer eso, por lo tanto este $or solo se pasa y ya
            {
                $and: [
                    { $expr: { $eq: [ !!payload, true ] } }, //lo del $expr y mas cosas de mongodb se explica en el archivo usuarios.ts de la carpeta controllers
                    { 
                        $nor: [
                            {
                                _id: payload?.id
                            }
                        ]
                    }
                ]
            },
            {
                $and: [
                    { $expr: { $eq: [ !!payload, false ] } }
                ]
            }
        ]
    });

    if(usuario) {
        throw new Error('Existe usuario con ese nombre y apellido');
    }
};

const existeEmail = async (email: string) => {
    const usuario = await Usuario.findOne({
        email,
        estado: true
    });

    if(usuario) {
        throw new Error('Existe usuario con ese email');
    }
};

const esRolValido = async (rol: string | string[]) => {
    let condicion = false;
    if(!Array.isArray(rol)) {
        const theRol = await Rol.findOne({ rol });
        condicion = !!theRol;
    }
    else {
        for(let roleOne of rol) {
            const theRol = await Rol.findOne({ 
                rol: {
                    $in: [
                        roleOne
                    ]
                }
            });
            condicion = !!theRol;
            if(!condicion) break;
        }

    }

    if(!condicion) {
        throw new Error('No se encuentra registrado el rol proporcionado');
    }
};

const esFechaValida = (fecha: number) => {

    if(!moment(fecha).isValid) { 
        throw new Error(`el valor ${fecha} no es una fecha valida`);
    }

    const theDate = moment(fecha).add(6, 'hours').format('YYYY-MM-DD');

    if( moment().diff(moment(theDate), 'years') < 18 ) {
        throw new Error(`la edad debe ser mayor a 18`);
    }

    return true;

};

const existeEmailAuth = async (email: ObjectId) => {
    const usuarioTrue = await Usuario.findOne({ email, estado: true });
    const usuarios = await Usuario.find({ email });

    if(!usuarioTrue) {
        if(usuarios.length > 0) {
            throw new Error('Se eliminó este usuario. Es posible que un administrador haya realizado la accion');
        }
        throw new Error('Email o contraseña incorrecta');
    }

    return true;
};

const existeId = async (id: ObjectId) => {
    const usuario = await Usuario.findById(id);
    if(!usuario || !usuario.estado) {
        throw new Error('No existe un usuario con este id o fue eliminado');
    }

    return true;
};

const validarIds = async (idArray: string[]): Promise<Error | boolean> => {
    if( !idArray.every(id => objectId.isValid(id) && typeof id === 'string') ) {
        throw new Error('Debe ser un array con ids de mongo validos');
    }

    const array = idArray.map(id => Usuario.findOne({ 
        _id: id, 
        estado: true, 
        $nor: [
            {
                rol: {
                    $in: [ 'ROLE_ADMIN' ]
                }
            }
        ] 
    }));
    const resultArray = await Promise.all([...array]);
    if( resultArray.some(result => result === null || result === undefined) ) {
        throw new Error('Deben existir todos los ids en el array y no deben ser administradores');
    }

    return true;
};



export {
    existeNombreYApellido,
    existeEmail,
    esRolValido,
    esFechaValida,
    existeEmailAuth,
    existeId,
    validarIds
};