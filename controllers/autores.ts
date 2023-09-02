import { Request, Response } from "express";
import moment from 'moment';
import { Autor, Libro } from "../models";
import { tokenUsuario } from "../interfaces/usuario";
import { capitalizar, esFechaValidaFuncion } from "../helpers";
import { AutorObjeto } from "../interfaces/autor";
import mongoose, { Types, ObjectId, ClientSession } from 'mongoose';
const objectId = Types.ObjectId;


const crearAutor = async (req: Request, res: Response) => {
    const { nombre, apellido, birthday, libros } = req.body as AutorObjeto;
    const theName = capitalizar(nombre);
    const theApellido = capitalizar(apellido);

    let fechaNac = null;
    if(birthday) {
        if(!esFechaValidaFuncion(birthday)) {
            return res.status(400).json({
                ok: false,
                error: 'Se debe proporcionar una fecha valida, en numero positivo'
            });
        }
        fechaNac = birthday;
    }

    const { id: idLogueado } = (req as any as tokenUsuario).payload;

    // const autor = new Autor({ nombre: theName, apellido: theApellido, birthday: fechaNac, usuario: idLogueado });
    // await autor.save();
    const autor = await Autor.create({ nombre: theName, apellido: theApellido, birthday: fechaNac, usuario: idLogueado, libros: [] }); //esta es otra forma de guardar en base de datos, con el metodo create en lugar del metodo save(), ambas formas funcionan igual
    
    // (autor as any).ok = 'hola'; //tanto si guardamos con el metodo save() como si guardamos con el metodo create() vistos arriba al objeto retornado podemos añadirle un atributo de esta forma y podremos leerlo a nivel de codigo, pero si ese objeto lo mandamos como respuesta al JSON entonces ahí no se va a mostrar ese atributo en este caso el atributo llamado ok, para que se muestren atributos nuevos en la respuesta JSON podemos mandar como respuesta un objeto puro de javascript que creemos aqui en el controlador, o usar la funcion toJSON en el modelo
    // console.log((autor as any).ok); //hola , aunque este atributo no se mostrará en la respuesta JSON por lo que se dijo arriba

    res.status(201).json({
        ok: true,
        data: autor
    });

};

const actualizarAutor = async (req: Request, res: Response) => {
    const { nombre, apellido, birthday, libros } = req.body as AutorObjeto;
    const { id } = req.params;

    const name = capitalizar(nombre);
    const lastname = capitalizar(apellido);
    
    let fechaNac = null;
    if(birthday) {
        if(!esFechaValidaFuncion(birthday)) {
            return res.status(400).json({
                ok: false,
                error: 'Se debe proporcionar una fecha valida, en numero positivo'
            });
        }
        fechaNac = birthday;
    }
    else {
        const { birthday } = await Autor.findById(id); 
        fechaNac = birthday;
    }
    
    const objeto = {
        nombre: name,
        apellido: lastname,
        birthday: fechaNac  
    };

    const autorActualizado = await Autor.findByIdAndUpdate(id, objeto, { new: true }).populate('libros', 'nombre'); 
    
    res.status(201).json({
        ok: true,
        data: autorActualizado
    });
};

const eliminarAutor = async (req: Request, res: Response) => {
    const { id } = req.params;

    const autor = await Autor.findById(id);
    const libros = await Libro.find({ autores: { $in: [autor.id] } }).lean();

    //aqui se aplica transacciones, esto se explica en el archivo libros.ts de esta carpeta de controllers
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();

    try {
    
        //se va a eliminar los libros que solo tenga un solo autor y sea el autor que se está eliminando, ya que no puede haber un libro sin autores, y si un libro tiene tambien ese autor a eliminar pero que tambien tenga mas autores entonces ese libro no se eliminará, solo se le eliminará del array de su atributo autores el usuario que se va a eliminar pero conservará sus demás autores
        const operacionLibros = libros.map(l => {
            if(l.autores.length > 1) {
                return Libro.updateMany({
                    autores: autor.id    
                }, { 
                    $pull: {
                        autores: autor.id
                    }
                }, { session });
            }
            else {
                return Libro.findByIdAndDelete(l._id).session(session);
            }
        });
        await Promise.all([ ...operacionLibros ]);

        const eliminado = await Autor.findByIdAndDelete(id).session(session);

        await session.commitTransaction();

        res.status(200).json({
            ok: true,
            data: {
                nombre: `${eliminado.nombre} ${eliminado.apellido}`
            }
        });

    } catch(error) {
        await session.abortTransaction();

        res.status(400).json({
            ok: false,
            error: 'No se pudo eliminar el autor'
        });
    } finally {
        session.endSession();
    }  
};

const obtenerAutores = async (req: Request, res: Response) => {
    const { id: idLogueado } = (req as any as tokenUsuario).payload;

    const autores = await Autor.find({ //aqui no hay paginacion ni ordenamiento ni busqueda de autores porque la lista de autores solo la vamos a ocupar para el multiselect de autores para ponerselo a un libro cuando lo creemos o actualicemos en el frontend, asi que por eso no ocupamos paginacion ni nada de eso y por eso se hizo solamente asi
        usuario: idLogueado
    }, { birthday: false, libros: false });

    res.json({
        ok: true,
        data: autores
    });
};

const obtenerAutor = async (req: Request, res: Response) => {
    const { id } = req.params;

    const autor = await Autor.findById(id).populate('libros', [ 'nombre' ]);

    res.json({
        ok: true,
        data: autor
    });
};


export {
    crearAutor,
    actualizarAutor,
    eliminarAutor,
    obtenerAutores,
    obtenerAutor
};