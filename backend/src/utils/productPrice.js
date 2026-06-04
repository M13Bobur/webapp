import { AppError } from './AppError.js';

export const normalizeVariants = (variants) => {
  if (!variants) return [];
  let list = variants;
  if (typeof variants === 'string') {
    try {
      list = JSON.parse(variants);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(list)) return [];

  return list
    .map((v) => ({
      name: String(v.name || '').trim(),
      price: Number(v.price),
    }))
    .filter((v) => v.name && !Number.isNaN(v.price) && v.price >= 0);
};

export const getProductVariants = (product) =>
  Array.isArray(product?.variants) ? product.variants.filter((v) => v?.name) : [];

export const hasProductVariants = (product) => getProductVariants(product).length > 0;

export const resolveProductPrice = (product, variantName = '') => {
  const variants = getProductVariants(product);

  if (variants.length > 0) {
    const name = String(variantName || '').trim();
    if (!name) {
      throw new AppError(`"${product.title}" uchun variant tanlang`, 400);
    }
    const variant = variants.find((v) => v.name === name);
    if (!variant) {
      throw new AppError(`Variant "${name}" topilmadi`, 400);
    }
    return variant.price;
  }

  return product.discountPrice ?? product.price;
};

export const getProductPriceRange = (product) => {
  const variants = getProductVariants(product);
  if (variants.length > 0) {
    const prices = variants.map((v) => v.price);
    return { min: Math.min(...prices), max: Math.max(...prices), fromVariants: true };
  }
  const price = product.discountPrice ?? product.price;
  return { min: price, max: price, fromVariants: false };
};

export const applyVariantsToProductData = (data) => {
  const variants = normalizeVariants(data.variants);
  if (variants.length > 0) {
    data.variants = variants;
    data.price = Math.min(...variants.map((v) => v.price));
    data.discountPrice = null;
  } else {
    data.variants = [];
  }
  return data;
};
