import mongoose from 'mongoose';


const conexion = async () => {
    try {
        await mongoose.connect( process.env.MONGODB_CNN_ATLAS );
        console.log('base de datos lista');
    } catch(err) {
        console.log(err);
        console.log('hubo un error en la conexion a base de datos');
    }
};

export { 
    conexion
};