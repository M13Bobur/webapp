import * as authService from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const login = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;
  const result = await authService.loginAdmin(phone, password);
  res.json({ success: true, data: result });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { id: req.admin._id, phone: req.admin.phone, name: req.admin.name },
  });
});
