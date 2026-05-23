import * as categoryService from '../services/category.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { optimizeImage } from '../utils/imageOptimizer.js';
import path from 'path';
import { env } from '../config/env.js';

const getImageUrl = (filename) => (filename ? `/uploads/${filename}` : '');

export const createCategory = asyncHandler(async (req, res) => {
  let image = '';
  if (req.file) {
    const optimized = await optimizeImage(req.file.path);
    image = getImageUrl(optimized);
  }
  const category = await categoryService.createCategory(req.body, image);
  res.status(201).json({ success: true, data: category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  let image;
  if (req.file) {
    const optimized = await optimizeImage(req.file.path);
    image = getImageUrl(optimized);
  }
  const category = await categoryService.updateCategory(req.params.id, req.body, image);
  res.json({ success: true, data: category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
});

export const getCategories = asyncHandler(async (req, res) => {
  const activeOnly = req.query.active === 'true';
  const categories = await categoryService.getAllCategories(activeOnly);
  res.json({ success: true, data: categories });
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  res.json({ success: true, data: category });
});
