import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { AppError } from '../utils/AppError.js';
import { createSlug } from '../utils/slug.js';

export const createCategory = async (data, imageFile) => {
  const slug = createSlug(data.title);
  const exists = await Category.findOne({ slug });
  if (exists) throw new AppError('Category with this title already exists', 400);

  return Category.create({
    ...data,
    slug,
    image: imageFile || '',
  });
};

export const updateCategory = async (id, data, imageFile) => {
  const category = await Category.findById(id);
  if (!category) throw new AppError('Category not found', 404);

  if (data.title && data.title !== category.title) {
    data.slug = createSlug(data.title);
    const exists = await Category.findOne({ slug: data.slug, _id: { $ne: id } });
    if (exists) throw new AppError('Category with this title already exists', 400);
  }

  if (imageFile) data.image = imageFile;
  Object.assign(category, data);
  await category.save();
  return category;
};

export const deleteCategory = async (id) => {
  const productsCount = await Product.countDocuments({ categoryId: id });
  if (productsCount > 0) {
    throw new AppError('Cannot delete category with products', 400);
  }

  const category = await Category.findByIdAndDelete(id);
  if (!category) throw new AppError('Category not found', 404);
  return category;
};

export const getAllCategories = async (activeOnly = false) => {
  const filter = activeOnly ? { isActive: true } : {};
  return Category.find(filter).sort({ sortOrder: 1, title: 1 });
};

export const getCategoryById = async (id) => {
  const category = await Category.findById(id);
  if (!category) throw new AppError('Category not found', 404);
  return category;
};
