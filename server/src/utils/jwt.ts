import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface TokenPayload {
  userId: number;
  email: string;
  role: 'BUYER' | 'SUPPLIER';
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
};
