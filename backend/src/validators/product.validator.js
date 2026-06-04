import Joi from 'joi';

const variantSchema = Joi.object({
  name: Joi.string().trim().min(1).max(80).required(),
  price: Joi.number().min(0).required(),
});

export const createProductSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().trim().min(2).max(200).required(),
    description: Joi.string().allow(''),
    shortDescription: Joi.string().max(300).allow(''),
    variants: Joi.array().items(variantSchema).max(20).default([]),
    price: Joi.number().min(0).when('variants', {
      is: Joi.array().min(1),
      then: Joi.optional(),
      otherwise: Joi.required(),
    }),
    discountPrice: Joi.number().min(0).allow(null),
    categoryId: Joi.string().hex().length(24).required(),
    isAvailable: Joi.boolean(),
    stock: Joi.number().integer().min(0),
    tags: Joi.array().items(Joi.string()),
    badges: Joi.array().items(Joi.string().valid('new', 'hot', 'popular')),
    preparationTime: Joi.number().integer().min(1),
    rating: Joi.number().min(0).max(5),
  }),
});

export const updateProductSchema = Joi.object({
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({
    title: Joi.string().trim().min(2).max(200),
    description: Joi.string().allow(''),
    shortDescription: Joi.string().max(300).allow(''),
    variants: Joi.array().items(variantSchema).max(20),
    price: Joi.number().min(0),
    discountPrice: Joi.number().min(0).allow(null),
    categoryId: Joi.string().hex().length(24),
    isAvailable: Joi.boolean(),
    stock: Joi.number().integer().min(0),
    tags: Joi.array().items(Joi.string()),
    badges: Joi.array().items(Joi.string().valid('new', 'hot', 'popular')),
    preparationTime: Joi.number().integer().min(1),
    rating: Joi.number().min(0).max(5),
  }).min(1),
});

export const idParamSchema = Joi.object({
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
});

export const productQuerySchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    categoryId: Joi.string().hex().length(24),
    search: Joi.string().allow(''),
    isAvailable: Joi.boolean(),
    sort: Joi.string().valid('price', '-price', 'title', '-title', 'createdAt', '-createdAt'),
  }),
});
