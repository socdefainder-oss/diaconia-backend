import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.NODE_ENV === 'production'
      ? process.env.MONGODB_URI_PROD
      : process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MongoDB URI não está definida nas variáveis de ambiente');
    }

    const conn = await mongoose.connect(mongoURI);

    console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ Erro na conexão MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB desconectado');
    });

  } catch (error: any) {
    console.error('❌ Erro ao conectar MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;
