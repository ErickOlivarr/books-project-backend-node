import { ObjectId } from "mongoose";

export interface tokenUsuario {
    payload: {
        id: ObjectId,
        nombre: string,
        apellido: string,
        rol: string[]
    }
}

export interface UsuarioObjeto {
    id?: ObjectId,
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    estado: boolean;
    rol?: string[];
    detalle: {
        peso?: number;
        fechaNacimiento: Date
    },
    [key: string]: any; //esto permite que podamos agregar atributos a objetos de este tipo, ya que typescript por default hace que a un objeto literal o de clase que no se le pueda agregar atributos dinamicamente como sería con javascript poniendo por ejemplo: const org = {}; org.name = 'mysourcing', eso daría error en typescript porque no se le puede agregar dinamicamente atributos a objetos, pero en javascript eso es totalmente valido (por eso typescript no permite agregar atributos en clase con el this.nombre dentro de esa clase por ejemplo, ya que con typescript para clases debemos tener declarados los atributos de esa clase como en Java, cosa contraria a javascript que sí podemos agregarle asi atributos a una clase poniendo por ejemplo this.nombre dentro de la clase sin declararla como atributo de la clase), asi que para que podamos agregarle a un objeto un atributo dinamicamente ese objeto debe tener de tipo una interfaz como esta o un type (que tenga como tipo un objeto literal) que tenga esto de [key:string], eso indica que puede tener mas atributos que se le pueden ir agregando dinamicamente, eso hicimos en el curso de la parte 2 de react (el curso de react avanzado), asi que por eso se puso esto aqui en esta interfaz
    //OJO que usando typescript sí se podría agregar atributos a un objeto dinamicamente asi como se puede con javascript si ese objeto fuera de tipo any por ejemplo, aunque no tenga una interfaz o type con el [key: string] que se explicó en la anterior linea pero si es de tipo any entonces sí se podría agregarle atributos de manera dinamica a ese objeto, y es que typescript en realidad como tal sí permite añadir dinamicamente atributos a objetos como con javascript pero lo que no permite hacer eso en typescript en realidad son los tipos, su tipado es lo que no permite hacerlo al compilar, pero en tiempo de ejecucion sí permite hacerlo, pero para que no dé error al compilar (ya que para que entre en modo de ejecucion primero debe compilar) podemos ponerle que sea de tipo any como se ha dicho
}

export interface UsuarioUpdateBody {
    nombre: string;
    apellido: string;
    email: string;
    passwordOld: string;
    passwordNew: string;
    detalle: {
        peso?: number;
        fechaNacimiento: Date
    },
    [key: string]: any;
}