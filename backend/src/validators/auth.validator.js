import Joi from 'joi';

export const loginSchema = Joi.object({
  body: Joi.object({
    phone: Joi.string().min(9).max(20).required(),
    password: Joi.string().min(6).required(),
  }),
});
