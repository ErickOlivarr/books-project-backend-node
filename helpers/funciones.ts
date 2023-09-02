import moment from "moment";

const capitalizar = (sentencia: string): string => {
    return sentencia.trim().split(' ').map(palabra => //se quitan los espacios al principio y al final y se capitaliza cada palabra del nombre para asi guardarla en base de datos
            palabra[0].toUpperCase() + palabra.slice(1).toLowerCase()).join(' ');
};

const esFechaValida = (birthday: any): boolean => {
    if(Number.isNaN(Number(birthday))) {
        return false;
    }

    if(birthday < 0) {
        return false;
    }

    if(!moment(birthday).isValid) { 
        return false;
    }

    const theDate = moment(birthday).add(6, 'hours').format('YYYY-MM-DD');

    if( moment().diff(moment(theDate), 'years') < 18 ) {
        return false;
    }
    
    return true;
};

const esPesoValido = (peso: any): boolean => {
    if(peso) {
        if(Number.isNaN(Number(peso))) {
            return false;
        }

        if(Number(peso) < 0) {
            return false;
        }
    }

    return true;
};

export {
    capitalizar,
    esFechaValida,
    esPesoValido
};