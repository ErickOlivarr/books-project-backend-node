import { Request, Response } from "express";
import Libro from "../models/libro";
import Autor from "../models/autor";
import { LibroObjeto } from "../interfaces/libro";
import { AutorObjeto } from "../interfaces/autor";
import { tokenUsuario } from "../interfaces/usuario";
import mongoose, { ClientSession, SortOrder } from "mongoose";
import { Types, ObjectId } from 'mongoose';
import { capitalizar } from "../helpers/funciones";
const objectId = Types.ObjectId;

const crearLibro = async (req: Request, res: Response) => {
    const { nombre, isbn, autores } = req.body as LibroObjeto;
    (req.body as LibroObjeto).nombre = capitalizar(nombre);

    const { id: idLogueado } = (req as any as tokenUsuario).payload;

    //con las siguientes 2 lineas se crea una transaccion, y eso sirve para que si hacemos en una sola funcion mas de 1 modificacion a la base de datos y que esas modificaciones sean dependientes entre sí que entonces si en alguna parte dentro de la transaccion hay un error que ninguna consulta de modificacion se haga a la base de datos, aunque el error haya surgido despues de alguna modificacion pero si está dentro de la transaccion entonces se hará rollback a esa modificacion que ya se había hecho hasta ese punto donde dio el error, osea se revertirán esos cambios a la base de datos automaticamente, para eso sirven las transacciones, pero esto solo aplica lo que esté dentro de la transaccion, y con las siguientes 2 lineas se crea una transaccion y se inicia
    //OJO que para crear las transacciones se debe usar una conexion al mongo Atlas, osea tener mongodb en la nube como se vio en el curso de node js o la parte del backend del proyecto del calendar en el curso de React, ya que el mongo atlas ya trae el replica set incluido, lo cual es una herramienta necesaria para trabajar con transacciones dentro de mongoose, asi que si nuestra base de datos la tenemos en el localhost de nuestra computadora no funcionarán las transacciones y dará error, a menos que hagamos una configuracion y usemos docker, esto se puede ver aqui: https://blog.tericcabrel.com/how-to-use-mongodb-transaction-in-node-js
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();

    try {

        const libro = new Libro({ ...(req.body), usuario: idLogueado, favorito: 0 }); //asi en la respuesta JSON en el objeto del libro en su atributo autores se mostrará solo los id, y con las siguientes 2 lineas en lugar de esta linea se mostrará todo el objeto de los autores, pero con el atributo libros de los autores como array vacio, asi lo retornará el metodo save() del libro abajo y el array está vacio en ese atributo de libros de los autores del libro guardado porque aun no le hemos añadido su libro respectivo como se hace mas abajo, aunque en la base de datos siempre esos atributos de relaciones se van a guardar como el id, aunque aqui le hayamos puesto todo el objeto y que en la respuesta JSON se muestre todo el objeto en ese atributo de relacion y no solo su id, aun asi en la base de datos se guardará solo el id
        // const au = await Promise.all([ ...autores.map(id => Autor.findById(id)) ]);
        // const libro = new Libro({ nombre, isbn, usuario, autores: au }); 
        await libro.save({ session }); //siempre que estamos dentro de transacciones se debe referenciar a la variable session creada arriba en todas nuestras consultas de guardar como esta, actualizar, eliminar y tambien para los que solo retornan algo como el find, findOne o findById como el findById de abajo que tambien le pusimos esto de session, si no retornaría null
        //si intentamos guardar un libro con un nombre o isbn que ya existe (ya que en el modelo de Libro en el archivo libro.ts de la carpeta models pusimos que el campo nombre y isbn que sean unicos para cada usuario) entonces dará error en la anterior linea, y tambien dará error si en el atributo autores intentamos agregarle el mismo id de autor, osea un elemento repetido en el array de autores del libro, y como aqui estamos dentro de un try entonces se ejecutaría el catch de abajo y entonces se retornaría la respuesta que está ahi en el catch

        const libroGuardado = await Libro.findById(libro.id)
                                            .populate('usuario', [ 'nombre', 'apellido' ])
                                            .populate({
                                                path: 'autores',
                                                select: ['nombre', 'apellido', 'usuario'],
                                                // populate: { //esto de tener un populate anidado dentro de un populate se vio en el proyecto del calendar en la parte del backend en el curso de React
                                                //     path: 'usuario',
                                                //     select: [ 'nombre', 'apellido' ]
                                                // }
                                            }).session(session); //se pone este metodo de session para que este findById junto con sus populate retornen el objeto esperado y no null, ya que dentro de las transacciones se debe referenciar a la variable session creada arriba en todas las consultas tanto para retornar cosas como este findById como para modificar la base de datos como guardar, actualizar y eliminar

        const autoresActualizados = await Autor.updateMany({
            _id: {
                $in: [ ...(libro.autores) ] //aqui la variable libro con su atributo autores tiene un array solo con los puros ids
            },
            usuario: idLogueado
        }, {
            $addToSet: {
                libros: libro.id
            }
        }, { //para las consultas nativas de mongodb como este updateMany (osea que no es del orm de mongoose sino que es propio de mongodb como este updateMany que se vio en el curso de mongodb) para incluir el session solo se pone un tercer parametro como se ve aqui incluyendo un objeto con el session como se ve aqui
            session
        });

        // //lo de arriba se pondría en lugar del anterior updateMany
        // const autors = await Promise.all([ ...autores.map(id => Autor.findById(id)) ]);
        // const autoresGuardados = [];
        // for(let autor of autors) {
        //     (autor as any as AutorObjeto).libros.push(libro.id); //si aqui dentro del push le pongo libro en base de datos igual se guarda el puro id al igual que ponerle libro.id, pero asi si le pongo libro en la respuesta JSON se muestra todo el objeto de libro incluyendo su arreglo de autores pero sin tener error por ciclo infinito ahi, y si le pongo libro.id entonces en la respuesta JSON se muestra solo los puros ids en este atributo de libros para los autores
        //     await autor.save({ session });
        //     autoresGuardados.push(autor);
        // }

        const numeroActualizados = autoresActualizados.modifiedCount ? autoresActualizados.modifiedCount : 0;
        if(numeroActualizados < libro.autores.length) {
            throw new Error(''); //si no se actualizaron todos los autores del libro guardado arriba entonced habría un error y por lo tanto se debe hacer rollback, lo cual se hace en el catch de abajo y por eso aqui se arroja un error para que se ejecute el catch de abajo y ya no se ejecute lo de abajo de este try, y pues en el catch de abajo se hace rollback
        } 

        await session.commitTransaction(); //esto ya guarda los cambios en la base de datos, si no ponemos esto entonces los cambios no se harán en la base de datos dentro de la transaccion

        res.status(201).json({
            ok: true,
            data: libroGuardado
        });

    } catch(error) {
        await session.abortTransaction(); //esto hace rollback para que se reviertan los cambios ya hechos a la base de datos dentro de esta transaccion

        res.status(400).json({
            ok: false,
            error: 'Existe un libro con la misma informacion'
        });
    } finally {
        session.endSession(); //esto termina la session de la transaccion, siempre se debe terminar las transacciones con esto
    }

};

const actualizarLibro = async (req: Request, res: Response) => {
    const { usuario, ...body } = req.body;
    const { id } = req.params;
    const { id: idLogueado } = (req as any as tokenUsuario).payload;

    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();

    try {

        const libroActualizado = await Libro.findByIdAndUpdate(id, body, { new: true, session });
        //vimos en la funcion de crearLibro de arriba que con el save si hay elementos repetidos en un array no se guardan los repetidos, pero con el findByIdAndUpdate sí se guardan los repetidos, aunque se eliminaron los posibles elementos repetidos que podrían haber en el body en el atributo autores (que es un array de ids de autores) en el archivo validar-arrayUsuarios.ts de la carpeta middlewares 

        //se le añade el libro que se actualizó a los autores que se le puso a ese libro en el body  
        // await Autor.updateMany({
        //     _id: {
        //         $in: [ ...(libroActualizado.autores) ]
        //     },
        //     usuario: idLogueado
        // }, {
        //     $addToSet: {
        //         libros: libroActualizado.id
        //     }
        // }, {
        //     session
        // });

        //si un autor tenía antes ese libro que se actualizó pero que en el body no le hayamos puesto ese autor en el atributo autores entonces pues ahora al actualizar el libro ese libro ya no tendrá ese autor que antes sí tenía ese libro, asi que con lo siguiente se le elimina ese libro a esos autores que ahora ya no tengan ese libro
        // await Autor.updateMany({
        //     libros: {
        //         $in: [ libroActualizado.id ]     
        //     },
        //     $nor: [
        //         {
        //             _id: {
        //                 $in: [ ...(libroActualizado.autores) ]
        //             }
        //         }
        //     ],
        //     usuario: idLogueado
        // }, {
        //     $pull: {
        //         libros: libroActualizado.id
        //     }
        // }, {
        //     session
        // });


        //hicimos lo mismos que los 2 updateMany de arriba pero mejor con el Promise.all porque los 2 no son dependientes entre sí
        await Promise.all([
            Autor.updateMany({
                _id: {
                    $in: [ ...(libroActualizado.autores) ]
                },
                usuario: idLogueado
            }, {
                $addToSet: {
                    libros: libroActualizado.id
                }
            }, {
                session
            }),

            Autor.updateMany({
                libros: {
                    $in: [ libroActualizado.id ]     
                },
                $nor: [
                    {
                        _id: {
                            $in: [ ...(libroActualizado.autores) ]
                        }
                    }
                ],
                usuario: idLogueado
            }, {
                $pull: {
                    libros: libroActualizado.id
                }
            }, {
                session
            })
        ]);

        const libro = await Libro.findById(id)
                                    .populate('usuario', [ 'nombre', 'apellido' ])
                                    .populate({
                                        path: 'autores',
                                        select: ['nombre', 'apellido', 'usuario'],
                                        // populate: { 
                                        //     path: 'usuario',
                                        //     select: [ 'nombre', 'apellido' ]
                                        // }
                                    }).session(session);

        await session.commitTransaction();

        res.status(201).json({
            ok: true,
            data: libro
        });

    } catch(error) {
        await session.abortTransaction();

        res.status(400).json({
            ok: false,
            error: 'No se pudo actualizar el libro'
        });
    } finally {
        session.endSession();
    }    

}; 

const eliminarLibro = async (req: Request, res: Response) => {
    const { id } = req.params;

    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();

    try {

        const libro = await Libro.findOneAndDelete({ _id: new objectId(id) }).session(session);
        
        await Autor.updateMany({
            _id: {
                $in: [ ...(libro.autores) ]
            }
        }, {
            $pull: {
                libros: libro.id
            }
        }, {
            session
        });

        await session.commitTransaction();

        res.status(200).json({
            ok: true,
            data: {
                nombre: libro.nombre
            }
        });
    } catch(error) {
        await session.abortTransaction();

        res.status(400).json({
            ok: false,
            error: 'No se pudo eliminar el libro'
        });
    } finally {
        session.endSession();
    }  

};

const obtenerLibros = async (req: Request, res: Response) => {
    const { id: idLogueado } = (req as any as tokenUsuario).payload;

    const { buscar, 
        ordenar: order = 'nombre', asc = 1, desde = 0, limite = 10 
    } = req.query; 
    const ordenar = order.length == 0 ? 'nombre' : order; 
    const direccion = Number.isNaN(Number(asc)) || asc == '' ? 1 : (asc as number) > 0 ? 1 : -1;
    const termino = (buscar) ? new RegExp((buscar as string).trim(), 'i') : new RegExp('');
    const terminoAutor = (buscar || (buscar as string).trim().length > 0) ? (buscar as string).trim() : '%';
    const skip = Number.isNaN(Number(desde)) || desde == '' ? 0 : (desde as number) >= 0 ? Number(desde) : 0;
    const limit = Number.isNaN(Number(limite)) || limite == '' ? 10 : (limite as number) > 0 ? Number(limite) : 10;

    // const autores = await Autor.aggregate([
    //     {
    //         $set: {
    //             nombre: {
    //                 $concat: [ '$nombre', ' ', '$apellido' ]
    //             }
    //         }
    //     },
    //     {
    //         $match: {
    //             nombre: { $regex: '^' + 'howard', $options: 'i' }, //en el aggregate tambien está el $regex que es para dar una expresion regex pero sin usar las diagonales que en javascript se usan para poner una expresion regex, osea que si aqui a este $regex como valor le hubieramos puesto 'howard' entonces hubiera sido como un like en mysql de esta forma: %howard% , y con lo de esta linea que pusimos $regex: '^' + 'howard' entonces sería un like en mysql de esta forma: howard% , ya que ese signo de ^ significa que empieza con, y si quisieramos decir que termina con entonces hubieramos puesto aqui: $regex: 'howard' + '$' , y eso sería como un like en mysql de esta forma: %howard, y con el options: 'i' hacemos que sea case insensitive, osea que no tome en cuenta las mayusculas ni minusculas. OJO que con el $regex no funciona ponerle como valor un new RegExp()
    //             usuario: idLogueado
    //         }
    //     },
    //     {
    //         $project: {
    //             nombre: true
    //         }
    //     }
    // ]);


    const auths = await Autor.find({
        $expr: {
            $regexMatch: { //el $regexMatch sirve para saber si el valor de su parametro input de abajo coincide con la expresion regular puesta en su parametro regex de abajo, y opcionalmente podemos ponerle el parametro de options con el valor de 'i' que es para que sea case insensitive, osea que no cheque las mayusculas ni minusculas
                input: {
                    $concat: [ '$nombre', ' ', '$apellido' ]
                },
                // regex: '^' + terminoAutor, //asi hubiera sido para hacer un like asi: terminoAutor% , osea con el valor que tenga la variable terminoAutor que con eso empiece, y si quisieramos que con eso termine entonces pondríamos: terminoAutor + '$' , pero como queremos que sea un like asi: %terminoAutor% entonces pusimos lo de la siguiente linea, y OJO que al igual que con el $regex visto arriba no se le puede poner un new RegExp() aqui
                regex: terminoAutor,
                options: 'i'
            }
        },
        usuario: idLogueado
    }).distinct('_id'); //por default con el find obtenemos un array de objetos, pero con el metodo distinct obtenemos un array de valores, osea un array normal que no sea de objetos, poniendole como elementos los valores del atributo que le pongamos en su parametro, en este caso le pusimos como parametro '_id', lo cual significa que al final se va a retornar un array con solo los valores del _id de los objetos del autor que encontró el find

    const libros = await Libro.find({
        $or: [
            {
                nombre: termino
            },
            {
                isbn: termino
            },
            {
                autores: {
                    $in: [ ...auths ]
                }
            }
        ],
        usuario: idLogueado
    }, { createdAt: false })
    .populate('autores', ['nombre', 'apellido'])
    .sort({ [ordenar as string]: (direccion) }) //asi se puede poner una llave dinamica, tal como se hace en los objetos literales de javascript
    .skip(skip)
    .limit(limit);

    res.status(200).json({
        ok: true,
        data: libros
    });

};

const obtenerLibro = async (req: Request, res: Response) => {
    const { id } = req.params;
    const libro = await Libro.findById(id).populate('autores', [ 'nombre', 'apellido' ]);

    res.json({
        ok: true,
        data: libro
    });
};

const añadirFavorito = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { favorito } = req.body;
    const libro = await Libro.findById(id);
    libro.favorito = favorito;
    libro.save(); //el metodo save ademas de guardar un nuevo documento tambien puede actualizar, y actualiza si el objeto ya tiene el atributo _id, pero si no lo tiene entonces lo crea

    res.status(201).json({
        ok: true,
        data: {
            nombre: libro.nombre
        }
    });
};

const obtenerFavoritos = async (req: Request, res: Response) => {
    const { desde, limite } = req.query;
    const { id: idLogueado } = (req as any as tokenUsuario).payload;

    const skip = Number.isNaN(Number(desde)) || desde == '' ? 0 : (desde as any as number) >= 0 ? Number(desde) : 0;
    const limit = Number.isNaN(Number(limite)) || limite == '' ? 10 : (limite as any as number) > 0 ? Number(limite) : 10;
    const libros = await Libro.find({
        usuario: idLogueado,
        favorito: 1
    }, { createdAt: false, isbn: false, favorito: false })
    .populate('autores', ['nombre', 'apellido'])
    .skip(skip)
    .limit(limit);

    res.json({
        ok: true,
        data: libros
    });

};


export {
    crearLibro,
    actualizarLibro,
    eliminarLibro,
    obtenerLibros,
    obtenerLibro,
    añadirFavorito,
    obtenerFavoritos
};