import { Request, Response } from 'express';
import { Usuario } from '../models';
import bcrypt from 'bcryptjs';
import { UsuarioObjeto, UsuarioUpdateBody, tokenUsuario } from '../interfaces/usuario';
import { generarJWT, capitalizar, esPesoValido, subirArchivo } from '../helpers';
import { Types, ObjectId } from 'mongoose';
const objectId = Types.ObjectId;
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer'; //npm i nodemailer para instalar este paquete para enviar correos con nodejs
import moment from 'moment';

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

const enviarCorreo = async (token: string, baseUrl: string, nombre: string, apellido: string, email: string) => {

    const cuerpoHtml = `
        <h3>Bienvenido ${nombre} ${apellido}</h3>
        <p>
            Para registrar su usuario por favor haga click en el siguiente enlace:
            <br>
            ${baseUrl + 'confirmacion/' + token}
        </p>
    `;

    const config = {
        host: process.env.HOST_EMAIL_SEND, //el host del correo desde el cual se va a enviar el correo, para un correo de gmail el host es: smtp.gmail.com
        port: Number(process.env.PORT_EMAIL_SEND), //el puerto del dominio del correo que va a enviar el correo, no el que va a recibir el correo sino el que va a enviarlo, osea del correo del atributo user del objeto de auth de abajo, y en el caso de un correo de gmail el puerto es 465
        auth: {
            user: process.env.EMAIL_SEND, //el correo desde el cual se va a mandar el correo
            pass: process.env.PASS_EMAIL_SEND //la contraseña pero no del correo desde el cual se va a mandar, sino la contraseña de aplicacion que creamos desde nuestro correo de la anterior linea, para eso ir aqui en nuestra cuenta de google de gmail (iniciar sesion primero): https://myaccount.google.com/security?hl=es , y ver la parte que dice "Verificacion en dos pasos", y activarla, y ya cuando esté activa buscar en el buscador de ahí de la pagina que puse anteriormente: "Contraseñas de aplicaciones", y estando en esa parte de contraseñas de aplicaciones, donde dice "Seleccionar aplicacion" poner la opcion de "Otra", darle un nombre y ponerle en generar y se nos mostrará una contraseña generada automaticamente y esa contraseña es la que pondremos aqui, esto se hace para todo tipo de aplicaciones donde queramos mandar correos, incluido spring boot, node js como en este caso, etc
        }
    };

    const transport = nodemailer.createTransport(config); //siempre se debe hacer esto para enviar correos con nodemailer, para darle su configuracion

    const mensaje = {
        from: process.env.EMAIL_SEND, //el correo desde el cual vamos a mandar, debe ser el mismo que el correo puesto en el atributo user del objeto auth de arriba
        to: email, //el email al cual queremos enviar, el que recibirá el correo que mandemos
        subject: 'Registro Books app', //el titulo del email
        html: cuerpoHtml //aqui podemos ponerle text o html como nombre de atributo, si le ponemos text pues solo podremos ponerle un string de un texto normal para que en el cuerpo del correo que enviemos solo se muestre un texto normal y ya, pero si le ponemos html como aqui entonces recibirá un string que contenga un codigo de html como se ve arriba en la constante llamada cuerpoHtml, la cual la pusimos aqui, esto para que el cuerpo del correo que enviemos tenga la estructura del html que pongamos, pudiendo ponerle imagenes al correo con la etiqueta img del html por ejemplo
    };

    const info = await transport.sendMail(mensaje); //esto es para ahora sí enviar el correo usando nodemailer con la configuracion que le dimos arriba, y esto retorna una promesa, por eso aqui pusimos el await

    return info;

};


const crearUsuarioYEnviarEmail = async (req: Request, res: Response) => {
    const { estado, password, rol, img, baseUrl, ...user } = req.body as UsuarioObjeto;

    let idU = '';
    try {

        if( !esPesoValido(user.peso) ) { //el atributo peso se validó aqui y no en los routers del usuario en el archivo usuarios.ts de la carpeta routers porque ese atributo hicimos que sea opcional ponerlo en el body, si no se pone entonces se guardará en base de datos (al crear el usuario) con el valor de 0 porque pusimos el default:0 en el atributo peso (del objeto anidado de detalle) del modelo de usuario en el archivo usuario.ts de la carpeta models, asi lo hicimos en este proyecto asi que por eso la validacion se hizo aqui 
            return res.status(400).json({
                ok: true,
                error: 'No se proporcionó un peso valido'
            });
        }

        const salt = bcrypt.genSaltSync(10);
        user.password = bcrypt.hashSync(password, salt);

        user.nombre = capitalizar(user.nombre);
        user.apellido = capitalizar(user.apellido);

        user.rol = [
            'ROLE_NUEVO'
        ];

        const usuario = new Usuario(user);

        const { id, nombre, apellido, email, password: pass, estado, rol, detalle } = await usuario.save();
        const usuarioGuardado: UsuarioObjeto = {
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
        const token = await generarJWT(id, nombre, apellido, rol); //al final se puso que la funcion generarJWT del archivo generar-jwt.ts de la carpeta helpers que reciba el id, nombre y apellido en lugar de todo el objeto



        //envio de email con el token, si el email no se envia entonces eliminar el usuario recien creado con el rol de ROLE_NUEVO
        const info = await enviarCorreo(token as string, baseUrl, nombre, apellido, email); 
        //antes de implementar el nodemailer la anterior linea no estaba, todo lo demas de esta funcion sí estaba
        console.log(info);



        // const usuarioReturn = new Usuario(usuarioGuardado); //antes de implementar el nodemailer esta linea no estaba comentada y era esta constante de usuarioReturn la que se enviaba en el atributo data de la respuesta JSON

        return res.status(200).json({
            ok: true,
            // data: usuarioReturn, //si aqui retornaramos el objeto usuarioGuardado entonces no se respetaría lo de la funcion del toJSON en el modelo de usuario del archivo usuario.ts de la carpeta models, ya que eso solo aplica cuando retornamos como JSON algun objeto instancia de ese modelo como los objetos retornados con el metodo save, find, findOne, etc de mongoose o las instancias de objetos con el new Usuario, por eso si aqui ponemos la variable usuario sí se respetará ese metodo toJSON, y tambien con esta variable de usuarioReturn sí se respetará esa funcion de toJSON porque arriba pusimos que sea instancia del modelo de usuario al igualarlo con el new Usuario, asi que aqui pudimos haber puesto la variable usuario o esta variable de usuarioReturn, con ambas se hubiera retornado lo mismo
            data: {
                mensaje: `Correo enviado a ${email}, favor de verificarlo, no olvidarse de checar la parte de correos no deseados`
            }
        });
    } catch(err) {
        // console.log('Hubo un error: ', err);
        if(objectId.isValid(idU)) { //si se guardó el usuario pero no se pudo enviar el correo que ese usuario se elimine
            await Usuario.findByIdAndDelete(idU);
        }

        res.status(500).json({
            ok: false,
            error: 'No se pudo guardar el usuario ni enviarse el email, comuniquese con el administrador'
        });
    }

};


const validarUsuarioCreado = async (req: Request, res: Response)/*: Promise<Response<any, Record<string, any>>>*/ => {

    const { id } = (req as any as tokenUsuario).payload;

    const usuarios = await Usuario.find({
        rol: {
            $in: [ 'ROLE_NUEVO' ]
        },
        _id: {
            $ne: id
        }
    }).lean(); //este metodo de lean() se explica mas abajo en este archivo
    const usuariosIds = usuarios.filter(u => {
        return moment().diff(moment(u.createdAt), 'days') >= 7; //los usuarios que no han activado su cuenta en 7 o mas dias serán eliminados, para hacer limpieza en la base de datos, esto cada vez que se cree un nuevo usuario ya validado en esta funcion
    }).map(u => u._id);

    await Promise.all([ 
        Usuario.updateOne({
            _id: id
        }, {
            $pull: {
                rol: 'ROLE_NUEVO'
            }
        }),
        Usuario.updateOne({
            _id: id
        }, {
            $addToSet: {
                rol: 'ROLE_USER'
            }
        }),
        Usuario.deleteMany({
            _id: {
                $in: [ ...usuariosIds ]
            }
        })
    ]);


    const usuario = await Usuario.findById(id);

    const token = await generarJWT(usuario.id, usuario.nombre, usuario.apellido, usuario.rol);

    res.status(201).json({
        ok: true,
        data: usuario,
        token
    });
    
};

const reenviarCorreo = async (req: Request, res: Response) => {
    const { baseUrl } = req.body;

    try {

        const tokenAntiguo = req.header('x-token'); //aqui el token proporcionado en el header debe ya estar caducado para que entonces se envie otro correo con otro token

        if(!tokenAntiguo) {
            return res.status(400).json({
                ok: false,
                error: 'No se encuentra el token en el header'
            });
        }

        const { id } = JSON.parse( atob(tokenAntiguo.split('.')[1]) ); //con esto se obtiene el payload del token, no se hizo de la forma en que está en el archivo validar-jwt.ts de la carpeta middlewares porque ahí solo se obtiene el payload si el token no ha expirado, pero en este caso aqui a esta funcion se manda el token ya expirado para generar uno nuevo y asi reenviar el correo con ese nuevo token que ya esté correcto, pero de esta forma no importa si ya está expirado o no, de todos modos se va a pasar este token

        const usuario = await Usuario.findOne({
            _id: id,
            rol: {
                $in: [ 'ROLE_NUEVO' ]
            }
        });

        if(usuario) {

            const { id, nombre, apellido, rol, email } = usuario;

            const token = await generarJWT(id, nombre, apellido, rol);

            const info = await enviarCorreo(token as string, baseUrl, nombre, apellido, email);
            console.log(info);

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

    } catch(err) {
        res.status(400).json({
            ok: false,
            error: 'No se pudo reenviar el correo. Intente registrarlo de nuevo'
        });
    }
};

const obtenerUsuarios = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
    const { role = 'user', buscar, edad: age, 
        ordenar: order = 'nombre', asc = 1, desde = 0, limite = 10 
    } = req.query; //aqui obtenemos los query params para buscar por rol con el parametro de role, buscar por nombre, apellido o email con el parametro buscar, buscar por edad con el parametro edad (que la edad sea igual o mayor a la que se ponga en ese parametro), ordenar por alguno de los atributos incluyendo el nombre, apellido, edad, email y peso con el parametro ordenar, decir si se ordenará ascendentemente (con un valor mayor a 0 o que no sea numero como letras) o descendentemente (con un valor igual o menor a 0) con el parametro asc, que se pagine con los parametros desde y limite para decir desde qué documento se empiece a hacer el filtro y todo con el parametro desde, y cuántos elementos mostrar (minimo debe ser 1 documento o ninguno en caso que no se encuentre ninguno por los filtros) con el parametro limite, asi funciona, y todos estos parametros son opcionales porque son query params, si no se pone ninguno entonces se mostrarán todos los documentos con limite de 10 documentos, osea los primeros 10 documentos se mostrarán por default asi como se puso aqui, y abajo se hacen unas pequeñas validaciones con estos parametros para que no dé error
    const ordenar = order.length == 0 ? 'nombre' : order; 
    const direccion = Number.isNaN(Number(asc)) || asc == '' ? 1 : (asc as number) > 0 ? 1 : -1;
    const termino = (buscar) ? new RegExp((buscar as string), 'i') : new RegExp(''); //si se encuentra el parametro buscar en los query params que se haga esto del RegExp visto en el curso de node js para buscar como un like de esta forma: %buscar% , y si no se encuentra el parametro buscar entonces igual se pondrá un regExp pero con un string vacio que significa que con todos va a coincidir, osea es como si no se estuviera filtrando nada y mostrara todos asi con un regExp con un string vacio, y si con el RegExp en lugar de hacer un like asi: %buscar% fuera buscar% entonces en el primer parametro del RegExp se pondría: '^' + buscar , y si fuera %buscar entonces se pondría buscar + '$' , ya que en javascript para expresiones regulares se pone un signo de peso ($) al final de la expresion regular para decir que termine con eso, osea un like asi: %buscar , y al principio se pone un signo ^ para decir que empiece con eso, osea un like asi: buscar% , y no se pone ninguno de los 2 signos cuando queremos un like asi: %buscar% , y pues en este caso asi le estamos haciendo, y opcionalmente se pone 'i' como segundo parametro del RegExp para decir que sea case-insensitive, osea que no reconozca mayusculas ni minusculas, esto tambien se vio en el curso de node js
    const skip = Number.isNaN(Number(desde)) || desde == '' ? 0 : (desde as number) >= 0 ? Number(desde) : 0;
    const limit = Number.isNaN(Number(limite)) || limite == '' ? 10 : (limite as number) > 0 ? Number(limite) : 10;

    const filtroBusqueda = [ //se puede hacer variables de javascript que contengan expresiones de mongodb, y ya esa variable ponerla en la seccion de la consulta de mongodb donde iría esa parte, y esto se hizo porque abajo tenemos mas de 1 consulta con mongodb que ocupa esta misma parte, asi que para no tener que estar repitiendo esto mismo en esas consultas pues mejor se crea una variable de javascript que contenga esa parte repetida y ya ponerla en cada consulta donde originalmente iría esta parte, asi nos ahorramos codigo
        {
            $and: [ //lo de este $and va dentro de un $or abajo, y junto con ese $or sirve para que en base al valor de la variable role recibida como query param arriba se haga una condicion u otra de filtrar por los usuarios que tengan el rol de ROLE_ADMIN o no, y dentro de este $or con el $and de aqui se hace tambien el filtro de buscar por nombre, apellido o correo segun el valor de la variable termino que se creó en base al query param de buscar arriba
                { $expr: { $ne: [ role, 'admin' ] } }, //aqui se usó el $expr de mongodb porque el $ne por default debe ir dentro de un atributo como se vio en el curso de mongodb, pero en este caso no queremos hacerlo de esa manera sino que queremos obtener simplemente el resultado de ese $ne y en el $ne (not equals) tomar en cuenta ya sea atributos que existen en el modelo de usuario o cosas que no existan ahi como es este caso con la variable rol con la que estamos comparando aqui que esa variable no sea igual al valor de 'admin', asi que para cosas que no necesariamente sean en base a un atributo que exista en el modelo de usuario como este caso o que el $ne (o otras cosas como el $gt, $lt, $eq, y asi) no queramos que esté dentro de un atributo del modelo sino que queramos simplemente obtener el valor de ese $ne en este caso, entonces para esas situaciones se ocupa el $expr, para decir que es una expresion que retornará algo
                { 
                    $nor: [
                        {
                            rol: {
                                $in: [ 'ROLE_ADMIN', 'ROLE_NUEVO' ]
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
                { $expr: { $eq: [ role, 'admin' ] } },
                {  
                    rol: {
                        $in: [ 'ROLE_ADMIN' ]
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
        $subtract: [ //el $subtract es para restar, el $add es para sumar, el $multiply para multiplicar y el $divide para dividir, y todos esos se escriben igual que el $subtract como se ve aqui de que se le pone un array y en este caso con el $subtract al primer elemento de ese array se le va a restar el segundo elemento de ese array, y el $subtract retornará el resultado de esa resta, asi igual para las demas operaciones que mencioné 
            {
                $subtract: [ { $year: '$$NOW' }, { $year: '$detalle.fechaNacimiento' } ] //el $$NOW es el equivalente al now() de mysql, osea retorna la fecha actual con todo y su hora y minutos y segundos, y con el $year obtenemos el puro año de esa fecha, y si quisieramos el puro mes (el numero del mes) pondríamos $month, y si quisieramos el dia (el numero del dia del mes) pondríamos $day, pero en este caso nos interesa solo el año de la fecha actual y el año de la fecha de nacimiento, por eso aqui usamos el $year
            },
            {
                $cond: { //el $cond se usa para poner condiciones, de modo que la condicion va en el if que va dentro del $cond como se ve abajo, y asi dentro del if al $lt no es necesario ponerle el $expr que se vio arriba, podemos ponerlo o no, pero si el $lt no estuviera dentro del if del $cond o dentro del $cond pues entonces sí hubiera sido necesario ponerle el $expr como se vio arriba con el $ne, pero dentro del $cond ya no es necesario, y entonces si esa condicion del if se cumple entonces este $cond retornará lo que pongamos en el then del $cond, y si no se cumple retornará lo del else del $cond, y en este caso al then y al else no se le puso las llaves ({}) porque eso se pone cuando queremos que sea algo condicional o con calculos, que no sea un valor estatico como el 1 o 0 que le pusimos ahi como se ve abajo, pero como le pusimos algo estatico como el 1 y el 0 pues no se le pusieron las llaves ({}), pero para cosas ya dinamicas pues se ponen las llaves ({}), osea sería then: {} y else: {} . 
                    if: {
                        $lt: [ //asi al igual que el $ne visto arriba se le puede poner al $lt y $gt y $lte y $gte (vistos en el curso de mongodb) un array en el cual con el $lt se compara si el primer elemento de ese array es menor al segundo elemento de ese array
                            { $dayOfYear: '$detalle.fechaNacimiento' }, //el $dayOfYear toma una fecha y retorna el numero de dias del año correspondiente a esa fecha, y ese numero de dias va del 1 al 365, osea si por ejemplo la fecha es del 2 de febrero entonces el $dayOfYear retornará 33 porque es el numero de dias que han transcurrido desde que inició el año
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
    /*.lean()*/; //con el metodo lean() que ponemos al final del metodo find, findOne, findById, etc obtenemos un objeto puro de javascript, ya que hemos visto arriba que cuando tenemos una instancia de un modelo (la cual se retorna al ejecutar los metodos de mongoose de find, findOne, etc o al poner new Usuario(objeto)) esa instancia no es un objeto puro de javascript ya que internamente tiene, ademas de los atributos que nos interesan del modelo, atributos especiales retornados por mongoose, pero si nosotros queremos convertirlo a un objeto literal de javascript (si se retorna un solo objeto) o un array de objetos (si se retorna varios objetos) sin tener los atributos especiales de mongoose entonces para eso se pone el metodo lean() del find, findOne, findById, etc, aunque como asi tendríamos un objeto puro de javascript entonces al retornarlo como json ya no se ejecutaría la funcion del toJSON del modelo que pusimos en el archivo usuario.ts de la carpeta models, porque eso se ejecutaría para modelos del usuario, pero pues como le aplicamos el metodo lean() eso ya no sería una instancia del modelo sino que simplemente sería un objeto comun de javascript, asi que por eso ya no se ejecutaría esa funcion de toJSON
    
    //const usuarios3 = new Usuario();
    //usuarios3.toJSON(); //asi con el metodo toJSON() o tambien con el metodo toObject() se convierte a objeto normal de javascript una instancia del modelo de Usuario pero ahora creada con el new Usuario como se ve arriba, ya que cuando lo creamos de esta manera no está el metodo lean() visto mas arriba, pero sí tenemos el toJSON() o el toObject() para eso

    //aqui abajo tenemos una consulta con el aggregate, esto del aggregate está disponible en mongoose y en mongodb, y sirve para hacer consultas de select, osea no para modificar sino solo para obtener como el find (al igual que el find retorna un array), pero a diferencia del find con el aggregate se puede hacer la consulta mas personalizada, ya que con el aggregate se puede agregar atributos al resultado aun cuando esos atributos no estén en el modelo, en este caso en el modelo de usuario del archivo usuario.ts de la carpeta models, tambien se puede cambiar la forma en como se muestra un atributo de un array, se puede hacer group by como los de mysql, se puede modificar el valor de los atributos en el resultado, se puede hacer left join o inner join como en mysql, etc, esas cosas el find no las puede hacer porque el find solo tiene la parte del filtro de los documentos y se le puede poner un segundo parametro para hacer proyecciones como se vio en el curso de mongodb, pero esas 2 cosas del filtro y las proyecciones el aggregate ya las tiene, abajo se ve esto, y ademas el aggregate tambien tiene lo demas que se dijo, asi que con el aggregate podemos hacer consultas mas personalizadas, aunque con mongoose con el aggregate no se obtiene una instancia del modelo de usuario en este caso, intenté convertirlo a instancia pero no hubo forma y abajo comenté un map del array obtenido de los usuarios convirtiendo cada objeto de ese array en new Usuario para intentar convertirlo a instancia, pero salen cosas raras asi y por eso lo dejé comentado mas abajo al terminar el siguiente aggregate, asi que mejor con el aggregate no se obtiene una instancia de ese modelo, sino solo objetos como tal de javascript como sería aplicando el metodo lean() al find como se vio arriba, por lo tanto al retornar como json un objeto o array obtenido del aggregate no se ejecutará la funcion toJSON del modelo que pusimos en el archivo usuario.ts de la carpeta models, pero en el aggregate de abajo hicimos lo mismo que hicimos en esa funcion toJSON, solo que ahi pues se hizo usando javascript y aqui con el aggregate se hizo usando puro mongodb, y entonces el find que se comentó arriba resultaría en lo mismo que este aggregate de abajo ya teniendo en cuenta lo que se puso en la funcion toJSON del modelo, la cual sí se ejecutaría para lo retornado con el find de arriba, pero ya con eso tanto el find de arriba como el aggregate de abajo resultarían en l misma respuesta JSON, checar lo que se explica en este aggregate
    //OJO que el ordenar del anterior find y el del siguiente aggregate tendrán unas pequeñas diferencias ya que el find de arriba como es un find no se le puede agregar atributos y por lo tanto no podemos ordenar por edad ya que el atributo edad no existe en el modelo de usuario, se puede agregar ese atributo de edad en la funcion toJSON del modelo si usamos el find de arriba, pero en ese punto de esa funcion del toJSON no se puede saber qué atributo queremos ordenar, asi que con el find de arriba no se podrá ordenar por edad, pero con el aggregate de abajo sí se puede
    const usuarios = await Usuario.aggregate([ //un aggregate consiste en un pipelineStage[], osea un arreglo de pipelineStage, a los objetos del array que se le pone como parametro al aggregate (ya que aqui vemos que le pusimos corchetes ([])) se les llama pipelineStage, y a todo el array del aggregate pues puede ser pipelineStage[] como se dijo o solo pipeline, y cada etapa del pipeline (pipelineStage), osea cada objeto del array del aggregate, representa algo que hará ese aggregate, y por cada objeto solo puede haber una cosa especifica, no podemos poner un $skip y un $limit (estos se explican abajo) dentro de un mismo objeto por ejemplo, todas las operaciones que hagamos deben estar separados en diferentes objetos dentro del aggregate, por eso vemos abajo que el $skip y el $limit por ejemplo los pusimos en objetos diferentes, y el aggregate se irá leyendo de arriba hacia abajo al igual que el find por ejemplo, de modo que si primero agregamos un atributo y despues en otro objeto mas abajo queremos hacer un filtro por ese atributo creado pues sí se podrá porque en ese punto del filtro ese atributo ya estará creado, pero si primero queremos hacer el filtro antes de crear ese atributo entonces eso dará error
    //NOTA: abajo vemos se comentó el $addFields porque eso se puso en la funcion del UsuarioSchema.pre('aggregate', function() {}) que está en el modelo del usuario en el archivo usuario.ts de la carpeta models, ya que hemos visto (en el curso de react en la parte del backend del proyecto del calendar se ve esto) que con el pre se ejecuta un middleware, osea una funcion que se hace antes de algo, y con el pre es una funcion que se hace antes o durante la ejecucion de algun metodo como el find (con el UsuarioSchema.pre('find'....)), findOne o aggregate en este caso, pero como ahí estamos poniendo ese pre con el UsuarioSchema entonces esa funcion se ejecutaría cada vez que usemos el modelo del Usuario, no de otro modelo, osea si ponemos UsuarioSchema.pre('aggregate'...) esa funcion se ejecutaría cada vez que pongamos Usuario.aggregate([]), o si ponemos UsuarioSchema.pre('find'...) entonces esa funcion se ejecutaría cada vez que ponemos Usuario.find({}) , pero solo de es esquema y del metodo que especifiquemos en el primer parametro del pre pues, asi que en ese archivo del modelo del usuario pusimos el pre para el aggregate, por lo tanto se va a ejecutar esa funcion antes de que el aggregate retorne algo, por eso se llama pre, y ahi vemos que pusimos this.pipeline(), eso obtiene el array puesto dentro del aggregate, ya que ese array es el pipeline o pipelineStage[] del aggregate como se explicó arriba, y vemos que entonces a ese array obtenido con el this.pipeline() le agregamos al inicio de ese array el mismo objeto con el $addFields, y asi es como si ese objeto con el $addFields que se comentó abajo no se hubiera comentado, es como si lo tuviera ahi porque ahi en esa funcion del pre se le agrega antes de que este aggregate retorne algo, mientras se está ejecutando, y tambien existe el post en lugar del pre que se ejecuta ya que se ha retornado algo, osea el UsuarioSchema.post('aggregate'....) se ejecutaría ya que el aggregate haya retornado algo, aunque pues es mas usado el pre. Y asi entonces se ejecutaría esa funcion que está en el modelo del usuario cada vez que pongamos Usuario.aggregate en cualquier archivo del proyecto
        // {
        //     $addFields: { //el $addFields sirve para agregar un atributo dentro de este aggregate, que en este caso es el atributo llamado edad que tendrá el mismo resultado que se retorna en el objeto de la variable edadCalculo vista arriba, y digo que se añadirá ese atributo dentro  de este aggregate porque despues de esto se podrán hacer cosas con este atributo de edad como hacer filtros por este atributo o mas cosas incluso aunque este atributo de edad no exista en el modelo de usuario, esto es algo que el find, fingOne y findById de mongoose no puede hacer como se explicó arriba, y tambien este atributo de edad puede estar en los objetos del array retornado por el aggregate si en el $project de mas abajo dentro de este aggregate se le pone edad: true para que este atributo creado aqui se ponga en cada objeto del array que vaya a retornar este aggregate
        //        //el $addFields es exclusivamente para agregar un atributo que no exista en el modelo de usuario, mientras que el $set que se ve mas abajo es para tanto agregar un atributo que no exista como para modificar un atributo que sí exista en el modelo de usuario como se vio en el curso de mongodb 
        //        edad: edadCalculo //al $addFields se le puede poner mas atributos para crear, no solo uno
        //     }
        // },
        {
            $match: { //el $match se puede usar en los aggregate y sirve para hacer el filtro que tendrá esta consulta como si fuera el where de mysql, osea lo del mismo filtro que se le pone como primer parametro en el find o findOne o findById, por eso vemos que en este $match pusimos lo mismo que el filtro del find de arriba 
                //tambien podemos repetir el mismo operador en otros objetos dentro del aggregate, osea tambien en otro objeto de este aggregate pudimos haber puesto otro $match por ejemplo, y asi ese otro $match actuará como un and de este $match, osea que se deben cumplir ambos filtros con el $match
                estado: true,       
                $or: filtroBusqueda,
                $expr: {
                    $gte: [ '$edad', Number(age) ] //NOTA: vemos que aqui usamos el atributo edad añadido arriba en este aggregate (o en la funcion pre del aggregate en el modelo del usuario del archivo usuario.ts de la carpeta models como se explicó arriba), y esto se puede hacer en el aggregate, y OJO que aqui le pusimos $edad y no solo edad, y es que cuando queremos referirnos al valor de ese atributo pero no usar ese atributo como modificar ese atributo o algo asi, sino solo lectura del valor de ese atributo entonces se pone el nombre de ese atributo con el signo de peso ($) al principio como se ve aqui, pero cuando ya queremos modificar ese atributo, osea que no es solo modo lectura pues se pone sin el signo de peso ($), por eso aqui se pone $edad porque solo queremos su valor, en modo lectura pues
                }
            }
        },
        {
            $set: { //aqui se ponen atributos del modelo para modificarlos, y si ese atributo que pongamos dentro del $set no existe en el modelo de usuario entonces se creará en los objetos del array retornado del aggregate, aunque para crear atributos podemos usar el $addFields de arriba, pero ese solo es para crear nuevos atributos mientras que el $set es para modificar el valor de atributos existentes y crear nuevos tambien, esto tambien aplica para el $set que se usa para actualizar como se vio en el curso de mongodb
                nombre: {
                    $concat: [ '$nombre', ' ', '$apellido' ] //asi se hace una concatenacion de strings con el $concat, y retorna el string ya concatenado
                },
                'detalle.peso': {
                    $cond: { //el $cond se explicó arriba
                        if: {
                            $eq: [ '$detalle.peso', 0 ]
                        },
                        then: null, //el valor del atributo peso del objeto interno llamado detalle (detalle.peso) tendrá el valor de null si su peso en la base de datos es 0
                        else: {
                            $concat: [ { $toString: '$detalle.peso' }, ' ', 'kg' ] //para usar el $concat todos los elementos de su array para concatenar deben ser de tipo string, y en este caso el atributo peso del objeto interno de detalle (por eso se puso '$detalle.peso') es de tipo numerico, por eso necesitamos convertirlo a string y es lo que se hizo aqui con el $toString, y usando el $toString se puso llaves ({}) como vemos aqui porque pues no es un valor statico como los strings que se pusieron en el segundo elemento y tercer elemento de este array, sino que es un valor calculado pues, un valor dinamico usando el $toString de mongodb para cambiar dinamicamente el valor de algo, en este caso para que se convierta a string, y cuando es asi debemos usar las llaves ({}) como se ve aqui, y asi el $toString retornará el valor del $detalle.peso en string 
                        }
                    }
                },
                'detalle.fechaNacimiento': {
                    $dateToString: { //el $dateToString convierte a string una fecha y permite ponerle el formato que queramos gracias a su atributo interno de format como se ve abajo, y con su atributo interno de date le indicamos cuál es la fecha a convertir a string con ese formato dado, que en este caso le estamos poniendo que sea de un formato dd/mm/yyyy pero con mongodb, que en realidad se maneja los mismos tipos de formatos de fechas que en mysql, ya que en su base de datos por default guarda las fechas como yyyy-mm-dd al igual que mysql, y para darle otro formato a la fecha igual se ocupan porcentajes como se ve abajo, igual que en mysql
                        format: '%d/%m/%Y',
                        date: '$detalle.fechaNacimiento'
                    }
                },
                rol: {
                    //el $filter es lo mismo que un filter de javascript, sirve par recibir un array y retornar un array filtrado, y en este caso se está retornando un array basado en el atributo rol del usuario (que tambien es un array) que solo tenga los elementos con el valor de 'ROLE_ADMIN' o 'ROLE_USER', solo esos elementos para asegurarnos que solo retornen esos roles que son los que interesan en este proyecto por si se le movió a la base de datos y al atributo rol de un usuario se le puso otros elementos en su array que no sean esos por ejemplo
                    $filter: { //tambien está el $map que se escribe igual pero en lugar del atributo cond que se ve abajo se pone in, y ese in será un objeto (con {}) modificando el valor del elemento, por ejemplo dentro del objeto del in poner: $add: [ '$$peso', 2 ], para que si nuestros elementos dentro del map son numeros ($$peso) que a cada uno de esos elementos se le sume 2, asi entonces $add es para sumar y $subtract para restar, y ambos tanto el $filter como el $map retornan un array y en su atributo input recibe un array
                        input: '$rol',
                        as: 'rolElement', //este nombre tendrá cada elemento del array del atributo rol del modelo del usuario, de modo que en el cond dentro de este $filter cada elemento se filtre en base a una condicion, y dentro del cond del $filter se pone como $$rolElement, osea se le pone doble signo de peso ($$) al principio como se ve abajo
                        cond: {
                            $or: [
                                { $eq: [ '$$rolElement', 'ROLE_USER' ] },
                                { $eq: [ '$$rolElement', 'ROLE_ADMIN' ] }
                            ]
                        }
                    },
                }
            }
        },
        {
            $addFields: { //aqui se agrega otro atributo llamado peso que tendrá el mismo valor que detalle.peso, esto se hizo para que se pueda ordenar por el peso del usuario con el $sort de abajo ya que sí se puede ordenar por un atributo que esté dentro de un objeto interno como el detalle, pero es que tambien vamos a ordenar por atributos normales que no estén en objetos internos como el nombre, apellido, edad (que se creó arriba), e email, y entonces para resolver esto simplemente se creó aqui otro atributo normal que no esté dentro de un objeto interno que tenga ese mismo valor del peso y ya asi en el $sort de abajo si le ponemos de llave peso se ordenará por ese peso tambien
                peso: '$detalle.peso'
            }
        },
        {
            $sort: { //el $sort del aggregate es para ordenar los objetos del array resultante del aggregate segun un atributo, y se le pone el valor de 1 a ese atributo con el $sort si se va a ordenar ascendentemente, y -1 si se va a ordenar descendentemente, tal y como hacemos con el metodo sort del find visto en el curso de mongodb
                [ordenar as string]: direccion //aqui se puso una llave que pueda tener un valor dinamico poniendole corchetes ([]) como se puede hacer en los objetos literales de javascript, igual eso se puede hacer en mongodb, ya que el atributo sobre el que se va a ordenar cambia segun lo que se ponga en el query param de ordenar
            }
        },
        {
            $project: { //esto es para hacer proyecciones con el aggregate, como las proyecciones que se pueden hacer poniendo un objeto como segundo parametro del find, findOne o findById, solo que las proyecciones del aggregate tienen una diferencia con las proyecciones que se ponen en el find, findOne o findById que se explica abajo
                _id: false,
                id: '$_id', //en el $project del aggregate, al contrario de las proyecciones usando el find, findOne o findById, podemos ponerle nuevos atributos como este, y tambien podemos modificar el valor de un atributo que ya existía como se hace con el rol abajo, eso no se puede hacer con las proyecciones del find, findOne y findById como se vio en el curso de mongodb
                nombre: true,
                // apellido: false, //esto no se puede hacer en el $project, ya que los campos que no pongamos en true automaticamente no se mostrarán, pero no podemos ponerle false (si no da error) excepto al _id, ese campo es el unico al que podemos ponerle false ya que ese por default lo trae aunque no lo especifiquemos aqui en el $project, asi que para que no se muestre tenemos que hacerlo manualmente de ponerle false, pero solo para ese atributo 
                email: true,
                rol: {
                    $cond: {
                        if: {
                            $and: [
                                { $isArray: '$rol' }, //esto retorna true o false dependiendo si un atributo es un array o no, con el $isArray
                                { $eq: [ { $size: '$rol' }, 1 ] } //con el $size se retorna la longitud de un array, osea la cantidad de elementos de un array, y aqui con el $eq estamos diciendo que retorne true si la longitud del array del atributo rol es 1, osea si solo tiene 1 elemento ese array del rol
                            ]
                        },
                        then: {
                            $arrayElemAt: [ '$rol', 0 ] //con el aggregate no podemos poner $rol.0 o rol.0 para obtener el primer elemento de un array, asi que para obtener elementos de un array basado en sus indices ponemos el $arrayElemAt, poniendole un array en el que el primer parametro será el array y el segundo parametro será el indice donde está el elemento del array que queremos retornar, en este caso se le puso 0 ahi para retornar el primer elemento del array
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


    const total = await Usuario.countDocuments({ //sin contar lo del skip y limit del aggregate de arriba, se cuenta asi todos los documentos en total que hay segun el filtro que ponemos aqui que tome en cuenta nuestra busqueda por nombre, apellido, email y edad y rol de acuerdo a lo que pongamos en los query params, y si no se ponen query params pues traerá todos los documentos con el rol de user (ROLE_USER) solamente sin tomar en cuenta los que tengan el ROLE_ADMIN (igual si se le pone el valor de 'user' o cualquier otro string que no sea 'admin' en el query param de role), y si se le pone el role de 'admin' en los query params entonces se traerá todos los documentos de los usuarios con el rol de ROLE_ADMIN, esto sin contar lo del skip ni el limit (que es la paginacion) para contrar cuantos elementos son en total incluyendo las busquedas que hagamos pues, esto debido al countDocuments que retorna un numero con la cantidad de documentos encontrados
        estado: true,
        $or: filtroBusqueda,
        $expr: { 
            $gte: [ 
                edadCalculo,
                Number(age)
            ]
        }
    });

    
    const docs = await Usuario.aggregate([
        //el siguiente $addFields se comentó por lo que se explicó mas arriba
        // {
        //     $addFields: {
        //         edad: edadCalculo
        //     }
        // },
        {
            $match: {
                _id: {
                    $in: [ ...usuarios.map(u => u.id) ] //asi filtramos por los mismos usuarios que se obtuvo con el aggregate de arriba
                }
            }
        },
        {
            $group: { //asi se hace el group by con mongodb, tambien usando el aggregate, en los $group siempre debemos poner el atributo _id, esto para que algo sea unico en los documentos que retornará este aggregate, si no ponemos el atributo _id en el $group dará error, y a ese atributo de _id vemos abajo que le pusimos $edad en base a la edad que se creó arriba (o en la funcion del pre('aggregate') que se puso en el modelo del usuario como se explicó mas arriba), por lo tanto aqui con eso estamos diciendo que se agrupe por las edades de los usuarios que cumplan con el filtro puesto arriba (ese filtro puesto arriba con el $match en este aggregate en el que se usa el $group es como si fuera el having de mysql, y pues este $group es como si fuera el group by de mysql), por lo tanto en los documentos retornados en este aggregate no se podrá repetir la misma edad en los documentos ya que pues se está agrupando por las edades, y con el atributo conteo de abajo pusimos que se sumara de a 1, no con el $add visto arriba que es para sumar 2 numeros, sino con el $sum para que se sume 1 como si fuera un contador cada vez que se encuentre una edad en los documentos del usuario, y si esa edad está repetida en mas de 1 documentos entonces pues a ese conteo se le sumará 1 por cada vez que exista esa edad, osea que si por ejemplo tenemos tenemos 2 usuarios con la edad de 30 entonces en el array retornado de este aggregate no habrá 2 objetos con la edad de 30, sino que habrá un solo documento con la edad de 30 (porque se está agrupando por la edad) y en ese documento con la edad de 30 el atributo conteo será 2, y con el atributo pesoPromedio se calcula el promedio (con el $avg (y para el maximo sería $max de la misma forma, para el minimo sería $min, y asi)) del peso que tienen los documentos con esa edad, igual que como sería en mysql cuando usamos el group by, y asi entonces este aggregate retornará un array de objetos en el que cada objeto tendrá el atributo _id, conteo y pesoPromedio, aunque esto se puede modificar con el $project que usamos abajo para las proyecciones, en el cual le eliminamos ese atributo de _id y lo renombramos como edad, y que pues tambien incluya los atributos de conteo y pesoPromedio, y asi entonces este group by retornaría como una estadistica de cuántas veces se repite las edades y cuál es el peso promedio de esas edades de los usuarios retornados en el primer aggregate de mas arriba
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
            $sort: { //lo ordenamos por el atributo del pesoPromedio ascendentemente, si fuera descendente sería -1 en lugar de 1
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
};

const obtenerUsuario = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
    const { id } = req.params;
    const { id:idLogueado, rol } = (req as any as tokenUsuario).payload;
    if(!rol.includes('ROLE_ADMIN')) { 
        if(id != idLogueado.toString()) { //si el usuario que accede a este endpoint no tiene el rol de administrador y si el id del usuario al que quiere consultar no es el mismo que el usuario que esté logueado entonces se retorna un error, ya que un usuario que no es administrador solo puede consultarse a sí mismo porque no puede saber la informacion de otro usuario mas que de él, pero un administrador sí puede saber tanto la información de él mismo como de los demas sean no administradores como administradores, asi que por eso pusimos esta condicion
            return res.status(403).json({
                ok: false,
                error: 'No puedes ver este recurso'
            });
        }
    }

    // const usuario = await Usuario.findById(id); //asi podríamos obtener el usuario por su id, pero OJO que con esto no podríamos obtener los libros de este usuario, y no podríamos usar el populate porque el populate solo funciona cuando tenemos el atributo de union entre colecciones en el modelo de usuario en este caso, pero vemos que en el models de usuario en el archivo usuario.ts de la carpeta models no hay ningun atributo que una a sus libros, asi que no podemos obtener los libros del usuario usando el populate aqui, asi que una solucion a esto podría ser usar la funcion toJSON del modelo de usuario y ahi agregarle un atributo de libros por ejemplo y usar ahi el modelo de los libros para encontrar los libros de ese usuario por su id, tambien otra solucion podría ser hacer aqui manualmente de agregarle a ese usuario sus libros transformando lo que retorne esta linea a objeto normal de javascript como usar el metodo lean() por ejemplo que se ve arriba, y otra solucion que es la que se usó abajo es hacer un left join con el $lookup de mongodb usando el aggregate que se vio mas arriba, abajo se explica esto y asi podremos acceder al modelo de libros uniendo los usuarios con sus libros por medio del id del usuario con el atributo usuario del modelo de libro del archivo libro.ts de la carpeta models, ya que ese atributo de usuario del modelo de libro tiene el id del usuario al que le corresponde, entonces asi podemos hacer el left join con el $lookup (el $lookup siempre hará un left join y retornará siempre un array y los usuarios que no tengan libros relacionados pues aparecerán con el atributo de union que genera el $lookup como un array vacio (solo ese atributo de union) y si queremos hacer un inner join pues podemos hacer un filtro con el $match del aggregate para excluir a los usuarios que en su atributo de union generado por el $lookup que tengan un array vacio y asi ya tendríamos el inner join), checar abajo la explicacion del $lookup del aggregate
    const usuario = await Usuario.aggregate([
        {
            $match: {
                _id: new objectId(id)
            }
        },
        {
            $set:  { //esto del $set es lo mismo visto mas arriba con el aggregate, tiene lo mismo
                nombre: {
                    $concat: [ '$nombre', ' ', '$apellido' ]
                },
                'detalle.peso': {
                    $cond: { 
                        if: {
                            $eq: [ '$detalle.peso', 0 ]
                        },
                        then: null,
                        else: {
                            $concat: [ { $toString: '$detalle.peso' }, ' ', 'kg' ]
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
                                { $eq: [ '$$rolElement', 'ROLE_USER' ] },
                                { $eq: [ '$$rolElement', 'ROLE_ADMIN' ] }
                            ]
                        }
                    },
                }
            }
        },
        {
            $lookup: { //El $lookup como se dijo arriba sirve para hacer left join en mongodb, y le ponemos los atributos, como se ve abajo, de from que es la coleccion a la que queremos hacer el left join y se debe escribir tal cual como se llame la coleccion en nuestra base de datos que en este caso es 'libros', en el atributo de localField ponemos el atributo de la coleccion con la que ejecutamos este aggregate (en el cual está este $lookup) con el que se quiere hacer la union, en este caso pusimos ahí en el localField '_id', lo cual hace referencia al valor del atributo _id de la coleccion de usuarios porque fue desde el modelo de Usuario en el que ejecutamos este aggregate, en el atributo foreignField se pone el atributo de la coleccion que pusimos en el atributo from al cual queremos hacer la union en base al atributo del localField que pusimos, en este caso vemos que en el foreignField pusimos 'usuario', haciendo entonces con eso la union entre el atributo _id (puesto en el localField) de la coleccion de usuarios (la que ejecutó este aggregate) y el atributo usuario (puesto en el foreignField) de la coleccion libros (puesto en el from), y asi entonces se tendría la union de los usuarios con sus libros, o en este caso de un solo usuario porque arriba en este aggregate pusimos el filtro que solo sea por un solo id de usuario, y esos libros del usuario (o usuarios si no hubieramos puesto el $match de arriba) se mostrarán en un array y siempre será un array el que retorna el $lookup, y ese array de los libros lo tendrá el atributo que pusimos en el atributo as del $lookup que está abajo, vemos que ahí pusimos 'libros', por lo tanto en el usuario retornado por este aggregate se tendrá un atributo llamado libros (si no existía ese atributo en el usuario pues se crea, y si sí existía entonces su valor se reemplaza por el array que retorne este $lookup) que tendrá el array que retorne este $lookup, y ese atributo de 'libros' puesto en el as del $lookup se debe poner como true en el $project de este aggregate para que sí se muestre, y entonces asi en ese array del atributo libros se tendrá todos los objetos de libro que tiene el usuario, con todos sus atributos por default, pero si queremos hacer alguna operacion en los objetos de libro como un filtro con el $match para filtrar qué libros se mostrarán del usuario o el $project para decir qué atributos de los libros mostrarse solamente, o agregarle un nuevo atributo a los objetos de los libros co el $addFields o $set, entonces pondríamos el atributo pipeline del $lookup como lo hicimos abajo, vemos que ese pipeline es un array en el cual le ponemos objetos para hacer operaciones con el $match, $project, etc como se hace con el aggregate, de hecho ese pipeline marca un aggregate anidado, y ese aggregate anidado será ahora de la coleccion de libros ya que esa coleccion le pusimos en el from del $lookup, asi que el aggregate dentro del pipeline del $lookup ya no va a ser de los usuarios sino de los libros, y vemos que ahí pusimos un $project que es para que se muestren solamente algunos atributos de los libros, y tambien vemos que hay ahí un nuevo $lookup, lo que significa que ahora se va a hacer otro left join partiendo ahora de la coleccion de libros por estar dentro del pipeline mencionado, y vemos en ese segundo $lookup que ahora unimos el atributo autores de los libros (el cual contiene un array de id de los autores de ese libro) con el atributo _id de la coleccion de autors, y entonces vemos que con el $lookup tambien podemos unir si en el localField del $lookup tenemos un array, y asi se va a buscar que coincidan los valores de ese array con el valor del atributo del foreignField del $lookup, y el array resultante de ese segundo $lookup lo vamos a mostrar en el atributo autores de los objetos del libro debido a que en el as de ese segundo $lookup pusimos 'autores', y ese atribugo ya existía ya que era el array pero solo con los id de los autores del libro, pero con ese segundo $lookup en ese atributo autores de los libros tendremos mas informacion de los autores ademas de su id, osea como que en ese atributo de autores hicimos un populate pero usando el $lookup del aggregate de mongodb, y vemos que en ese segundo $lookup tambien le pusimos el pipeline, en el cual vemos que ahi modificamos el valor del atributo nombre con el $set y tambien ponemos el $project para decir qué atributos ahora de los objetos de los autores del libro mostrar, y asi entonces tenemos 2 left joins partiendo desde la coleccion de usuarios y llegando hasta la coleccion de autores pasando por la coleccion de libros, asi como en mysql que podemos usar varios left join o inner join uniendo varias tablas, asi se haría eso con mongodb, y si queremos hacer un inner join en mongodb no existe como tal pero el $lookup como es left join entonces si no encuentra alguna union se va a retornar un array vacio, y ahí en el pipeline podemos poner un $match para excluir los arrays vacios usando el atributo del as del $lookup y asi ya tendríamos solo lo que coincida en esa union, osea un inner join
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
                                            $concat: [ '$nombre', ' ', '$apellido' ]
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
                                { $eq: [ { $size: '$rol' }, 1 ] } 
                            ]
                        },
                        then: {
                            $arrayElemAt: [ '$rol', 0 ] 
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
};


const actualizarUsuario = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
    const { id } = req.params;
    const usuario = await Usuario.findById(id);

    const { id: idLogueado } = (req as any as tokenUsuario).payload;
    if(usuario.id.toString() != idLogueado) { //los administradores tampoco pueden modificar el usuario de alguien mas, solo pueden borrar el usuario de alguien mas o convertir a un usuario que no sea administrador en administrador, pero tanto los administradores como los no administradores solo pueden actualizar su propio usuario
        return res.status(401).json({
            ok: false,
            error: 'No puede modificar un usuario que no le pertenece'
        });
    }

    const { rol, estado, passwordNew, passwordOld, img, ...body } = req.body as UsuarioUpdateBody;

    const passwordCoincide = bcrypt.compareSync(passwordOld, usuario.password);
    if(!passwordCoincide) {
        return res.status(400).json({
            ok: false,
            error: 'Contraseña incorrecta'
        });
    }

    if( !esPesoValido(body.detalle.peso) ) {
        return res.status(400).json({
            ok: true,
            error: 'No se proporcionó un peso valido'
        });
    }

    const salt = bcrypt.genSaltSync();
    body.password = bcrypt.hashSync(passwordNew, salt);

    body.nombre = capitalizar(body.nombre);
    body.apellido = capitalizar(body.apellido);

    const userActualizado = await Usuario.findByIdAndUpdate(usuario.id, body, { new: true });

    return res.status(201).json({
        ok: true,
        data: userActualizado
    });

}

const actualizarUsuarioRol = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
    const { ids, rol }: { ids: string[], rol: string } = req.body;

    const resp = await Usuario.updateMany({ //esto se vio en el curso de mongodb
        _id: {
            $in: [ ...ids ]
        }
    }, {
        // $push: { //esto del $push se vio en el curso de mongodb, y sirve para añadir elementos a un array en el final de ese array, en este caso se añade el valor de la variable rol al atributo rol, y ese atributo pues es un array, aunque con el $push se puede agregar un elemento que ya exista a ese array, por ejemplo si en ese array de rol ya existe el elemento 'ROLE_USER' y aqui se le está agregando el string 'ROLE_USER' con el $push entonces aunque en el array ese elemento estaría repetido sí se agregaría al array, esto con el $push visto en el curso de mongodb, pero con el $addToSet que se ve abajo igual se añade un elemento a un array pero si ese elemento ya está en el array entonces no lo agrega, por eso en su nombre tiene la parte de Set, como los Set de Java o Javascript que no permiten que haya elementos repetidos
        //     rol
        // }
        $addToSet: { //esto se explicó arriba
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
};

const borrarUsuario = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
    const { id } = req.params;
    const { id: idLogueado, rol } = (req as any as tokenUsuario).payload;

    if( !rol.includes('ROLE_ADMIN') ) {
        if(idLogueado.toString() != id) {
            return res.status(403).json({
                ok: false,
                error: 'No puede modificar un usuario que no le pertenece'
            });
        }
    }
    else {
        const usuarios = await Usuario.find({
            rol: {
                $in: [ 'ROLE_ADMIN' ]
            },
            estado: true
        });

        if(usuarios.length == 1 && idLogueado.toString() == id) {
            return res.status(400).json({
                ok: false,
                error: 'Tiene que haber minimo 1 usuario administrador, no puede realizar esta accion'
            });
        }
    }

    // await Usuario.findByIdAndUpdate(id, { estado: false }); //NOTA: El usuario se pudo haber eliminado asi (en realidad no eliminado fisicamente de la base de datos sino actualizandolo con su atributo estado en false), pero al eliminar el usuario tambien debemos eliminarle sus libros y autores (y esos sí se eliminan fisicamente de la base de datos), entonces eso podemos hacerlo aqui mismo de eliminarle sus libros y autores a este usuario, pero hay otra manera de hacerlo y es eliminar en cascada, aunque en mongoose no existe como tal eso de que automaticamente si se elimina un documento que se eliminen tambien los documentos que tiene relacionados, eso en spring por ejemplo sí existe pero en mongoose no, pero para simular lo que sería realizar funciones en cascada sería usar la funcion pre en el modelo, en este caso en el modelo usuario del archivo usuario.ts de la carpeta models, y en esa funcion de pre ponerle el metodo que estamos ejecutando aqui de modo que esa funcion de pre se va a ejecutar automaticamente cuando se esté ejecutando este metodo de aqui, osea la funcion de pre es un middleware, y entonces ahi en esa funcion de pre se puede eliminar los libros y autores de este usuario y aqui solo eliminar el puro usuario y ya, aunque esta linea se comentó porque todo lo que es encontrar por id no funciona con el pre, osea a la funcion pre no se le puede poner el metodo de findById, ni findByIdAndUpdate ni findByIdAndDelete, pero sí podemos ponerle los demas metodos como el updateOne, y por eso esta linea se comentó y se puso el updateOne de la siguiente linea, para que pusieramos ese metodo de updateOne en la funcion pre del modelo de usuario donde pusimos UsuarioSquema.pre('updateOne', function(next) {}), y se pone function siempre a las funciones que pongamos dentro de los modelos como el pre o el toJSON porque asi podemos usar el this, osea el objeto del modelo para que asi podamos acceder a los valores de los atributos de ese modelo ya que nos podrían ser utiles ahi, y pues con una funcion de flecha no se puede acceder al this ahí, ya que pues no están dentro de una clase y eso se vio en la parte 2 del curso de javascript, y vemos ahi que al function le pusimos como parametro next y eso es para decirle que continue para que haga esta operacion de aqui ya que si no le ponemos eso entonces no hará la operacion de aqui, por eso es importante ponerle ese next y ese next solo se pone para los metodos que modifiquen la base de datos como este updateOne, o para el findOneAndDelete por ejemplo, o updateMany y asi, pero no para los que solo retornan informacion pero no modifican nada como el find o findOne, y tambien ese parametro de next se pone para la funcion pre con el metodo de 'validate', osea UsuarioSchema.pre('validate', function(next) {}), y ese de validate no modifica la base de datos pero se ejecuta justo antes de hacer alguna modificacion a la base de datos y pues hace una validacion antes de hacer esa modificacion 
    await Usuario.updateOne({
        _id: new objectId(id),
    }, {
        estado: false
    });

    return res.status(204).json(); //asi no se retorna ningun contenido, solo el status 204 de No Content

};


const subirFoto = async (req: Request, res: Response) => {
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.archivo) { //si no se subió ningun archivo, o con el nombre 'archivo'
        return res.status(400).json({
          msg: 'no se subió ningun archivo'
        });
    }

    try {

        const { id } = req.params;
        const user = await Usuario.findById(id);

        const { id: idLogueado } = (req as any as tokenUsuario).payload;
        if(user.id.toString() != idLogueado) { //los administradores tampoco pueden modificar el usuario de alguien mas, solo pueden borrar el usuario de alguien mas o convertir a un usuario que no sea administrador en administrador, pero tanto los administradores como los no administradores solo pueden actualizar su propio usuario
            return res.status(401).json({
                ok: false,
                error: 'No puede modificar un usuario que no le pertenece'
            });
        }

        if(user.img) {
            const pathImagen = path.join( __dirname, '../uploads', user.id, user.img );
            if(fs.existsSync(pathImagen)) {
                fs.unlinkSync(pathImagen);
            }
        }

        const nombreImg: string = await subirArchivo(req.files, undefined, user.id);
        user.img = nombreImg;

        await user.save();

        const usuario = await Usuario.findById(user.id);

        res.status(201).json({
            ok: true,
            data: usuario
        });

    } catch(err) {
        res.status(400).json({
            ok: false,
            error: {
                mensaje: 'No se pudo subir la foto'
            }
        });
    }
};

const mostrarFoto = async (req: Request, res: Response) => {
    const { id } = req.params;

    const usuario = await Usuario.findById(id);

    const { id: idLogueado, rol } = (req as any as tokenUsuario).payload;
    if(usuario.id.toString() != idLogueado && !rol.includes('ROLE_ADMIN')) { //solo los administradores pueden ver la foto de alguien mas
        return res.status(403).json({
            ok: false,
            error: 'No tiene acceso a este recurso'
        });
    }

    if(usuario.img) {
        const pathImage = path.join( __dirname, '../uploads', usuario.id, usuario.img );
        if(fs.existsSync(pathImage)) {
            return res.sendFile(pathImage);
        }
    }

    const pathImage = path.join( __dirname, '../assets/no-image.jpg' ); //OJO que aqui no se va a leer la carpeta assets del proyecto aqui con typescript, sino que se leerá la carpeta assets que esté dentro de la carpeta dist del proyecto ya que ahí es donde se ejecuta el codigo, aqui nosotros solo estamos usando typescript pero ya al ejecutarlo se ejecuta su parte equivalente a javascript que está dentro de la carpeta dist, asi que ahí debemos crear esa carpeta se assets junto con su archivo de no-image.jpg, ya que si no da error
    res.sendFile(pathImage);

};


export {
    crearUsuarioYEnviarEmail,
    validarUsuarioCreado,
    reenviarCorreo,
    obtenerUsuarios,
    obtenerUsuario,
    actualizarUsuario,
    borrarUsuario,
    actualizarUsuarioRol,
    subirFoto,
    mostrarFoto
};