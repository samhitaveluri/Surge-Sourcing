import { Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { AuthRequest } from '../types/auth';

export const authorizeRoles = (...allowedRoles: Array<'BUYER' | 'SUPPLIER'>) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`
        )
      );
    }

    next();
  };
};
