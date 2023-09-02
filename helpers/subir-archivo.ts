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
        (archivo as UploadedFile).mv(uploadPath, function(err) {
            if(err) {
                reject(err);
            }

            resolve(nombreTemp);
        });
    });
};

export default subirArchivo;