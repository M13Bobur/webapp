import * as customerService from '../services/customer.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const saveCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.saveTelegramCustomer(req.body);
  res.json({ success: true, data: customer });
});

export const getCustomers = asyncHandler(async (req, res) => {
  const result = await customerService.getCustomers(req.query);
  res.json({ success: true, ...result });
});

export const getCustomer = asyncHandler(async (req, res) => {
  const result = await customerService.getCustomerById(req.params.id);
  res.json({ success: true, data: result });
});
