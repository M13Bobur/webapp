import slugify from 'slugify';

export const createSlug = (text) =>
  slugify(text, { lower: true, strict: true, locale: 'uz' });
