import { z } from 'zod';

export const createRfqSchema = z.object({
  productName: z.string().trim().min(2, 'Product name must be at least 2 characters').max(255),
  description: z.string().trim().min(5, 'Description must be at least 5 characters'),
  quantity: z.number({ invalid_type_error: 'Quantity must be a number' }).int('Quantity must be an integer').positive('Quantity must be greater than 0'),
  deliveryLocation: z.string().trim().min(2, 'Delivery location must be at least 2 characters').max(255),
  deadline: z.string().datetime({ message: 'Deadline must be a valid ISO date string' }).refine(
    (val) => new Date(val).getTime() > Date.now(),
    { message: 'Deadline must be in the future' }
  ),
});

export const updateRfqSchema = z.object({
  productName: z.string().trim().min(2, 'Product name must be at least 2 characters').max(255).optional(),
  description: z.string().trim().min(5, 'Description must be at least 5 characters').optional(),
  quantity: z.number().int().positive('Quantity must be greater than 0').optional(),
  deliveryLocation: z.string().trim().min(2, 'Delivery location must be at least 2 characters').max(255).optional(),
  deadline: z.string().datetime().refine(
    (val) => new Date(val).getTime() > Date.now(),
    { message: 'Deadline must be in the future' }
  ).optional(),
  status: z.enum(['OPEN', 'CLOSED']).optional(),
});

export const rfqQuerySchema = z.object({
  search: z.string().trim().optional(),
  location: z.string().trim().optional(),
  status: z.enum(['OPEN', 'CLOSED', 'ALL']).optional(),
  deadline: z.enum(['active', 'expired', 'all']).optional(),
});

export type CreateRfqInput = z.infer<typeof createRfqSchema>;
export type UpdateRfqInput = z.infer<typeof updateRfqSchema>;
export type RfqQueryInput = z.infer<typeof rfqQuerySchema>;
