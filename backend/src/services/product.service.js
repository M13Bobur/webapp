import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { AppError } from '../utils/AppError.js';
import { createSlug } from '../utils/slug.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';

const buildProductFilter = (query) => {
  const filter = {};
  if (query.categoryId) filter.categoryId = query.categoryId;
  if (query.isAvailable !== undefined) filter.isAvailable = query.isAvailable === 'true' || query.isAvailable === true;
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { tags: { $regex: query.search, $options: 'i' } },
    ];
  }
  return filter;
};

export const createProduct = async (data, images = []) => {
  const category = await Category.findById(data.categoryId);
  if (!category) throw new AppError('Category not found', 404);

  const slug = createSlug(data.title);
  const exists = await Product.findOne({ slug });
  if (exists) throw new AppError('Product with this title already exists', 400);

  return Product.create({ ...data, slug, images });
};

export const updateProduct = async (id, data, newImages = []) => {
  const product = await Product.findById(id);
  if (!product) throw new AppError('Product not found', 404);

  if (data.categoryId) {
    const category = await Category.findById(data.categoryId);
    if (!category) throw new AppError('Category not found', 404);
  }

  if (data.title && data.title !== product.title) {
    data.slug = createSlug(data.title);
    const exists = await Product.findOne({ slug: data.slug, _id: { $ne: id } });
    if (exists) throw new AppError('Product with this title already exists', 400);
  }

  if (newImages.length) {
    data.images = [...(product.images || []), ...newImages];
  }

  Object.assign(product, data);
  await product.save();
  return product.populate('categoryId', 'title slug');
};

export const deleteProduct = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

export const getProducts = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = buildProductFilter(query);
  const sort = query.sort || '-createdAt';

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('categoryId', 'title slug')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return paginatedResponse(products, total, page, limit);
};

export const getProductsByCategory = async (categoryId, query) => {
  return getProducts({ ...query, categoryId, isAvailable: true });
};

export const getProductById = async (id) => {
  const product = await Product.findById(id).populate('categoryId', 'title slug');
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

export const searchProducts = async (search, query) => {
  return getProducts({ ...query, search, isAvailable: true });
};

export const toggleProductAvailability = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new AppError('Product not found', 404);
  product.isAvailable = !product.isAvailable;
  await product.save();
  return product;
};

export const getTopProducts = async (limit = 5) => {
  return Product.find({ isAvailable: true })
    .sort({ orderCount: -1 })
    .limit(limit)
    .select(
      'title slug shortDescription price discountPrice images orderCount badges isAvailable stock'
    );
};
