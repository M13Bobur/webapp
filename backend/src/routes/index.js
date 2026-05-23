import { Router } from 'express';
import authRoutes from './auth.routes.js';
import categoryRoutes from './category.routes.js';
import productRoutes from './product.routes.js';
import orderRoutes from './order.routes.js';
import customerRoutes from './customer.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/customers', customerRoutes);

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Faiza Cafe API is running' });
});

export default router;
