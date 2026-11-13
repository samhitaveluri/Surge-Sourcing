import { Response, NextFunction } from 'express';
import { RfqService } from '../services/rfq.service';
import { sendResponse } from '../utils/response';
import { ApiError } from '../utils/apiError';
import { AuthRequest } from '../types/auth';

export class RfqController {
  static async createRfq(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const rfq = await RfqService.createRfq(req.user!.userId, req.body);
      return sendResponse(res, 201, 'RFQ created successfully', rfq);
    } catch (error) {
      next(error);
    }
  }

  static async getMyRfqs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const rfqs = await RfqService.getMyRfqs(req.user!.userId);
      return sendResponse(res, 200, 'My RFQs retrieved successfully', rfqs);
    } catch (error) {
      next(error);
    }
  }

  static async getAllRfqs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const rfqs = await RfqService.getAllRfqs(req.query as any);
      return sendResponse(res, 200, 'RFQs retrieved successfully', rfqs);
    } catch (error) {
      next(error);
    }
  }

  static async getRfqById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw ApiError.badRequest('Invalid RFQ ID format');
      }

      const rfq = await RfqService.getRfqById(id, req.user);
      return sendResponse(res, 200, 'RFQ details retrieved successfully', rfq);
    } catch (error) {
      next(error);
    }
  }

  static async updateRfq(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw ApiError.badRequest('Invalid RFQ ID format');
      }

      const updatedRfq = await RfqService.updateRfq(id, req.user!.userId, req.body);
      return sendResponse(res, 200, 'RFQ updated successfully', updatedRfq);
    } catch (error) {
      next(error);
    }
  }

  static async deleteRfq(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw ApiError.badRequest('Invalid RFQ ID format');
      }

      const result = await RfqService.deleteRfq(id, req.user!.userId);
      return sendResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }
}
