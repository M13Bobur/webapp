import { Router } from 'express';
import * as customerController from '../controllers/customer.controller.js';
import { protectAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/telegram', customerController.saveCustomer);
router.get('/', protectAdmin, customerController.getCustomers);
router.get('/:id', protectAdmin, customerController.getCustomer);

export default router;
