export const hasVariants = (product) => Array.isArray(product?.variants) && product.variants.length > 0;

export const getVariantPrice = (product, variantName) => {
  const variant = product.variants?.find((v) => v.name === variantName);
  return variant?.price ?? product.discountPrice ?? product.price;
};

export const getDisplayPrice = (product) => {
  if (hasVariants(product)) {
    const prices = product.variants.map((v) => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return { min, max, label: min === max ? `${min.toLocaleString()} so'm` : `${min.toLocaleString()} - ${max.toLocaleString()} so'm` };
  }
  const price = product.discountPrice ?? product.price;
  return { min: price, max: price, label: `${price.toLocaleString()} so'm` };
};

export const makeCartLineId = (productId, variantName = '') => `${productId}::${variantName || ''}`;
