import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { ApiError } from './utils/apiError';
import { config } from './config';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching clientUrl
      if (!origin || origin === config.clientUrl || config.nodeEnv === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', routes);

// 404 Handler for unmatched routes
app.use((_req, _res, next) => {
  next(ApiError.notFound('The requested endpoint was not found'));
});

// Centralized error handler
app.use(errorHandler);

export default app;
