const mongoose = require('mongoose');

// URL de conexión a MongoDB
const MONGODB_URL = process.env.MONGODB_URL || process.env.MONGO_URL || process.env.MONGO_PRIVATE_URL;

let isConnected = false;

const init = async () => {
  if (isConnected) {
    console.log('Ya conectado a MongoDB');
    return;
  }

  if (!MONGODB_URL) {
    console.error('Error: MONGODB_URL no está configurada');
    throw new Error('MONGODB_URL no está configurada');
  }

  try {
    await mongoose.connect(MONGODB_URL, {
      // Opciones de conexión recomendadas
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    isConnected = true;
    console.log('Conectado a MongoDB exitosamente');
    
    // Manejar eventos de conexión
    mongoose.connection.on('error', (err) => {
      console.error('Error de conexión a MongoDB:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Desconectado de MongoDB');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('Reconectado a MongoDB');
      isConnected = true;
    });

  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    isConnected = false;
    throw error;
  }
};

const getConnection = () => {
  if (!isConnected) {
    throw new Error('Base de datos no conectada. Llama a init() primero.');
  }
  return mongoose.connection;
};

module.exports = {
  init,
  getConnection,
  mongoose
};
