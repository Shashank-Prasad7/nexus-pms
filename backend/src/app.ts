import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler';
import { apiRateLimiter } from './middlewares/rateLimiter';

dotenv.config();

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration for web application and mobile
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['*'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow mobile apps (which may not send origin header) and configured origins
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiting
app.use('/api', apiRateLimiter);

// Root informational endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Project Management System API',
    version: '1.0.0',
    documentation: '/api/docs',
    status: 'online',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      tasks: '/api/tasks',
      dashboard: '/api/dashboard',
    },
  });
});

// API Routes
app.use('/api', routes);

// 404 and Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
