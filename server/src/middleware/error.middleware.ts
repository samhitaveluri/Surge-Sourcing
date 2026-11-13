import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { config } from '../config';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: any = undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err.code === 'P2002') {
    // Prisma unique constraint violation
    statusCode = 409;
    const target = err.meta?.target ? ` for ${err.meta.target}` : '';
    message = `Duplicate entry${target}`;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
  } else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON body';
  } else if (err.message && config.nodeEnv !== 'production') {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { errors: details }),
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};
