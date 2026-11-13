import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendResponse } from '../utils/response';
import { AuthRequest } from '../types/auth';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      return sendResponse(res, 201, 'User registered successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      return sendResponse(res, 200, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getMe(req.user!.userId);
      return sendResponse(res, 200, 'User profile retrieved', user);
    } catch (error) {
      next(error);
    }
  }
}
