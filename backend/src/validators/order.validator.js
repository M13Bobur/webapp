import Joi from 'joi';

const orderItemSchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).required(),
  variantName: Joi.string().trim().max(80).allow(''),
});

export const createOrderSchema = Joi.object({
  body: Joi.object({
    items: Joi.array().items(orderItemSchema).min(1).required(),
    deliveryType: Joi.string().valid('pickup', 'delivery').default('delivery'),
    address: Joi.string().allow(''),
    comment: Joi.string().max(500).allow(''),
    phone: Joi.string().required(),
    paymentMethod: Joi.string().valid('cash', 'card', 'click', 'payme').default('cash'),
  }),
});

export const orderIdSchema = Joi.object({
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
});

export const updateOrderStatusSchema = Joi.object({
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({
    status: Joi.string()
      .valid('pending', 'accepted', 'preparing', 'delivering', 'completed', 'cancelled')
      .required(),
  }),
});

export const orderQuerySchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    status: Joi.string().valid('pending', 'accepted', 'preparing', 'delivering', 'completed', 'cancelled'),
    search: Joi.string().allow(''),
    sort: Joi.string().valid('createdAt', '-createdAt', 'totalPrice', '-totalPrice'),
    from: Joi.date().iso(),
    to: Joi.date().iso(),
  }),
});
