import prisma from '../config/prisma';
import { CreateQuotationInput } from '../validators/quotation.validator';
import { ApiError } from '../utils/apiError';

export class QuotationService {
  static async submitQuotation(supplierId: number, data: CreateQuotationInput) {
    const rfq = await prisma.rFQ.findUnique({
      where: { id: data.rfqId },
    });

    if (!rfq) {
      throw ApiError.notFound('RFQ not found');
    }

    if (rfq.status !== 'OPEN') {
      throw ApiError.badRequest('Cannot submit quotation for a closed RFQ');
    }

    if (new Date(rfq.deadline).getTime() <= Date.now()) {
      throw ApiError.badRequest('RFQ deadline has passed');
    }

    // Check if duplicate
    const existing = await prisma.quotation.findUnique({
      where: {
        rfqId_supplierId: {
          rfqId: data.rfqId,
          supplierId,
        },
      },
    });

    if (existing) {
      throw ApiError.conflict('You have already submitted a quotation for this RFQ');
    }

    const quotation = await prisma.quotation.create({
      data: {
        rfqId: data.rfqId,
        supplierId,
        quotedPrice: data.quotedPrice,
        estimatedDeliveryTime: data.estimatedDeliveryTime,
        message: data.message,
      },
      include: {
        rfq: {
          select: {
            id: true,
            productName: true,
            status: true,
            deadline: true,
          },
        },
      },
    });

    return quotation;
  }

  static async getMyQuotations(supplierId: number) {
    const quotations = await prisma.quotation.findMany({
      where: { supplierId },
      orderBy: { createdAt: 'desc' },
      include: {
        rfq: {
          select: {
            id: true,
            productName: true,
            quantity: true,
            deliveryLocation: true,
            deadline: true,
            status: true,
            buyer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return quotations;
  }

  static async getRfqQuotations(rfqId: number, buyerId: number) {
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
    });

    if (!rfq) {
      throw ApiError.notFound('RFQ not found');
    }

    if (rfq.buyerId !== buyerId) {
      throw ApiError.forbidden('You are not authorized to view quotations for this RFQ');
    }

    const quotations = await prisma.quotation.findMany({
      where: { rfqId },
      orderBy: { createdAt: 'desc' },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return quotations;
  }
}
