import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import connectDB from './db';
import filmeRoutes from './routes/filmeRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/filmes', filmeRoutes);

// Iniciar servidor
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Falha ao iniciar o servidor:', error);
    process.exit(1);
  }
};

startServer();

// Tratamento de erros não capturados
process.on('uncaughtException', (err) => {
  console.error('❌ Erro não capturado (Uncaught Exception):', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promessa rejeitada não tratada (Unhandled Rejection):', reason);
});