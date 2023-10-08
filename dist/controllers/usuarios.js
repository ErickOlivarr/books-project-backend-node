"use strict";
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
exports.mostrarFoto = exports.subirFoto = exports.actualizarUsuarioRol = exports.borrarUsuario = exports.actualizarUsuario = exports.obtenerUsuario = exports.obtenerUsuarios = exports.reenviarCorreo = exports.validarUsuarioCreado = exports.crearUsuarioYEnviarEmail = void 0;
const models_1 = require("../models");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const helpers_1 = require("../helpers");
const mongoose_1 = require("mongoose");
const objectId = mongoose_1.Types.ObjectId;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const nodemailer_1 = __importDefault(require("nodemailer")); //npm i nodemailer para instalar este paquete para enviar correos con nodejs
// const esPesoValido = (peso: any): boolean => {
//     if(peso) {
//         if(Number.isNaN(Number(peso))) {
//             return false;
//         }
//         if(Number(peso) < 0) {
//             return false;
//         }
//     }
//     return true;
// };
// const capitalizar = (sentencia: string): string => {
//     return sentencia.trim().split(' ').map(palabra => //se quitan los espacios al principio y al final y se capitaliza cada palabra del nombre para asi guardarla en base de datos
//             palabra[0].toUpperCase() + palabra.slice(1).toLowerCase()).join(' ');
// };
const enviarCorreo = (token, baseUrl, nombre, apellido, email) => __awaiter(void 0, void 0, void 0, function* () {
    const cuerpoHtml = `
        <h3>Bienvenido ${nombre} ${apellido}</h3>
        <p>
            Para registrar su usuario por favor haga click
            <a href="${baseUrl + 'confirmacion/' + token}" style="background-color:#00aae4; padding:7px; text-align:center; border-radius:7px; text-decoration:none; color:white;">AQUI</a>
        </p>
    `;
    const config = {
        host: process.env.HOST_EMAIL_SEND,
        port: Number(process.env.PORT_EMAIL_SEND),
        auth: {
            user: process.env.EMAIL_SEND,
            pass: process.env.PASS_EMAIL_SEND //la contraseña pero no del correo desde el cual se va a mandar, sino la contraseña de aplicacion que creamos desde nuestro correo de la anterior linea, para eso ir aqui en nuestra cuenta de google de gmail (iniciar sesion primero): https://myaccount.google.com/security?hl=es , y ver la parte que dice "Verificacion en dos pasos", y activarla, y ya cuando esté activa buscar en el buscador de ahí de la pagina que puse anteriormente: "Contraseñas de aplicaciones", y estando en esa parte de contraseñas de aplicaciones, donde dice "Seleccionar aplicacion" poner la opcion de "Otra", darle un nombre y ponerle en generar y se nos mostrará una contraseña generada automaticamente y esa contraseña es la que pondremos aqui, esto se hace para todo tipo de aplicaciones donde queramos mandar correos, incluido spring boot, node js como en este caso, etc
        }
    };
    const transport = nodemailer_1.default.createTransport(config); //siempre se debe hacer esto para enviar correos con nodemailer, para darle su configuracion
    const mensaje = {
        from: process.env.EMAIL_SEND,
        to: email,
        subject: 'Registro Books app',
        html: cuerpoHtml //aqui podemos ponerle text o html como nombre de atributo, si le ponemos text pues solo podremos ponerle un string de un texto normal para que en el cuerpo del correo que enviemos solo se muestre un texto normal y ya, pero si le ponemos html como aqui entonces recibirá un string que contenga un codigo de html como se ve arriba en la constante llamada cuerpoHtml, la cual la pusimos aqui, esto para que el cuerpo del correo que enviemos tenga la estructura del html que pongamos, pudiendo ponerle imagenes al correo con la etiqueta img del html por ejemplo
    };
    const info = yield transport.sendMail(mensaje); //esto es para ahora sí enviar el correo usando nodemailer con la configuracion que le dimos arriba, y esto retorna una promesa, por eso aqui pusimos el await
    return info;
});
const crearUsuarioYEnviarEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { estado, password, rol, img, baseUrl } = _a, user = __rest(_a, ["estado", "password", "rol", "img", "baseUrl"]);
    let idU = '';
    try {
        if (!(0, helpers_1.esPesoValido)(user.peso)) { //el atributo peso se validó aqui y no en los routers del usuario en el archivo usuarios.ts de la carpeta routers porque ese atributo hicimos que sea opcional ponerlo en el body, si no se pone entonces se guardará en base de datos (al crear el usuario) con el valor de 0 porque pusimos el default:0 en el atributo peso (del objeto anidado de detalle) del modelo de usuario en el archivo usuario.ts de la carpeta models, asi lo hicimos en este proyecto asi que por eso la validacion se hizo aqui 
            return res.status(400).json({
                ok: true,
                error: 'No se proporcionó un peso valido'
            });
        }
        const salt = bcryptjs_1.default.genSaltSync(10);
        user.password = bcryptjs_1.default.hashSync(password, salt);
        user.nombre = (0, helpers_1.capitalizar)(user.nombre);
        user.apellido = (0, helpers_1.capitalizar)(user.apellido);
        user.rol = [
            'ROLE_NUEVO'
        ];
        user.img = null;
        // user.email = user.email.trim();
        const usuario = new models_1.Usuario(user);
        const { id, nombre, apellido, email, password: pass, estado, rol, detalle } = yield usuario.save();
        const usuarioGuardado = {
            id,
            nombre,
            apellido,
            email,
            password: pass,
            estado,
            rol,
            detalle
        };
        idU = id;
        // console.log('usuario guardado: ', { ...usuarioGuardado }); //OJO que si hacemos { ...usuario } tendremos un objeto no solo con los atributos del modelo de usuario, sino tambien tendremos otros atributos que pone ahi mongoose al hacer el metodo save, find, findOne, findById, etc, esos otros atributos son cosas como $where y cosas asi especiales de mongodb pero esos otros atributos que tendrá la variable usuario aqui por haber aplicado el metodo save no se mostrará en la respuesta JSON, ya que el metodo toJSON de los modelos automaticamente elimina esos elementos sin que nosotros hagamos nada, pero aqui en el codigo esos atributos existirán, por lo tanto si desestructuramos objetos de los modelos (retornados por el metodo save, find, findOne, etc de mongoose) estaríamos desestructurando no solo los atributos que nos interesa del modelo, sino otros atributos especiales que pondrá mongoose, asi que cuidado con eso, y lo mismo aplica si le mandamos todo el objeto a una funcion como la funcion de abajo de generarJWT, si mandamos todo el objeto de usuario estaríamos mandandolo con todo y esos atributos ahi, asi que cuidado con eso
        // const token = await generarJWT(usuarioGuardado as any as UsuarioObjeto); //se puso esto de as unknown as UsuarioObjeto para poder convertirlo a tipo UsuarioObjeto, ya que el usuarioGuardado es de un tipo especial del modelo de usuario porque se obtuvo del save de arriba, por lo tanto si le ponemos solamente as UsuarioObjeto (de la interfaz UsuarioObjeto del archivo usuario.ts de la carpeta interfaces) no se podrá convertir a tipo UsuarioObjeto, asi que cuando tengamos ese tipo de errores que no se puede convertir a un tipo de dato debemos ponerle primero as unknown y ya despues el as del tipo de objeto al que queramos convertir como se ve aqui. Tambien podemos ponerle as any en lugar de as unknown como al final se puso aqui
        // const token = await generarJWT({ ...usuarioGuardado } as UsuarioObjeto); //esto da error porque el usuarioGuardado tiene otros atributos ademas de los atributos del modelo de usuario pero esos atributos no se ven reflejados en el toJSON (cuando lo retornamos como JSON) porque son cosas como $where o cosas asi especiales de mongodb, pero al hacer esto sí se puede obtener esos atributos especiales y eso no coincidirá con la interfaz UsuarioObjeto del archivo usuario.ts de la carpeta interfaces, asi que cuidado con eso
        // const token = await generarJWT(usuarioGuardado); //las anteriores 2 lineas se comentaron por lo que se dijo arriba que se mandaría incluyendo los atributos puestos automaticamente por mongoose, pero aqui estamos mandando un objeto creado por nosotros que es la variable de usuarioGuardado, por eso aqui estamos mandando solo los atributos del modelo de usuario del archivo usuario.ts de la carpeta models que es lo que nos interesa
        const token = yield (0, helpers_1.generarJWT)(id, nombre, apellido, rol); //al final se puso que la funcion generarJWT del archivo generar-jwt.ts de la carpeta helpers que reciba el id, nombre y apellido en lugar de todo el objeto
        //envio de email con el token, si el email no se envia entonces eliminar el usuario recien creado con el rol de ROLE_NUEVO
        const info = yield enviarCorreo(token, baseUrl, nombre, apellido, email);
        //antes de implementar el nodemailer la anterior linea no estaba, todo lo demas de esta funcion sí estaba
        // console.log(info);
        // const usuarioReturn = new Usuario(usuarioGuardado); //antes de implementar el nodemailer esta linea no estaba comentada y era esta constante de usuarioReturn la que se enviaba en el atributo data de la respuesta JSON
        return res.status(200).json({
            ok: true,
            // data: usuarioReturn, //si aqui retornaramos el objeto usuarioGuardado entonces no se respetaría lo de la funcion del toJSON en el modelo de usuario del archivo usuario.ts de la carpeta models, ya que eso solo aplica cuando retornamos como JSON algun objeto instancia de ese modelo como los objetos retornados con el metodo save, find, findOne, etc de mongoose o las instancias de objetos con el new Usuario, por eso si aqui ponemos la variable usuario sí se respetará ese metodo toJSON, y tambien con esta variable de usuarioReturn sí se respetará esa funcion de toJSON porque arriba pusimos que sea instancia del modelo de usuario al igualarlo con el new Usuario, asi que aqui pudimos haber puesto la variable usuario o esta variable de usuarioReturn, con ambas se hubiera retornado lo mismo
            data: {
                mensaje: `Correo enviado a ${email}, favor de verificarlo, no olvidarse de checar la parte de correos no deseados`
            }
        });
    }
    catch (err) {
        // console.log('Hubo un error: ', err);
        if (objectId.isValid(idU)) { //si se guardó el usuario pero no se pudo enviar el correo que ese usuario se elimine
            yield models_1.Usuario.findByIdAndDelete(idU);
        }
        res.status(500).json({
            ok: false,
            error: 'No se pudo guardar el usuario ni enviarse el email, comuniquese con el administrador'
        });
    }
});
exports.crearUsuarioYEnviarEmail = crearUsuarioYEnviarEmail;
const validarUsuarioCreado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.payload;
    const usuario = yield models_1.Usuario.findById(id);
    if (!usuario.rol.includes('ROLE_NUEVO')) {
        return res.status(400).json({
            ok: false,
            error: 'Este usuario ya está registrado'
        });
    }
    // const usuarios = await Usuario.find({
    //     rol: {
    //         $in: [ 'ROLE_NUEVO' ]
    //     },
    //     _id: {
    //         $ne: id
    //     }
    // }).lean(); //este metodo de lean() se explica mas abajo en este archivo
    // const usuariosIds = usuarios.filter(u => {
    //     return moment().diff(moment(u.createdAt), 'days') >= 7; //los usuarios que no han activado su cuenta en 7 o mas dias serán eliminados, para hacer limpieza en la base de datos, esto cada vez que se cree un nuevo usuario ya validado en esta funcion
    // }).map(u => u._id);
    //lo anterior sería para el primer deleteMany de abajo que se comentó, pero como eso se comentó pues por eso lo de arriba tambien se comentó, porque al final hicimos lo mismo usando solo mongodb, checarlo en el segundo deleteMany de abajo
    yield Promise.all([
        models_1.Usuario.updateOne({
            _id: id
        }, {
            $pull: {
                rol: 'ROLE_NUEVO'
            }
        }),
        models_1.Usuario.updateOne({
            _id: id
        }, {
            $addToSet: {
                rol: 'ROLE_USER'
            }
        }),
        // Usuario.deleteMany({
        //     _id: {
        //         $in: [ ...usuariosIds ]
        //     }
        // })
        models_1.Usuario.deleteMany({
            rol: {
                $in: ['ROLE_NUEVO']
            },
            _id: {
                $ne: id
            },
            $expr: {
                $gte: [{
                        $dateDiff: {
                            startDate: '$createdAt',
                            endDate: new Date(),
                            unit: 'day'
                        }
                    }, 7]
            }
        })
    ]);
    const user = yield models_1.Usuario.findById(id);
    const token = yield (0, helpers_1.generarJWT)(user.id, user.nombre, user.apellido, user.rol);
    res.status(201).json({
        ok: true,
        data: user,
        token
    });
});
exports.validarUsuarioCreado = validarUsuarioCreado;
const reenviarCorreo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { baseUrl } = req.body;
    try {
        const tokenAntiguo = req.header('x-token'); //aqui el token proporcionado en el header debe ya estar caducado para que entonces se envie otro correo con otro token
        if (!tokenAntiguo) {
            return res.status(400).json({
                ok: false,
                error: 'No se encuentra el token en el header'
            });
        }
        const { id } = JSON.parse(atob(tokenAntiguo.split('.')[1])); //con esto se obtiene el payload del token, no se hizo de la forma en que está en el archivo validar-jwt.ts de la carpeta middlewares porque ahí solo se obtiene el payload si el token no ha expirado, pero en este caso aqui a esta funcion se manda el token ya expirado para generar uno nuevo y asi reenviar el correo con ese nuevo token que ya esté correcto, pero de esta forma no importa si ya está expirado o no, de todos modos se va a pasar este token
        const usuario = yield models_1.Usuario.findOne({
            _id: id,
            rol: {
                $in: ['ROLE_NUEVO']
            }
        });
        if (usuario) {
            const { id, nombre, apellido, rol, email } = usuario;
            const token = yield (0, helpers_1.generarJWT)(id, nombre, apellido, rol);
            const info = yield enviarCorreo(token, baseUrl, nombre, apellido, email);
            // console.log(info);
            return res.json({
                ok: true,
                data: {
                    mensaje: `Correo reenviado a ${email}, favor de verificarlo, no olvidarse de checar la parte de correos no deseados`
                }
            });
        }
        else {
            throw new Error(''); //para que se ejecute el catch de abajo
        }
    }
    catch (err) {
        res.status(400).json({
            ok: false,
            error: 'No se pudo reenviar el correo. Es probable que el usuario ya haya sido registrado, caso contrario favor de registrarlo de nuevo'
        });
    }
});
exports.reenviarCorreo = reenviarCorreo;
const obtenerUsuarios = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { role = 'user', buscar, edad: age, ordenar: order = 'nombre', asc = 1, desde = 0, limite = 10 } = req.query; //aqui obtenemos los query params para buscar por rol con el parametro de role, buscar por nombre, apellido o email con el parametro buscar, buscar por edad con el parametro edad (que la edad sea igual o mayor a la que se ponga en ese parametro), ordenar por alguno de los atributos incluyendo el nombre, apellido, edad, email y peso con el parametro ordenar, decir si se ordenará ascendentemente (con un valor mayor a 0 o que no sea numero como letras) o descendentemente (con un valor igual o menor a 0) con el parametro asc, que se pagine con los parametros desde y limite para decir desde qué documento se empiece a hacer el filtro y todo con el parametro desde, y cuántos elementos mostrar (minimo debe ser 1 documento o ninguno en caso que no se encuentre ninguno por los filtros) con el parametro limite, asi funciona, y todos estos parametros son opcionales porque son query params, si no se pone ninguno entonces se mostrarán todos los documentos con limite de 10 documentos, osea los primeros 10 documentos se mostrarán por default asi como se puso aqui, y abajo se hacen unas pequeñas validaciones con estos parametros para que no dé error
    const ordenar = order.length == 0 ? 'nombre' : order;
    const direccion = Number.isNaN(Number(asc)) || asc == '' ? 1 : asc > 0 ? 1 : -1;
    const termino = (buscar) ? new RegExp(buscar, 'i') : new RegExp(''); //si se encuentra el parametro buscar en los query params que se haga esto del RegExp visto en el curso de node js para buscar como un like de esta forma: %buscar% , y si no se encuentra el parametro buscar entonces igual se pondrá un regExp pero con un string vacio que significa que con todos va a coincidir, osea es como si no se estuviera filtrando nada y mostrara todos asi con un regExp con un string vacio, y si con el RegExp en lugar de hacer un like asi: %buscar% fuera buscar% entonces en el primer parametro del RegExp se pondría: '^' + buscar , y si fuera %buscar entonces se pondría buscar + '$' , ya que en javascript para expresiones regulares se pone un signo de peso ($) al final de la expresion regular para decir que termine con eso, osea un like asi: %buscar , y al principio se pone un signo ^ para decir que empiece con eso, osea un like asi: buscar% , y no se pone ninguno de los 2 signos cuando queremos un like asi: %buscar% , y pues en este caso asi le estamos haciendo, y opcionalmente se pone 'i' como segundo parametro del RegExp para decir que sea case-insensitive, osea que no reconozca mayusculas ni minusculas, esto tambien se vio en el curso de node js
    const skip = Number.isNaN(Number(desde)) || desde == '' ? 0 : desde >= 0 ? Number(desde) : 0;
    const limit = Number.isNaN(Number(limite)) || limite == '' ? 10 : limite > 0 ? Number(limite) : 10;
    const filtroBusqueda = [
        {
            $and: [
                { $expr: { $ne: [role, 'admin'] } },
                {
                    $nor: [
                        {
                            rol: {
                                $in: ['ROLE_ADMIN', 'ROLE_NUEVO']
                            }
                        }
                    ]
                },
                {
                    $or: [
                        {
                            nombre: termino
                        },
                        {
                            apellido: termino
                        },
                        {
                            email: termino
                        }
                    ]
                }
            ]
        },
        {
            $and: [
                { $expr: { $eq: [role, 'admin'] } },
                {
                    rol: {
                        $in: ['ROLE_ADMIN']
                    }
                },
                {
                    $or: [
                        {
                            nombre: termino
                        },
                        {
                            apellido: termino
                        },
                        {
                            email: termino
                        }
                    ]
                }
            ]
        },
    ];
    const edadCalculo = {
        //lo siguiente es para calcular la edad con mongodb en base a una fecha de nacimiento que es lo que tenemos en el modelo de usuario, ya que en el modelo de usuario solo tenemos la fecha de nacimiento pero no la edad, asi que asi de esta manera se calcula restando el año actual con el año de la fecha de nacimiento, y al resultado de esa resta se le restará 1 si dentro del presente año ya cumplió años y si no ha cumplido años dentro del presente año que no se le reste nada a ese resultado, esto usando la condicion con el $cond y el $dayOfYear que se ve abajo, y asi podemos obtener la edad de forma correcta
        $subtract: [
            {
                $subtract: [{ $year: '$$NOW' }, { $year: '$detalle.fechaNacimiento' }] //el $$NOW es el equivalente al now() de mysql, osea retorna la fecha actual con todo y su hora y minutos y segundos, y con el $year obtenemos el puro año de esa fecha, y si quisieramos el puro mes (el numero del mes) pondríamos $month, y si quisieramos el dia (el numero del dia del mes) pondríamos $day, pero en este caso nos interesa solo el año de la fecha actual y el año de la fecha de nacimiento, por eso aqui usamos el $year
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
    // const usuarios = await Usuario.find({
    //     estado: true,
    //     $or: filtroBusqueda, //aqui se pone el array de la variable filtroBusqueda creada arriba, osea es como si ese contenido de esa variable se pusiera aqui, esto tambien se puede hacer
    //     $expr: { //aqui si no se pone esto de $expr da error porque el $gt, $gte, $lt, $lte por default siempre debe llevar un atributo como padre (arriba) para saber si ese atributo es mayor que o menor que algo como se vio en el curso de mongodb, pero si queremos que se filtre con el $gt, $lt, $gte y $lte de manera que no dependa de un atributo existente en el modelo sino de cosas externas o calculos como se ve aqui entonces para eso se ocupa el $expr para decir que eso es una expresion y asi no dé error, esto tambien se explicó arriba
    //         $gte: [ //si la edad (el calculo que se hizo arriba calculando la edad con mongodb con la variable edadCalculo de arriba) es mayor o igual a la variabe age, la cual es el numero del query param de edad visto arriba
    //             edadCalculo,
    //             Number(age)
    //         ]
    //     }
    // }).sort({
    //     [ordenar as string]: direccion //tambien tanto con el find como con el aggregate de abajo se puede poner atributos dinamicos como en los objetos literales de javascript y se ponen igual entre corchetes ([]) como se ve aqui
    // })
    /*.lean()*/ ; //con el metodo lean() que ponemos al final del metodo find, findOne, findById, etc obtenemos un objeto puro de javascript, ya que hemos visto arriba que cuando tenemos una instancia de un modelo (la cual se retorna al ejecutar los metodos de mongoose de find, findOne, etc o al poner new Usuario(objeto)) esa instancia no es un objeto puro de javascript ya que internamente tiene, ademas de los atributos que nos interesan del modelo, atributos especiales retornados por mongoose, pero si nosotros queremos convertirlo a un objeto literal de javascript (si se retorna un solo objeto) o un array de objetos (si se retorna varios objetos) sin tener los atributos especiales de mongoose entonces para eso se pone el metodo lean() del find, findOne, findById, etc, aunque como asi tendríamos un objeto puro de javascript entonces al retornarlo como json ya no se ejecutaría la funcion del toJSON del modelo que pusimos en el archivo usuario.ts de la carpeta models, porque eso se ejecutaría para modelos del usuario, pero pues como le aplicamos el metodo lean() eso ya no sería una instancia del modelo sino que simplemente sería un objeto comun de javascript, asi que por eso ya no se ejecutaría esa funcion de toJSON
    //const usuarios3 = new Usuario();
    //usuarios3.toJSON(); //asi con el metodo toJSON() o tambien con el metodo toObject() se convierte a objeto normal de javascript una instancia del modelo de Usuario pero ahora creada con el new Usuario como se ve arriba, ya que cuando lo creamos de esta manera no está el metodo lean() visto mas arriba, pero sí tenemos el toJSON() o el toObject() para eso
    //aqui abajo tenemos una consulta con el aggregate, esto del aggregate está disponible en mongoose y en mongodb, y sirve para hacer consultas de select, osea no para modificar sino solo para obtener como el find (al igual que el find retorna un array), pero a diferencia del find con el aggregate se puede hacer la consulta mas personalizada, ya que con el aggregate se puede agregar atributos al resultado aun cuando esos atributos no estén en el modelo, en este caso en el modelo de usuario del archivo usuario.ts de la carpeta models, tambien se puede cambiar la forma en como se muestra un atributo de un array, se puede hacer group by como los de mysql, se puede modificar el valor de los atributos en el resultado, se puede hacer left join o inner join como en mysql, etc, esas cosas el find no las puede hacer porque el find solo tiene la parte del filtro de los documentos y se le puede poner un segundo parametro para hacer proyecciones como se vio en el curso de mongodb, pero esas 2 cosas del filtro y las proyecciones el aggregate ya las tiene, abajo se ve esto, y ademas el aggregate tambien tiene lo demas que se dijo, asi que con el aggregate podemos hacer consultas mas personalizadas, aunque con mongoose con el aggregate no se obtiene una instancia del modelo de usuario en este caso, intenté convertirlo a instancia pero no hubo forma y abajo comenté un map del array obtenido de los usuarios convirtiendo cada objeto de ese array en new Usuario para intentar convertirlo a instancia, pero salen cosas raras asi y por eso lo dejé comentado mas abajo al terminar el siguiente aggregate, asi que mejor con el aggregate no se obtiene una instancia de ese modelo, sino solo objetos como tal de javascript como sería aplicando el metodo lean() al find como se vio arriba, por lo tanto al retornar como json un objeto o array obtenido del aggregate no se ejecutará la funcion toJSON del modelo que pusimos en el archivo usuario.ts de la carpeta models, pero en el aggregate de abajo hicimos lo mismo que hicimos en esa funcion toJSON, solo que ahi pues se hizo usando javascript y aqui con el aggregate se hizo usando puro mongodb, y entonces el find que se comentó arriba resultaría en lo mismo que este aggregate de abajo ya teniendo en cuenta lo que se puso en la funcion toJSON del modelo, la cual sí se ejecutaría para lo retornado con el find de arriba, pero ya con eso tanto el find de arriba como el aggregate de abajo resultarían en l misma respuesta JSON, checar lo que se explica en este aggregate
    //OJO que el ordenar del anterior find y el del siguiente aggregate tendrán unas pequeñas diferencias ya que el find de arriba como es un find no se le puede agregar atributos y por lo tanto no podemos ordenar por edad ya que el atributo edad no existe en el modelo de usuario, se puede agregar ese atributo de edad en la funcion toJSON del modelo si usamos el find de arriba, pero en ese punto de esa funcion del toJSON no se puede saber qué atributo queremos ordenar, asi que con el find de arriba no se podrá ordenar por edad, pero con el aggregate de abajo sí se puede
    const usuarios = yield models_1.Usuario.aggregate([
        //NOTA: abajo vemos se comentó el $addFields porque eso se puso en la funcion del UsuarioSchema.pre('aggregate', function() {}) que está en el modelo del usuario en el archivo usuario.ts de la carpeta models, ya que hemos visto (en el curso de react en la parte del backend del proyecto del calendar se ve esto) que con el pre se ejecuta un middleware, osea una funcion que se hace antes de algo, y con el pre es una funcion que se hace antes o durante la ejecucion de algun metodo como el find (con el UsuarioSchema.pre('find'....)), findOne o aggregate en este caso, pero como ahí estamos poniendo ese pre con el UsuarioSchema entonces esa funcion se ejecutaría cada vez que usemos el modelo del Usuario, no de otro modelo, osea si ponemos UsuarioSchema.pre('aggregate'...) esa funcion se ejecutaría cada vez que pongamos Usuario.aggregate([]), o si ponemos UsuarioSchema.pre('find'...) entonces esa funcion se ejecutaría cada vez que ponemos Usuario.find({}) , pero solo de es esquema y del metodo que especifiquemos en el primer parametro del pre pues, asi que en ese archivo del modelo del usuario pusimos el pre para el aggregate, por lo tanto se va a ejecutar esa funcion antes de que el aggregate retorne algo, por eso se llama pre, y ahi vemos que pusimos this.pipeline(), eso obtiene el array puesto dentro del aggregate, ya que ese array es el pipeline o pipelineStage[] del aggregate como se explicó arriba, y vemos que entonces a ese array obtenido con el this.pipeline() le agregamos al inicio de ese array el mismo objeto con el $addFields, y asi es como si ese objeto con el $addFields que se comentó abajo no se hubiera comentado, es como si lo tuviera ahi porque ahi en esa funcion del pre se le agrega antes de que este aggregate retorne algo, mientras se está ejecutando, y tambien existe el post en lugar del pre que se ejecuta ya que se ha retornado algo, osea el UsuarioSchema.post('aggregate'....) se ejecutaría ya que el aggregate haya retornado algo, aunque pues es mas usado el pre. Y asi entonces se ejecutaría esa funcion que está en el modelo del usuario cada vez que pongamos Usuario.aggregate en cualquier archivo del proyecto
        // {
        //     $addFields: { //el $addFields sirve para agregar un atributo dentro de este aggregate, que en este caso es el atributo llamado edad que tendrá el mismo resultado que se retorna en el objeto de la variable edadCalculo vista arriba, y digo que se añadirá ese atributo dentro  de este aggregate porque despues de esto se podrán hacer cosas con este atributo de edad como hacer filtros por este atributo o mas cosas incluso aunque este atributo de edad no exista en el modelo de usuario, esto es algo que el find, fingOne y findById de mongoose no puede hacer como se explicó arriba, y tambien este atributo de edad puede estar en los objetos del array retornado por el aggregate si en el $project de mas abajo dentro de este aggregate se le pone edad: true para que este atributo creado aqui se ponga en cada objeto del array que vaya a retornar este aggregate
        //        //el $addFields es exclusivamente para agregar un atributo que no exista en el modelo de usuario, mientras que el $set que se ve mas abajo es para tanto agregar un atributo que no exista como para modificar un atributo que sí exista en el modelo de usuario como se vio en el curso de mongodb 
        //        edad: edadCalculo //al $addFields se le puede poner mas atributos para crear, no solo uno
        //     }
        // },
        {
            $match: {
                //tambien podemos repetir el mismo operador en otros objetos dentro del aggregate, osea tambien en otro objeto de este aggregate pudimos haber puesto otro $match por ejemplo, y asi ese otro $match actuará como un and de este $match, osea que se deben cumplir ambos filtros con el $match
                estado: true,
                $or: filtroBusqueda,
                $expr: {
                    $gte: ['$edad', Number(age)] //NOTA: vemos que aqui usamos el atributo edad añadido arriba en este aggregate (o en la funcion pre del aggregate en el modelo del usuario del archivo usuario.ts de la carpeta models como se explicó arriba), y esto se puede hacer en el aggregate, y OJO que aqui le pusimos $edad y no solo edad, y es que cuando queremos referirnos al valor de ese atributo pero no usar ese atributo como modificar ese atributo o algo asi, sino solo lectura del valor de ese atributo entonces se pone el nombre de ese atributo con el signo de peso ($) al principio como se ve aqui, pero cuando ya queremos modificar ese atributo, osea que no es solo modo lectura pues se pone sin el signo de peso ($), por eso aqui se pone $edad porque solo queremos su valor, en modo lectura pues
                }
            }
        },
        {
            $set: {
                nombre: {
                    $concat: ['$nombre', ' ', '$apellido'] //asi se hace una concatenacion de strings con el $concat, y retorna el string ya concatenado
                },
                'detalle.peso': {
                    $cond: {
                        if: {
                            $eq: ['$detalle.peso', 0]
                        },
                        then: null,
                        else: {
                            $concat: [{ $toString: '$detalle.peso' }, ' ', 'kg'] //para usar el $concat todos los elementos de su array para concatenar deben ser de tipo string, y en este caso el atributo peso del objeto interno de detalle (por eso se puso '$detalle.peso') es de tipo numerico, por eso necesitamos convertirlo a string y es lo que se hizo aqui con el $toString, y usando el $toString se puso llaves ({}) como vemos aqui porque pues no es un valor statico como los strings que se pusieron en el segundo elemento y tercer elemento de este array, sino que es un valor calculado pues, un valor dinamico usando el $toString de mongodb para cambiar dinamicamente el valor de algo, en este caso para que se convierta a string, y cuando es asi debemos usar las llaves ({}) como se ve aqui, y asi el $toString retornará el valor del $detalle.peso en string 
                        }
                    }
                },
                'detalle.fechaNacimiento': {
                    $dateToString: {
                        format: '%d/%m/%Y',
                        date: '$detalle.fechaNacimiento'
                    }
                },
                rol: {
                    //el $filter es lo mismo que un filter de javascript, sirve par recibir un array y retornar un array filtrado, y en este caso se está retornando un array basado en el atributo rol del usuario (que tambien es un array) que solo tenga los elementos con el valor de 'ROLE_ADMIN' o 'ROLE_USER', solo esos elementos para asegurarnos que solo retornen esos roles que son los que interesan en este proyecto por si se le movió a la base de datos y al atributo rol de un usuario se le puso otros elementos en su array que no sean esos por ejemplo
                    $filter: {
                        input: '$rol',
                        as: 'rolElement',
                        cond: {
                            $or: [
                                { $eq: ['$$rolElement', 'ROLE_USER'] },
                                { $eq: ['$$rolElement', 'ROLE_ADMIN'] }
                            ]
                        }
                    },
                }
            }
        },
        {
            $addFields: {
                peso: '$detalle.peso'
            }
        },
        {
            $sort: {
                [ordenar]: direccion //aqui se puso una llave que pueda tener un valor dinamico poniendole corchetes ([]) como se puede hacer en los objetos literales de javascript, igual eso se puede hacer en mongodb, ya que el atributo sobre el que se va a ordenar cambia segun lo que se ponga en el query param de ordenar
            }
        },
        {
            $project: {
                _id: false,
                id: '$_id',
                nombre: true,
                // apellido: false, //esto no se puede hacer en el $project, ya que los campos que no pongamos en true automaticamente no se mostrarán, pero no podemos ponerle false (si no da error) excepto al _id, ese campo es el unico al que podemos ponerle false ya que ese por default lo trae aunque no lo especifiquemos aqui en el $project, asi que para que no se muestre tenemos que hacerlo manualmente de ponerle false, pero solo para ese atributo 
                email: true,
                rol: {
                    $cond: {
                        if: {
                            $and: [
                                { $isArray: '$rol' },
                                { $eq: [{ $size: '$rol' }, 1] } //con el $size se retorna la longitud de un array, osea la cantidad de elementos de un array, y aqui con el $eq estamos diciendo que retorne true si la longitud del array del atributo rol es 1, osea si solo tiene 1 elemento ese array del rol
                            ]
                        },
                        then: {
                            $arrayElemAt: ['$rol', 0] //con el aggregate no podemos poner $rol.0 o rol.0 para obtener el primer elemento de un array, asi que para obtener elementos de un array basado en sus indices ponemos el $arrayElemAt, poniendole un array en el que el primer parametro será el array y el segundo parametro será el indice donde está el elemento del array que queremos retornar, en este caso se le puso 0 ahi para retornar el primer elemento del array
                        },
                        else: '$rol'
                    }
                },
                detalle: true,
                edad: true,
                // img: true
                //vemos que aqui no pusimos el atributo del peso en true, ese creado arriba con el $addFields, ya que en realidad no nos interesa retornar ese atributo ya que ya lo tiene el atributo detalle, ese atributo del peso creado arriba con el $addFields solo lo creamos para que fuera como un comodin para poder ordenar con el $sort tambien el peso 
            }
        },
        {
            $skip: skip //con el $skip del aggregate le decimos que omita los documentos que le pongamos aqui como numero, osea si le ponemos 0 entonces no omitirá ningun y se empezará desde el primer documento, pero si le ponemos 1 entonces omitirá el primer documento y empezará en el segundo documento y asi, como el skip visto en el curso de mongodb para el find, igual, e igual el $limit de abajo para decir cuántos documentos queremos que se muestren, igual que el limit visto en el curso de mongodb con el find, y combinar el skip con el limit nos ayuda a tener una paginacion en los resultados que tengamos
        },
        {
            $limit: limit //esto se explicó arriba con el $skip
        },
        // {
        //     $unwind: '$rol' //el $unwind se usa con tributos de array, de modo que solo se le puede poner atributos de array como este atributo de rol aqui, y sirve para que si por ejemplo tenemos un documento que tenga un array vacio de rol o que el atributo de rol tenga el valor de null pues ese documento no se mostrará en el resultado del aggregate, aunque ese documento (o documentos si tenemos mas asi con el atributo rol como array vacio o en null) coincida con el filtro puesto en el $match del aggregate aun asi ese documento se excluirá de lo que retorne el aggregate debido a esa propiedad del $unwind con el atributo rol en este caso, y si ese atributo de rol es un array que tiene 1 solo elemento entonces el documento solo se mostrará 1 vez pero con ese atributo de rol ya no como array sino como string o numero o lo que sea que tenía almacenado ese array, como aplanando ese array pues, pero el verdadero truco del $unwind viene cuando tenemos en ese atributo de array mas de 1 elemento, si por ejemplo en el array del atributo rol tenemos 'ROLE_USER' y 'ROLE_ADMIN' entonces ese documento se mostrará 2 veces, asi todo repetido pero con la diferencia en ambos de que uno tendrá en su atributo rol el string con el valor de 'ROLE_USER' y el otro tendrá en su atributo rol el string con el valor de 'ROLE_ADMIN', osea que cada elemento del array lo va a buscar aplanar para convertirlo a que no sea array y lo hará en diferentes documentos aunque repetidos con el mismo usuario pero cambiando el atributo que antes era un array a su version aplanada, recorriendo cada elemento de ese array, y esto nos puede ser util cuando hagamos left join con el $lookup de mongodb por ejemplo en base a un atributo de un array por ejemplo o con el $group, cosas asi, asi funciona el $unwind, aqui no nos conviene usarlo en esta situacion pero en otros casos nos puede ser de utilidad y por eso lo comentamos aqui
        // },
    ]);
    // usuarios = usuarios.map(u => new Usuario(u)); //esto se intentó hacer pero no resultó para convertir bien el objeto retornado por el aggregate (en este caso un array) a una instancia del modelo de usuario, esto se explicó arriba, asi que no hacer esto
    const total = yield models_1.Usuario.countDocuments({
        estado: true,
        $or: filtroBusqueda,
        $expr: {
            $gte: [
                edadCalculo,
                Number(age)
            ]
        }
    });
    const docs = yield models_1.Usuario.aggregate([
        //el siguiente $addFields se comentó por lo que se explicó mas arriba
        // {
        //     $addFields: {
        //         edad: edadCalculo
        //     }
        // },
        {
            $match: {
                _id: {
                    $in: [...usuarios.map(u => u.id)] //asi filtramos por los mismos usuarios que se obtuvo con el aggregate de arriba
                }
            }
        },
        {
            $group: {
                _id: '$edad',
                conteo: { $sum: 1 },
                pesoPromedio: { $avg: '$detalle.peso' }
            }
        },
        {
            $project: {
                _id: false,
                edad: '$_id',
                conteo: true,
                pesoPromedio: true
            }
        },
        {
            $sort: {
                'pesoPromedio': 1
            }
        }
    ]);
    return res.status(200).json({
        ok: true,
        data: usuarios,
        totalTodos: total,
        estadistica: docs
    });
});
exports.obtenerUsuarios = obtenerUsuarios;
const obtenerUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { id: idLogueado, rol } = req.payload;
    if (!rol.includes('ROLE_ADMIN')) {
        if (id != idLogueado.toString()) { //si el usuario que accede a este endpoint no tiene el rol de administrador y si el id del usuario al que quiere consultar no es el mismo que el usuario que esté logueado entonces se retorna un error, ya que un usuario que no es administrador solo puede consultarse a sí mismo porque no puede saber la informacion de otro usuario mas que de él, pero un administrador sí puede saber tanto la información de él mismo como de los demas sean no administradores como administradores, asi que por eso pusimos esta condicion
            return res.status(403).json({
                ok: false,
                error: 'No puedes ver este recurso'
            });
        }
    }
    // const usuario = await Usuario.findById(id); //asi podríamos obtener el usuario por su id, pero OJO que con esto no podríamos obtener los libros de este usuario, y no podríamos usar el populate porque el populate solo funciona cuando tenemos el atributo de union entre colecciones en el modelo de usuario en este caso, pero vemos que en el models de usuario en el archivo usuario.ts de la carpeta models no hay ningun atributo que una a sus libros, asi que no podemos obtener los libros del usuario usando el populate aqui, asi que una solucion a esto podría ser usar la funcion toJSON del modelo de usuario y ahi agregarle un atributo de libros por ejemplo y usar ahi el modelo de los libros para encontrar los libros de ese usuario por su id, tambien otra solucion podría ser hacer aqui manualmente de agregarle a ese usuario sus libros transformando lo que retorne esta linea a objeto normal de javascript como usar el metodo lean() por ejemplo que se ve arriba, y otra solucion que es la que se usó abajo es hacer un left join con el $lookup de mongodb usando el aggregate que se vio mas arriba, abajo se explica esto y asi podremos acceder al modelo de libros uniendo los usuarios con sus libros por medio del id del usuario con el atributo usuario del modelo de libro del archivo libro.ts de la carpeta models, ya que ese atributo de usuario del modelo de libro tiene el id del usuario al que le corresponde, entonces asi podemos hacer el left join con el $lookup (el $lookup siempre hará un left join y retornará siempre un array y los usuarios que no tengan libros relacionados pues aparecerán con el atributo de union que genera el $lookup como un array vacio (solo ese atributo de union) y si queremos hacer un inner join pues podemos hacer un filtro con el $match del aggregate para excluir a los usuarios que en su atributo de union generado por el $lookup que tengan un array vacio y asi ya tendríamos el inner join), checar abajo la explicacion del $lookup del aggregate
    const usuario = yield models_1.Usuario.aggregate([
        {
            $match: {
                _id: new objectId(id)
            }
        },
        {
            $set: {
                nombre: {
                    $concat: ['$nombre', ' ', '$apellido']
                },
                'detalle.peso': {
                    $cond: {
                        if: {
                            $eq: ['$detalle.peso', 0]
                        },
                        then: null,
                        else: {
                            $concat: [{ $toString: '$detalle.peso' }, ' ', 'kg']
                        }
                    }
                },
                'detalle.fechaNacimiento': {
                    $dateToString: {
                        format: '%d/%m/%Y',
                        date: '$detalle.fechaNacimiento'
                    }
                },
                rol: {
                    $filter: {
                        input: '$rol',
                        as: 'rolElement',
                        cond: {
                            $or: [
                                { $eq: ['$$rolElement', 'ROLE_USER'] },
                                { $eq: ['$$rolElement', 'ROLE_ADMIN'] }
                            ]
                        }
                    },
                }
            }
        },
        {
            $lookup: {
                //Con lo explicado en la anterior linea, se puede poner tambien un atributo llamado let en el $lookup, en el cual establecemos una variable o mas para usarse dentro del pipeline de ese $lookup, vemos por ejemplo que en este primer $lookup de aqui pusimos let: { idUsuario: '$_id' }, eso significa que a la variable creada llamada idUsuario se le va a agregar el valor del _id del usuario porque es desde donde se aplicó este $lookup, y entonces para usar esa variable de idUsuario dentro del pipeline de ese $lookup se pone '$$idUsuario', asi con doble signo de peso ($$), y vemos que en el segundo $lookup igual pusimos el let, ahora con el valor de { idLibro: '$_id' }, y ahí '$_id' será el valor del _id pero ahora de la coleccion de libros, ya no de la coleccion de usuarios porque estamos ahi dentro del pipeline del primer $lookup y eso nos posicionará dentro de la coleccion de libros debido al from de ese $lookup, por eso ese _id será el de la coleccion de libros, y en el pipeline de ese segundo $lookup podremos usar '$$idLibro' para tener el valor de ese id del libro y con ese valor pues hacer cosas ahi como un filtro con el $match o cosas asi dentro del pipeline de ese segundo $lookup 
                //tambien hay una forma de que lo que retorne el $lookup no sea un array y que se haga un merge con el objeto original en este caso del usuario de modo que los atributos de la coleccion con la que se hace el left join en el $lookup se van a unir en el objeto de usuario en este caso, eso se puede ver en esta pagina (empieza mas o menos en la mitad de esa pagina desde donde dice 'Examples'): https://www.mongodb.com/docs/manual/reference/operator/aggregation/lookup
                from: 'libros',
                localField: '_id',
                foreignField: 'usuario',
                as: 'libros',
                let: { idUsuario: '$_id' },
                pipeline: [
                    {
                        $lookup: {
                            from: 'autors',
                            localField: 'autores',
                            foreignField: '_id',
                            as: 'autores',
                            let: { idLibro: '$_id' },
                            pipeline: [
                                {
                                    $set: {
                                        nombre: {
                                            $concat: ['$nombre', ' ', '$apellido']
                                        }
                                    }
                                },
                                {
                                    $project: {
                                        _id: false,
                                        id: '$_id',
                                        // idLibro: '$$idLibro',
                                        nombre: true
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $project: {
                            _id: false,
                            id: '$_id',
                            // idUsuario: '$$idUsuario',
                            nombre: true,
                            // isbn: true,
                            autores: true,
                            img: true
                        }
                    },
                ]
            }
        },
        {
            $project: {
                _id: false,
                id: '$_id',
                nombre: true,
                email: true,
                rol: {
                    $cond: {
                        if: {
                            $and: [
                                { $isArray: '$rol' },
                                { $eq: [{ $size: '$rol' }, 1] }
                            ]
                        },
                        then: {
                            $arrayElemAt: ['$rol', 0]
                        },
                        else: '$rol'
                    }
                },
                detalle: true,
                libros: true,
                edad: true,
                totalLibros: {
                    $size: '$libros'
                }
            }
        }
    ]);
    return res.json({
        ok: true,
        data: usuario[0], //aqui pusimos el indice 0 porque hay que recordar que el aggregate retorna siempre un array, y pues en el aggregate de arriba de filtró por el id puesto como request param, entonces solo se traerá a un solo usuario y por eso ese array solo tendrá un elemento y por eso aqui le pusimos el indice 0
    });
});
exports.obtenerUsuario = obtenerUsuario;
const actualizarUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const usuario = yield models_1.Usuario.findById(id);
    const { id: idLogueado } = req.payload;
    if (usuario.id.toString() != idLogueado) { //los administradores tampoco pueden modificar el usuario de alguien mas, solo pueden borrar el usuario de alguien mas o convertir a un usuario que no sea administrador en administrador, pero tanto los administradores como los no administradores solo pueden actualizar su propio usuario
        return res.status(401).json({
            ok: false,
            error: 'No puede modificar un usuario que no le pertenece'
        });
    }
    const _b = req.body, { rol, estado, passwordNew, passwordOld, img } = _b, body = __rest(_b, ["rol", "estado", "passwordNew", "passwordOld", "img"]);
    const passwordCoincide = bcryptjs_1.default.compareSync(passwordOld, usuario.password);
    if (!passwordCoincide) {
        return res.status(400).json({
            ok: false,
            error: 'Contraseña incorrecta'
        });
    }
    if (!(0, helpers_1.esPesoValido)(body.detalle.peso)) {
        return res.status(400).json({
            ok: true,
            error: 'No se proporcionó un peso valido'
        });
    }
    const salt = bcryptjs_1.default.genSaltSync();
    body.password = bcryptjs_1.default.hashSync(passwordNew, salt);
    body.nombre = (0, helpers_1.capitalizar)(body.nombre);
    body.apellido = (0, helpers_1.capitalizar)(body.apellido);
    const userActualizado = yield models_1.Usuario.findByIdAndUpdate(usuario.id, body, { new: true });
    return res.status(201).json({
        ok: true,
        data: userActualizado
    });
});
exports.actualizarUsuario = actualizarUsuario;
const actualizarUsuarioRol = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ids, rol } = req.body;
    const resp = yield models_1.Usuario.updateMany({
        _id: {
            $in: [...ids]
        }
    }, {
        // $push: { //esto del $push se vio en el curso de mongodb, y sirve para añadir elementos a un array en el final de ese array, en este caso se añade el valor de la variable rol al atributo rol, y ese atributo pues es un array, aunque con el $push se puede agregar un elemento que ya exista a ese array, por ejemplo si en ese array de rol ya existe el elemento 'ROLE_USER' y aqui se le está agregando el string 'ROLE_USER' con el $push entonces aunque en el array ese elemento estaría repetido sí se agregaría al array, esto con el $push visto en el curso de mongodb, pero con el $addToSet que se ve abajo igual se añade un elemento a un array pero si ese elemento ya está en el array entonces no lo agrega, por eso en su nombre tiene la parte de Set, como los Set de Java o Javascript que no permiten que haya elementos repetidos
        //     rol
        // }
        $addToSet: {
            rol
        }
        // $addToSet: { //con el $push y tambien con el $addToSet podemos poner el $each que sirve para que si al atributo le ponemos un array que ese array como tal no se agregué a ese atributo que es un array, osea para que no quede un array interno dentro del array, y asi para que los elementos del array que le pasemos se pongan dentro del atributo que es tambien un array y asi no quede un array interno pues, esto gracias al $each
        //     rol: {
        //         $each: [ rol ]
        //     }
        // }
    });
    const numeroActualizados = resp.modifiedCount ? resp.modifiedCount : 0;
    return res.status(201).json({
        ok: true,
        data: {
            mensaje: `Se actualizaron ${numeroActualizados} documentos`
        }
    });
});
exports.actualizarUsuarioRol = actualizarUsuarioRol;
const borrarUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { id: idLogueado, rol } = req.payload;
    if (!rol.includes('ROLE_ADMIN')) {
        if (idLogueado.toString() != id) {
            return res.status(403).json({
                ok: false,
                error: 'No puede modificar un usuario que no le pertenece'
            });
        }
    }
    else {
        const usuarios = yield models_1.Usuario.find({
            rol: {
                $in: ['ROLE_ADMIN']
            },
            estado: true
        });
        if (usuarios.length == 1 && idLogueado.toString() == id) {
            return res.status(400).json({
                ok: false,
                error: 'Tiene que haber minimo 1 usuario administrador, no puede realizar esta accion'
            });
        }
    }
    // await Usuario.findByIdAndUpdate(id, { estado: false }); //NOTA: El usuario se pudo haber eliminado asi (en realidad no eliminado fisicamente de la base de datos sino actualizandolo con su atributo estado en false), pero al eliminar el usuario tambien debemos eliminarle sus libros y autores (y esos sí se eliminan fisicamente de la base de datos), entonces eso podemos hacerlo aqui mismo de eliminarle sus libros y autores a este usuario, pero hay otra manera de hacerlo y es eliminar en cascada, aunque en mongoose no existe como tal eso de que automaticamente si se elimina un documento que se eliminen tambien los documentos que tiene relacionados, eso en spring por ejemplo sí existe pero en mongoose no, pero para simular lo que sería realizar funciones en cascada sería usar la funcion pre en el modelo, en este caso en el modelo usuario del archivo usuario.ts de la carpeta models, y en esa funcion de pre ponerle el metodo que estamos ejecutando aqui de modo que esa funcion de pre se va a ejecutar automaticamente cuando se esté ejecutando este metodo de aqui, osea la funcion de pre es un middleware, y entonces ahi en esa funcion de pre se puede eliminar los libros y autores de este usuario y aqui solo eliminar el puro usuario y ya, aunque esta linea se comentó porque todo lo que es encontrar por id no funciona con el pre, osea a la funcion pre no se le puede poner el metodo de findById, ni findByIdAndUpdate ni findByIdAndDelete, pero sí podemos ponerle los demas metodos como el updateOne, y por eso esta linea se comentó y se puso el updateOne de la siguiente linea, para que pusieramos ese metodo de updateOne en la funcion pre del modelo de usuario donde pusimos UsuarioSquema.pre('updateOne', function(next) {}), y se pone function siempre a las funciones que pongamos dentro de los modelos como el pre o el toJSON porque asi podemos usar el this, osea el objeto del modelo para que asi podamos acceder a los valores de los atributos de ese modelo ya que nos podrían ser utiles ahi, y pues con una funcion de flecha no se puede acceder al this ahí, ya que pues no están dentro de una clase y eso se vio en la parte 2 del curso de javascript, y vemos ahi que al function le pusimos como parametro next y eso es para decirle que continue para que haga esta operacion de aqui ya que si no le ponemos eso entonces no hará la operacion de aqui, por eso es importante ponerle ese next y ese next solo se pone para los metodos que modifiquen la base de datos como este updateOne, o para el findOneAndDelete por ejemplo, o updateMany y asi, pero no para los que solo retornan informacion pero no modifican nada como el find o findOne, y tambien ese parametro de next se pone para la funcion pre con el metodo de 'validate', osea UsuarioSchema.pre('validate', function(next) {}), y ese de validate no modifica la base de datos pero se ejecuta justo antes de hacer alguna modificacion a la base de datos y pues hace una validacion antes de hacer esa modificacion 
    yield models_1.Usuario.updateOne({
        _id: new objectId(id),
    }, {
        estado: false
    });
    return res.status(204).json(); //asi no se retorna ningun contenido, solo el status 204 de No Content
});
exports.borrarUsuario = borrarUsuario;
const subirFoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.archivo) { //si no se subió ningun archivo, o con el nombre 'archivo'
        return res.status(400).json({
            msg: 'no se subió ningun archivo'
        });
    }
    try {
        const { id } = req.params;
        const user = yield models_1.Usuario.findById(id);
        const { id: idLogueado } = req.payload;
        if (user.id.toString() != idLogueado) { //los administradores tampoco pueden modificar el usuario de alguien mas, solo pueden borrar el usuario de alguien mas o convertir a un usuario que no sea administrador en administrador, pero tanto los administradores como los no administradores solo pueden actualizar su propio usuario
            return res.status(401).json({
                ok: false,
                error: 'No puede modificar un usuario que no le pertenece'
            });
        }
        if (user.img) {
            const pathImagen = path_1.default.join(__dirname, '../uploads', user.id, user.img);
            if (fs_1.default.existsSync(pathImagen)) {
                fs_1.default.unlinkSync(pathImagen);
            }
        }
        const nombreImg = yield (0, helpers_1.subirArchivo)(req.files, undefined, user.id);
        user.img = nombreImg;
        yield user.save();
        // const usuario = await Usuario.findById(user.id);
        res.status(201).json({
            ok: true,
            // data: usuario
            data: {
                mensaje: 'Foto subida correctamente'
            }
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
    const usuario = yield models_1.Usuario.findById(id);
    const { id: idLogueado, rol } = req.payload;
    if (usuario.id.toString() != idLogueado && !rol.includes('ROLE_ADMIN')) { //solo los administradores pueden ver la foto de alguien mas
        return res.status(403).json({
            ok: false,
            error: 'No tiene acceso a este recurso'
        });
    }
    if (usuario.img) {
        const pathImage = path_1.default.join(__dirname, '../uploads', usuario.id, usuario.img);
        if (fs_1.default.existsSync(pathImage)) {
            //NOTA: Con lo siguiente es para mandar el archivo, cualquier tipo de archivo ya sea pdf, excel, imagen, etc, esto usando el res.sendFile, pero podemos dejarlo solamente asi sin ponerle headers en su respuesta para que asi ese archivo solamente se muestre, esto es por default, pero si queremos que el archivo en lugar de solo mostrarse en el navegador que se descargue entonces le debemos añadir a la respuesta el header que está abajo, y podemos aplicarle al res el metodo header como se ve abajo para añadirle ese header que es un objeto literal
            // const headers = {
            //     'Content-Disposition': "attachment; filename=\"" + usuario.img + "\""
            // };
            // return res.header(headers).sendFile(pathImage);
            //NOTA: Esta es otra forma de añadirle headers a la respuesta, aplicando el metodo appendHeader al res, y asi si le mandamos como valor un arreglo como se hace abajo entonces es como si ese appendHeader con ese key (su primer parametro) se aplicara varias veces poniendole en cada vez cada valor de ese arreglo, y asi como pusimos los headers abajo es para que ese archivo solo se muestre en el navegador pero sin descargarse, lo cual sería por default, osea que aunque no le pongamos estos headers y solo apliquemos el metodo sendFile al res de todos modos igual se va a mostrar ese archivo sin descargarse, y ya si queremos que se descargue en lugar de mostrarse en el navegador pues le aplicamos el header que está arriba
            //NOTA: Estos headers aplican para cualquier lenguaje o framework, igual se aplica para spring boot por ejemplo, es lo mismo para descargar o visualizar un archivo en el navegador, se aplican los mismos headers
            res.appendHeader('Content-Disposition', "inline; filename=\"" + usuario.img + "\"");
            res.appendHeader('Content-Type', ['image/jpg', 'image/png']);
            return res.sendFile(pathImage);
        }
    }
    const pathImage = path_1.default.join(__dirname, '../assets/no-image.jpg'); //OJO que aqui no se va a leer la carpeta assets del proyecto aqui con typescript, sino que se leerá la carpeta assets que esté dentro de la carpeta dist del proyecto ya que ahí es donde se ejecuta el codigo, aqui nosotros solo estamos usando typescript pero ya al ejecutarlo se ejecuta su parte equivalente a javascript que está dentro de la carpeta dist, asi que ahí debemos crear esa carpeta se assets junto con su archivo de no-image.jpg, ya que si no da error
    // const headers = {
    //     'content-Disposition': "attachment; filename=\"" + 'no-image.jpg' + "\""
    // };
    // res.header(headers).sendFile(pathImage);
    res.appendHeader('Content-Disposition', "inline; filename=\"" + 'no-image.jpg' + "\"");
    res.appendHeader('Content-Type', ['image/jpg', 'image/png']);
    res.sendFile(pathImage);
});
exports.mostrarFoto = mostrarFoto;
//# sourceMappingURL=usuarios.js.map