export const parseMultipartBody = (req, _res, next) => {
  const numericFields = ['price', 'discountPrice', 'stock', 'preparationTime', 'sortOrder', 'rating'];
  const booleanFields = ['isAvailable', 'isActive'];

  for (const field of numericFields) {
    if (req.body[field] !== undefined && req.body[field] !== '') {
      req.body[field] = Number(req.body[field]);
    } else if (req.body[field] === '') {
      delete req.body[field];
    }
  }

  for (const field of booleanFields) {
    if (req.body[field] !== undefined) {
      req.body[field] = req.body[field] === 'true' || req.body[field] === true;
    }
  }

  if (typeof req.body.badges === 'string') {
    try {
      req.body.badges = JSON.parse(req.body.badges);
    } catch {
      req.body.badges = [];
    }
  }

  if (typeof req.body.variants === 'string') {
    try {
      req.body.variants = JSON.parse(req.body.variants);
    } catch {
      req.body.variants = [];
    }
  }

  next();
};
