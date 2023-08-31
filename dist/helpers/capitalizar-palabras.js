const capitalizar = (sentencia) => {
    return sentencia.trim().split(' ').map(palabra => //se quitan los espacios al principio y al final y se capitaliza cada palabra del nombre para asi guardarla en base de datos
     palabra[0].toUpperCase() + palabra.slice(1).toLowerCase()).join(' ');
};
//# sourceMappingURL=capitalizar-palabras.js.map