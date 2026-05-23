import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import { protectAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { parseMultipartBody } from '../middleware/parseMultipart.js';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  idParamSchema,
} from '../validators/product.validator.js';

const router = Router();

router.get('/search', validate(productQuerySchema), productController.searchProducts);
router.get('/top', productController.getTopProducts);
router.get('/', validate(productQuerySchema), productController.getProducts);
router.get('/category/:categoryId', validate(productQuerySchema), productController.getProductsByCategory);
router.get('/:id', validate(idParamSchema), productController.getProduct);

router.post(
  '/',
  protectAdmin,
  upload.array('images', 5),
  parseMultipartBody,
  validate(createProductSchema),
  productController.createProduct
);
router.put(
  '/:id',
  protectAdmin,
  upload.array('images', 5),
  parseMultipartBody,
  validate(updateProductSchema),
  productController.updateProduct
);
router.patch('/:id/toggle-availability', protectAdmin, validate(idParamSchema), productController.toggleAvailability);
router.delete('/:id', protectAdmin, validate(idParamSchema), productController.deleteProduct);

export default router;
