"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mostrarFoto = exports.subirFoto = exports.obtenerFavoritos = exports.añadirFavorito = exports.obtenerLibro = exports.obtenerLibros = exports.eliminarLibro = exports.actualizarLibro = exports.crearLibro = void 0;
const models_1 = require("../models");
const mongoose_1 = __importStar(require("mongoose"));
const helpers_1 = require("../helpers");
const objectId = mongoose_1.Types.ObjectId;
const cloudinary_1 = __importDefault(require("cloudinary"));
const path_1 = __importDefault(require("path"));
const cloudinary = cloudinary_1.default.v2;
cloudinary.config(process.env.CLOUDINARY_URL);
const crearLibro = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre, isbn, autores } = req.body;
    req.body.nombre = (0, helpers_1.capitalizar)(nombre);
    const { id: idLogueado } = req.payload;
    //con las siguientes 2 lineas se crea una transaccion, y eso sirve para que si hacemos en una sola funcion mas de 1 modificacion a la base de datos y que esas modificaciones sean dependientes entre sí que entonces si en alguna parte dentro de la transaccion hay un error que ninguna consulta de modificacion se haga a la base de datos, aunque el error haya surgido despues de alguna modificacion pero si está dentro de la transaccion entonces se hará rollback a esa modificacion que ya se había hecho hasta ese punto donde dio el error, osea se revertirán esos cambios a la base de datos automaticamente, para eso sirven las transacciones, pero esto solo aplica lo que esté dentro de la transaccion, y con las siguientes 2 lineas se crea una transaccion y se inicia
    //OJO que para crear las transacciones se debe usar una conexion al mongo Atlas, osea tener mongodb en la nube como se vio en el curso de node js o la parte del backend del proyecto del calendar en el curso de React, ya que el mongo atlas ya trae el replica set incluido, lo cual es una herramienta necesaria para trabajar con transacciones dentro de mongoose, asi que si nuestra base de datos la tenemos en el localhost de nuestra computadora no funcionarán las transacciones y dará error, a menos que hagamos una configuracion y usemos docker, esto se puede ver aqui: https://blog.tericcabrel.com/how-to-use-mongodb-transaction-in-node-js
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const libro = new models_1.Libro(Object.assign(Object.assign({}, (req.body)), { usuario: idLogueado, favorito: 0, img: null })); //asi en la respuesta JSON en el objeto del libro en su atributo autores se mostrará solo los id, y con las siguientes 2 lineas en lugar de esta linea se mostrará todo el objeto de los autores, pero con el atributo libros de los autores como array vacio, asi lo retornará el metodo save() del libro abajo y el array está vacio en ese atributo de libros de los autores del libro guardado porque aun no le hemos añadido su libro respectivo como se hace mas abajo, aunque en la base de datos siempre esos atributos de relaciones se van a guardar como el id, aunque aqui le hayamos puesto todo el objeto y que en la respuesta JSON se muestre todo el objeto en ese atributo de relacion y no solo su id, aun asi en la base de datos se guardará solo el id
        // const au = await Promise.all([ ...autores.map(id => Autor.findById(id)) ]);
        // const libro = new Libro({ nombre, isbn, usuario, autores: au }); 
        yield libro.save({ session }); //siempre que estamos dentro de transacciones se debe referenciar a la variable session creada arriba en todas nuestras consultas de guardar como esta, actualizar, eliminar y tambien para los que solo retornan algo como el find, findOne o findById como el findById de abajo que tambien le pusimos esto de session, si no retornaría null
        //si intentamos guardar un libro con un nombre o isbn que ya existe (ya que en el modelo de Libro en el archivo libro.ts de la carpeta models pusimos que el campo nombre y isbn que sean unicos para cada usuario) entonces dará error en la anterior linea, y tambien dará error si en el atributo autores intentamos agregarle el mismo id de autor, osea un elemento repetido en el array de autores del libro, y como aqui estamos dentro de un try entonces se ejecutaría el catch de abajo y entonces se retornaría la respuesta que está ahi en el catch
        const libroGuardado = yield models_1.Libro.findById(libro.id)
            .populate('usuario', ['nombre', 'apellido'])
            .populate({
            path: 'autores',
            select: ['nombre', 'apellido', 'usuario'],
            // populate: { //esto de tener un populate anidado dentro de un populate se vio en el proyecto del calendar en la parte del backend en el curso de React
            //     path: 'usuario',
            //     select: [ 'nombre', 'apellido' ]
            // }
        }).session(session); //se pone este metodo de session para que este findById junto con sus populate retornen el objeto esperado y no null, ya que dentro de las transacciones se debe referenciar a la variable session creada arriba en todas las consultas tanto para retornar cosas como este findById como para modificar la base de datos como guardar, actualizar y eliminar
        const autoresActualizados = yield models_1.Autor.updateMany({
            _id: {
                $in: [...(libro.autores)] //aqui la variable libro con su atributo autores tiene un array solo con los puros ids
            },
            usuario: idLogueado
        }, {
            $addToSet: {
                libros: libro.id
            }
        }, {
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
        if (numeroActualizados < libro.autores.length) {
            throw new Error(''); //si no se actualizaron todos los autores del libro guardado arriba entonced habría un error y por lo tanto se debe hacer rollback, lo cual se hace en el catch de abajo y por eso aqui se arroja un error para que se ejecute el catch de abajo y ya no se ejecute lo de abajo de este try, y pues en el catch de abajo se hace rollback
        }
        yield session.commitTransaction(); //esto ya guarda los cambios en la base de datos, si no ponemos esto entonces los cambios no se harán en la base de datos dentro de la transaccion
        res.status(201).json({
            ok: true,
            data: libroGuardado
        });
    }
    catch (error) {
        yield session.abortTransaction(); //esto hace rollback para que se reviertan los cambios ya hechos a la base de datos dentro de esta transaccion
        res.status(400).json({
            ok: false,
            error: 'Existe un libro con la misma informacion'
        });
    }
    finally {
        session.endSession(); //esto termina la session de la transaccion, siempre se debe terminar las transacciones con esto
    }
});
exports.crearLibro = crearLibro;
const actualizarLibro = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { usuario, img } = _a, body = __rest(_a, ["usuario", "img"]);
    const { id } = req.params;
    const { id: idLogueado } = req.payload;
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const libroActualizado = yield models_1.Libro.findByIdAndUpdate(id, body, { new: true, session });
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
        yield Promise.all([
            models_1.Autor.updateMany({
                _id: {
                    $in: [...(libroActualizado.autores)]
                },
                usuario: idLogueado
            }, {
                $addToSet: {
                    libros: libroActualizado.id
                }
            }, {
                session
            }),
            models_1.Autor.updateMany({
                libros: {
                    $in: [libroActualizado.id]
                },
                $nor: [
                    {
                        _id: {
                            $in: [...(libroActualizado.autores)]
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
        const libro = yield models_1.Libro.findById(id)
            .populate('usuario', ['nombre', 'apellido'])
            .populate({
            path: 'autores',
            select: ['nombre', 'apellido', 'usuario'],
            // populate: { 
            //     path: 'usuario',
            //     select: [ 'nombre', 'apellido' ]
            // }
        }).session(session);
        yield session.commitTransaction();
        res.status(201).json({
            ok: true,
            data: libro
        });
    }
    catch (error) {
        yield session.abortTransaction();
        res.status(400).json({
            ok: false,
            error: 'No se pudo actualizar el libro'
        });
    }
    finally {
        session.endSession();
    }
});
exports.actualizarLibro = actualizarLibro;
const eliminarLibro = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const libro = yield models_1.Libro.findOneAndDelete({ _id: new objectId(id) }).session(session);
        yield models_1.Autor.updateMany({
            _id: {
                $in: [...(libro.autores)]
            }
        }, {
            $pull: {
                libros: libro.id
            }
        }, {
            session
        });
        yield session.commitTransaction();
        res.status(200).json({
            ok: true,
            data: {
                nombre: libro.nombre
            }
        });
    }
    catch (error) {
        yield session.abortTransaction();
        res.status(400).json({
            ok: false,
            error: 'No se pudo eliminar el libro'
        });
    }
    finally {
        session.endSession();
    }
});
exports.eliminarLibro = eliminarLibro;
const obtenerLibros = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: idLogueado } = req.payload;
    const { buscar, ordenar: order = 'nombre', asc = 1, desde = 0, limite = 10 } = req.query;
    const ordenar = order.length == 0 ? 'nombre' : order;
    const direccion = Number.isNaN(Number(asc)) || asc == '' ? 1 : asc > 0 ? 1 : -1;
    const termino = (buscar) ? new RegExp(buscar.trim(), 'i') : new RegExp('');
    const terminoAutor = (buscar || buscar.trim().length > 0) ? buscar.trim() : '%';
    const skip = Number.isNaN(Number(desde)) || desde == '' ? 0 : desde >= 0 ? Number(desde) : 0;
    const limit = Number.isNaN(Number(limite)) || limite == '' ? 10 : limite > 0 ? Number(limite) : 10;
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
    const auths = yield models_1.Autor.find({
        $expr: {
            $regexMatch: {
                input: {
                    $concat: ['$nombre', ' ', '$apellido']
                },
                // regex: '^' + terminoAutor, //asi hubiera sido para hacer un like asi: terminoAutor% , osea con el valor que tenga la variable terminoAutor que con eso empiece, y si quisieramos que con eso termine entonces pondríamos: terminoAutor + '$' , pero como queremos que sea un like asi: %terminoAutor% entonces pusimos lo de la siguiente linea, y OJO que al igual que con el $regex visto arriba no se le puede poner un new RegExp() aqui
                regex: terminoAutor,
                options: 'i'
            }
        },
        usuario: idLogueado
    }).distinct('_id'); //por default con el find obtenemos un array de objetos, pero con el metodo distinct obtenemos un array de valores, osea un array normal que no sea de objetos, poniendole como elementos los valores del atributo que le pongamos en su parametro, en este caso le pusimos como parametro '_id', lo cual significa que al final se va a retornar un array con solo los valores del _id de los objetos del autor que encontró el find
    const libros = yield models_1.Libro.find({
        $or: [
            {
                nombre: termino
            },
            {
                isbn: termino
            },
            {
                autores: {
                    $in: [...auths]
                }
            }
        ],
        usuario: idLogueado
    }, { createdAt: false })
        .populate('autores', ['nombre', 'apellido'])
        .sort({ [ordenar]: (direccion) }) //asi se puede poner una llave dinamica, tal como se hace en los objetos literales de javascript
        .skip(skip)
        .limit(limit);
    res.status(200).json({
        ok: true,
        data: libros
    });
});
exports.obtenerLibros = obtenerLibros;
const obtenerLibro = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const libro = yield models_1.Libro.findById(id).populate('autores', ['nombre', 'apellido']);
    res.json({
        ok: true,
        data: libro
    });
});
exports.obtenerLibro = obtenerLibro;
const añadirFavorito = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { favorito } = req.body;
    const libro = yield models_1.Libro.findById(id);
    libro.favorito = favorito;
    libro.save(); //el metodo save ademas de guardar un nuevo documento tambien puede actualizar, y actualiza si el objeto ya tiene el atributo _id, pero si no lo tiene entonces lo crea
    res.status(201).json({
        ok: true,
        data: {
            nombre: libro.nombre
        }
    });
});
exports.añadirFavorito = añadirFavorito;
const obtenerFavoritos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { desde, limite } = req.query;
    const { id: idLogueado } = req.payload;
    const skip = Number.isNaN(Number(desde)) || desde == '' ? 0 : desde >= 0 ? Number(desde) : 0;
    const limit = Number.isNaN(Number(limite)) || limite == '' ? 10 : limite > 0 ? Number(limite) : 10;
    const libros = yield models_1.Libro.find({
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
});
exports.obtenerFavoritos = obtenerFavoritos;
const subirFoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.archivo) { //si no se subió ningun archivo, o con el nombre 'archivo'
        return res.status(400).json({
            msg: 'no se subió ningun archivo'
        });
    }
    try {
        const { id } = req.params;
        const libro = yield models_1.Libro.findById(id);
        if (libro.img) {
            const nombreArr = libro.img.split('/');
            const nombre = nombreArr[nombreArr.length - 1];
            const [public_id] = nombre.split('.');
            cloudinary.uploader.destroy(public_id);
        }
        const { tempFilePath } = req.files.archivo;
        const { secure_url } = yield cloudinary.uploader.upload(tempFilePath);
        libro.img = secure_url;
        yield libro.save();
        const book = yield models_1.Libro.findById(libro.id).populate('autores', ['nombre', 'apellido']);
        res.status(201).json({
            ok: true,
            data: book
        });
    }
    catch (err) {
        res.status(400).json({
            ok: false,
            error: {
                mensaje: 'No se pudo subir la foto'
            }
        });
    }
});
exports.subirFoto = subirFoto;
const mostrarFoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const libro = yield models_1.Libro.findById(id);
    if (libro.img) {
        return res.sendFile(libro.img);
    }
    const pathImage = path_1.default.join(__dirname, '../assets/no-image.jpg');
    res.sendFile(pathImage);
});
exports.mostrarFoto = mostrarFoto;
//# sourceMappingURL=libros.js.map