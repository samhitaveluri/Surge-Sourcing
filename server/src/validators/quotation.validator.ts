import { z } from 'zod';

export const createQuotationSchema = z.object({
  rfqId: z.number({ invalid_type_error: 'RFQ ID must be a number' }).int().positive(),
  quotedPrice: z.number({ invalid_type_error: 'Quoted price must be a number' }).positive('Quoted price must be greater than 0'),
  estimatedDeliveryTime: z.string().trim().min(1, 'Estimated delivery time is required').max(100),
  message: z.string().trim().max(2000, 'Message cannot exceed 2000 characters').optional(),
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;
