import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

// Carregar variáveis de ambiente
dotenv.config();

// Importar configurações
import connectDB from './config/database';
import { errorHandler } from './middlewares/errorHandler';

// Importar rotas
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import courseRoutes from './routes/courseRoutes';
import scheduleRoutes from './routes/scheduleRoutes';
import announcementRoutes from './routes/announcementRoutes';
import uploadRoutes from './routes/uploadRoutes';
import progressRoutes from './routes/progressRoutes';
import certificateRoutes from './routes/certificateRoutes';
import teamRoutes from './routes/teamRoutes';
import debugRoutes from './routes/debugRoutes';
import syncRoutes from './routes/syncRoutes';

// Inicializar app
const app: Application = express();

// Trust proxy - necessário para Render/Heroku/etc
app.set('trust proxy', 1);

// Conectar ao banco de dados
connectDB();

// CORS - DEVE VIR ANTES DE TUDO
const allowedOrigins: string[] = [
  'https://diaconia-frontend.vercel.app',
  'http://localhost:3000',
  process.env.FRONTEND_URL || ''
].filter(Boolean) as string[];

// Headers CORS manuais (mais confiável)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Permitir todas as origens da lista
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://diaconia-frontend.vercel.app');
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
  return;
});

// Middlewares de segurança
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  skip: (req) => req.method === 'OPTIONS', // Pular rate limit para preflight
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression
app.use(compression());

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rotas
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: ' API Diaconia AD Alpha - Backend',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      courses: '/api/courses',
      schedules: '/api/schedules',
      announcements: '/api/announcements',
      upload: '/api/upload',
      progress: '/api/progress',
    },
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'UP',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/debug', debugRoutes); // Rota de debug temporária

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.originalUrl,
  });
});

// Error handler
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
    
                                           
        DIACONIA AD ALPHA - BACKEND    
                                           
       Servidor rodando na porta: ${PORT}     
       Ambiente: ${process.env.NODE_ENV || 'development'}            
                                           
    
  `);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err: Error) => {
  console.error(' UNHANDLED REJECTION! Encerrando...');
  console.error(err.name, err.message);
  process.exit(1);
});

process.on('uncaughtException', (err: Error) => {
  console.error(' UNCAUGHT EXCEPTION! Encerrando...');
  console.error(err.name, err.message);
  process.exit(1);
});

export default app;
