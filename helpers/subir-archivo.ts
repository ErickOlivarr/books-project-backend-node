import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { FileArray, UploadedFile } from 'express-fileupload';

const subirArchivo = (files: FileArray, extensionesValidas: string[] = [ 'jpg', 'jpeg', 'png' ], carpeta: string = ''): Promise<string | any> => {
    return new Promise((resolve, reject) => {
        const { archivo } = files;
        const extension = (archivo as UploadedFile).mimetype?.split('/')?.[1];

        if(!extension || !extensionesValidas.includes(extension)) {
            return reject(`La extension ${extension} no es permitida, solo se admiten: ${extensionesValidas}`);
        }

        const nombreTemp = uuidv4() + '.' + extension;
        const uploadPath = path.join( __dirname, '../uploads', carpeta, nombreTemp );
        (archivo as UploadedFile).mv(uploadPath, function(err) { //OJO que el codigo se ejecuta en sí en la carpeta dist del proyecto donde está todo el mismo codigo pero su equivalente de javascript, ahí es donde el codigo se ejecuta, entonces este archivo se va a guardar dentro de la carpeta de uploads, que si no existe pues se crea gracias al middleware de los archivos que pusimos en el archivo Server.ts de la carpeta models, pero si tuvieramos ahí que no se cree automaticamente esa carpeta de uploads entonces tendríamos que crear esa carpeta de uploads manualmente pero no en nuestro proyecto con typescript porque ahí no se va a guardar nada, sino dentro de la carpeta dist que es donde el codigo se ejecuta, aqui con typescript pues solo estamos usando typescript pero ya cuando el codigo se ejecuta se ejecuta en realidad lo que está dentro de la carpeta dist del proyecto
            if(err) {
                reject(err);
            }

            resolve(nombreTemp);
        });
    });
};

export default subirArchivo;