export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(
    { body: req.body, query: req.query, params: req.params },
    { abortEarly: false, stripUnknown: true }
  );

  if (error) {
    error.isJoi = true;
    return next(error);
  }

  if (value.body) req.body = value.body;
  if (value.query) req.query = value.query;
  if (value.params) req.params = value.params;
  next();
};
