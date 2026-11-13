import prisma from '../config/prisma';
import { CreateRfqInput, UpdateRfqInput, RfqQueryInput } from '../validators/rfq.validator';
import { ApiError } from '../utils/apiError';
import { TokenPayload } from '../utils/jwt';
import { Prisma, RfqStatus } from '@prisma/client';

export class RfqService {
  static async createRfq(buyerId: number, data: CreateRfqInput) {
    const deadlineDate = new Date(data.deadline);
    if (deadlineDate.getTime() <= Date.now()) {
      throw ApiError.badRequest('Deadline must be a future date and time');
    }

    const rfq = await prisma.rFQ.create({
      data: {
        buyerId,
        productName: data.productName,
        description: data.description,
        quantity: data.quantity,
        deliveryLocation: data.deliveryLocation,
        deadline: deadlineDate,
        status: RfqStatus.OPEN,
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return rfq;
  }

  static async getMyRfqs(buyerId: number) {
    const rfqs = await prisma.rFQ.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { quotations: true },
        },
      },
    });

    return rfqs;
  }

  static async getAllRfqs(query: RfqQueryInput) {
    const where: Prisma.RFQWhereInput = {};

    // Filter by search keyword (productName, description, deliveryLocation)
    if (query.search && query.search.trim()) {
      const searchTerm = query.search.trim();
      where.OR = [
        { productName: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { deliveryLocation: { contains: searchTerm } },
      ];
    }

    // Filter by delivery location
    if (query.location && query.location.trim()) {
      where.deliveryLocation = { contains: query.location.trim() };
    }

    // Filter by status: default to OPEN if not explicitly requested
    if (query.status && query.status !== 'ALL') {
      where.status = query.status as RfqStatus;
    } else if (!query.status) {
      where.status = RfqStatus.OPEN;
    }

    // Filter by deadline
    if (query.deadline === 'active') {
      where.deadline = { gt: new Date() };
    } else if (query.deadline === 'expired') {
      where.deadline = { lte: new Date() };
    }

    const rfqs = await prisma.rFQ.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { quotations: true },
        },
      },
    });

    return rfqs;
  }

  static async getRfqById(rfqId: number, requestingUser?: TokenPayload) {
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { quotations: true },
        },
      },
    });

    if (!rfq) {
      throw ApiError.notFound('RFQ not found');
    }

    // If caller is the owner Buyer, include all quotations received with supplier details
    if (requestingUser && requestingUser.userId === rfq.buyerId) {
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

      return {
        ...rfq,
        quotations,
      };
    }

    // If caller is a Supplier, check whether they have already submitted a quote
    if (requestingUser && requestingUser.role === 'SUPPLIER') {
      const existingQuotation = await prisma.quotation.findUnique({
        where: {
          rfqId_supplierId: {
            rfqId,
            supplierId: requestingUser.userId,
          },
        },
      });

      return {
        ...rfq,
        hasQuoted: !!existingQuotation,
        myQuotation: existingQuotation || null,
      };
    }

    return rfq;
  }

  static async updateRfq(rfqId: number, buyerId: number, data: UpdateRfqInput) {
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
    });

    if (!rfq) {
      throw ApiError.notFound('RFQ not found');
    }

    if (rfq.buyerId !== buyerId) {
      throw ApiError.forbidden('You are not authorized to modify this RFQ');
    }

    const updateData: Prisma.RFQUpdateInput = {};

    if (data.productName !== undefined) updateData.productName = data.productName;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.deliveryLocation !== undefined) updateData.deliveryLocation = data.deliveryLocation;
    if (data.deadline !== undefined) updateData.deadline = new Date(data.deadline);
    if (data.status !== undefined) updateData.status = data.status as RfqStatus;

    const updatedRfq = await prisma.rFQ.update({
      where: { id: rfqId },
      data: updateData,
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { quotations: true },
        },
      },
    });

    return updatedRfq;
  }

  static async deleteRfq(rfqId: number, buyerId: number) {
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
    });

    if (!rfq) {
      throw ApiError.notFound('RFQ not found');
    }

    if (rfq.buyerId !== buyerId) {
      throw ApiError.forbidden('You are not authorized to delete this RFQ');
    }

    await prisma.rFQ.delete({
      where: { id: rfqId },
    });

    return { message: 'RFQ deleted successfully' };
  }
}
