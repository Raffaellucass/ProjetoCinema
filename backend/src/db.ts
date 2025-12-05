import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

async function connectDB() {
    try {
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            throw new Error("MONGO_URI não está definida no arquivo .env");
        }

        await mongoose.connect(mongoUri);

        console.log("✅ MongoDB conectado com sucesso!");

        mongoose.connection.on('error', (err) => {
            console.error('❌ Erro na conexão com MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB desconectado');
        });

        mongoose.connection.on('connected', () => {
            console.log('✅ MongoDB reconectado');
        });
    } catch (error: any) {
        console.error("❌ Erro ao conectar ao MongoDB:", error.message);
        console.error("Detalhes:", error);
        process.exit(1);
    }
}

export default connectDB;
