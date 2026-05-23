import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { protectAdmin, telegramWebAppAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderQuerySchema,
} from '../validators/order.validator.js';

const router = Router();

router.post('/', telegramWebAppAuth, validate(createOrderSchema), orderController.createOrder);
router.get('/my', telegramWebAppAuth, validate(orderQuerySchema), orderController.getMyOrders);

router.get('/stats', protectAdmin, orderController.getDashboardStats);
router.get('/', protectAdmin, validate(orderQuerySchema), orderController.getOrders);
router.patch(
  '/:id/status',
  protectAdmin,
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

export default router;
