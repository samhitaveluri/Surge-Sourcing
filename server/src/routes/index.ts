import { Router } from 'express';
import authRoutes from './auth.routes';
import rfqRoutes from './rfq.routes';
import quotationRoutes from './quotation.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/rfqs', rfqRoutes);
router.use('/quotations', quotationRoutes);

export default router;
