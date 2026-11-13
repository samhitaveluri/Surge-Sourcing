import { Router } from 'express';
import { QuotationController } from '../controllers/quotation.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createQuotationSchema } from '../validators/quotation.validator';

const router = Router();

// All quotation routes require authentication
router.use(authMiddleware);

// Submit quotation - SUPPLIER only
router.post(
  '/',
  authorizeRoles('SUPPLIER'),
  validateBody(createQuotationSchema),
  QuotationController.submitQuotation
);

// View submitted quotations - SUPPLIER only
router.get('/my', authorizeRoles('SUPPLIER'), QuotationController.getMyQuotations);

export default router;
