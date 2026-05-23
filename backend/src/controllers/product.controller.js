import * as productService from '../services/product.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { optimizeImage } from '../utils/imageOptimizer.js';

const getImageUrl = (filename) => `/uploads/${filename}`;

export const createProduct = asyncHandler(async (req, res) => {
  const images = [];
  if (req.files?.length) {
    for (const file of req.files) {
      const optimized = await optimizeImage(file.path);
      images.push(getImageUrl(optimized));
    }
  }
  const product = await productService.createProduct(req.body, images);
  res.status(201).json({ success: true, data: product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const images = [];
  if (req.files?.length) {
    for (const file of req.files) {
      const optimized = await optimizeImage(file.path);
      images.push(getImageUrl(optimized));
    }
  }
  const product = await productService.updateProduct(req.params.id, req.body, images);
  res.json({ success: true, data: product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  res.json({ success: true, message: 'Product deleted' });
});

export const getProducts = asyncHandler(async (req, res) => {
  const result = await productService.getProducts(req.query);
  res.json({ success: true, ...result });
});

export const getProductsByCategory = asyncHandler(async (req, res) => {
  const result = await productService.getProductsByCategory(req.params.categoryId, req.query);
  res.json({ success: true, ...result });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.json({ success: true, data: product });
});

export const searchProducts = asyncHandler(async (req, res) => {
  const result = await productService.searchProducts(req.query.q || req.query.search, req.query);
  res.json({ success: true, ...result });
});

export const toggleAvailability = asyncHandler(async (req, res) => {
  const product = await productService.toggleProductAvailability(req.params.id);
  res.json({ success: true, data: product });
});

export const getTopProducts = asyncHandler(async (req, res) => {
  const products = await productService.getTopProducts(parseInt(req.query.limit, 10) || 5);
  res.json({ success: true, data: products });
});
