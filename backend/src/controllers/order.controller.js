import * as orderService from '../services/order.service.js';
import * as customerService from '../services/customer.service.js';
import * as productService from '../services/product.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.customer._id, req.body);
  res.status(201).json({ success: true, data: order });
});

export const getOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getAllOrders(req.query);
  res.json({ success: true, ...result });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  res.json({ success: true, data: order });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getCustomerOrders(req.customer._id, req.query);
  res.json({ success: true, ...result });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
  res.json({ success: true, data: order });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [stats, activeCustomers, topProducts, revenueChart] = await Promise.all([
    orderService.getOrderStats(),
    customerService.getActiveCustomersCount(),
    productService.getTopProducts(5),
    orderService.getRevenueChart(7),
  ]);

  res.json({
    success: true,
    data: {
      ...stats,
      activeCustomers,
      topProducts,
      revenueChart,
    },
  });
});
