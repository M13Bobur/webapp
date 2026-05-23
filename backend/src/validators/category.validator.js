import Joi from 'joi';

export const createCategorySchema = Joi.object({
  body: Joi.object({
    title: Joi.string().trim().min(2).max(100).required(),
    isActive: Joi.boolean(),
    sortOrder: Joi.number().integer().min(0),
  }),
});

export const updateCategorySchema = Joi.object({
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({
    title: Joi.string().trim().min(2).max(100),
    isActive: Joi.boolean(),
    sortOrder: Joi.number().integer().min(0),
  }).min(1),
});

export const idParamSchema = Joi.object({
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
});
