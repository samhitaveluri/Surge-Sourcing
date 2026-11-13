import { Router } from 'express';
import { RfqController } from '../controllers/rfq.controller';
import { QuotationController } from '../controllers/quotation.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { validateBody, validateQuery } from '../middleware/validate.middleware';
import { createRfqSchema, updateRfqSchema, rfqQuerySchema } from '../validators/rfq.validator';

const router = Router();

// All RFQ routes require authentication
router.use(authMiddleware);

// Browse RFQs (search, filter) - accessible to both BUYER and SUPPLIER
router.get('/', validateQuery(rfqQuerySchema), RfqController.getAllRfqs);

// Buyer's own RFQs
router.get('/my', authorizeRoles('BUYER'), RfqController.getMyRfqs);

// View RFQ details (if owner Buyer, returns quotations too; if Supplier, returns whether they quoted)
router.get('/:id', RfqController.getRfqById);

// Create RFQ - BUYER only
router.post('/', authorizeRoles('BUYER'), validateBody(createRfqSchema), RfqController.createRfq);

// Update RFQ - BUYER only (service enforces ownership)
router.put('/:id', authorizeRoles('BUYER'), validateBody(updateRfqSchema), RfqController.updateRfq);

// Delete RFQ - BUYER only (service enforces ownership)
router.delete('/:id', authorizeRoles('BUYER'), RfqController.deleteRfq);

// View quotations received for a specific RFQ - BUYER only (service enforces ownership)
router.get('/:id/quotations', authorizeRoles('BUYER'), QuotationController.getRfqQuotations);

export default router;
