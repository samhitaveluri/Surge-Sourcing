import { Response, NextFunction } from 'express';
import { QuotationService } from '../services/quotation.service';
import { sendResponse } from '../utils/response';
import { ApiError } from '../utils/apiError';
import { AuthRequest } from '../types/auth';

export class QuotationController {
  static async submitQuotation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const quotation = await QuotationService.submitQuotation(
        req.user!.userId,
        req.body
      );
      return sendResponse(res, 201, 'Quotation submitted successfully', quotation);
    } catch (error) {
      next(error);
    }
  }

  static async getMyQuotations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const quotations = await QuotationService.getMyQuotations(req.user!.userId);
      return sendResponse(
        res,
        200,
        'My quotations retrieved successfully',
        quotations
      );
    } catch (error) {
      next(error);
    }
  }

  static async getRfqQuotations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const rfqId = parseInt(req.params.id, 10);
      if (isNaN(rfqId)) {
        throw ApiError.badRequest('Invalid RFQ ID format');
      }

      const quotations = await QuotationService.getRfqQuotations(
        rfqId,
        req.user!.userId
      );
      return sendResponse(
        res,
        200,
        'Quotations for RFQ retrieved successfully',
        quotations
      );
    } catch (error) {
      next(error);
    }
  }
}
