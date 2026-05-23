import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { protectAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { parseMultipartBody } from '../middleware/parseMultipart.js';
import {
  createCategorySchema,
  updateCategorySchema,
  idParamSchema,
} from '../validators/category.validator.js';

const router = Router();

router.get('/', categoryController.getCategories);
router.get('/:id', validate(idParamSchema), categoryController.getCategory);

router.post(
  '/',
  protectAdmin,
  upload.single('image'),
  parseMultipartBody,
  validate(createCategorySchema),
  categoryController.createCategory
);
router.put(
  '/:id',
  protectAdmin,
  upload.single('image'),
  parseMultipartBody,
  validate(updateCategorySchema),
  categoryController.updateCategory
);
router.delete(
  '/:id',
  protectAdmin,
  validate(idParamSchema),
  categoryController.deleteCategory
);

export default router;
