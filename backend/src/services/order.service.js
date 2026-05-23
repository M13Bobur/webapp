import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Customer } from '../models/Customer.js';
import { AppError } from '../utils/AppError.js';
import { generateOrderNumber } from '../utils/orderNumber.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';
import {
  notifyCustomerOrder,
  notifyAdminNewOrder,
  emitOrderUpdate,
} from './notification.service.js';

export const createOrder = async (customerId, orderData) => {
  const { items, deliveryType, address, comment, phone, paymentMethod } = orderData;

  const orderItems = [];
  let totalPrice = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || !product.isAvailable) {
      throw new AppError(`Product "${item.productId}" is not available`, 400);
    }
    if (product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for "${product.title}"`, 400);
    }

    const price = product.discountPrice ?? product.price;
    orderItems.push({
      productId: product._id,
      title: product.title,
      quantity: item.quantity,
      price,
    });
    totalPrice += price * item.quantity;

    product.stock -= item.quantity;
    product.orderCount += item.quantity;
    await product.save();
  }

  const order = await Order.create({
    customerId,
    items: orderItems,
    totalPrice,
    deliveryType,
    address,
    comment,
    phone,
    paymentMethod,
    orderNumber: generateOrderNumber(),
    status: 'pending',
  });

  const populated = await Order.findById(order._id)
    .populate('customerId', 'fullname phone telegramId chatId username');

  const customer = populated.customerId;
  await notifyAdminNewOrder(populated, customer);
  await notifyCustomerOrder(customer, populated, 'pending');
  emitOrderUpdate(populated);

  return populated;
};

export const getAllOrders = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = new Date(query.from);
    if (query.to) filter.createdAt.$lte = new Date(query.to);
  }
  if (query.search) {
    filter.$or = [
      { orderNumber: { $regex: query.search, $options: 'i' } },
      { phone: { $regex: query.search, $options: 'i' } },
    ];
  }

  const sort = query.sort || '-createdAt';

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('customerId', 'fullname phone username telegramId')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  return paginatedResponse(orders, total, page, limit);
};

export const getCustomerOrders = async (customerId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { customerId };

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  return paginatedResponse(orders, total, page, limit);
};

export const updateOrderStatus = async (id, status) => {
  const order = await Order.findById(id).populate(
    'customerId',
    'fullname phone chatId telegramId'
  );
  if (!order) throw new AppError('Order not found', 404);

  const previousStatus = order.status;
  order.status = status;
  await order.save();

  const customer = order.customerId;
  if (customer && ['accepted', 'rejected', 'completed', 'cancelled', 'preparing', 'delivering'].includes(status)) {
    const notifyStatus = status === 'cancelled' ? 'cancelled' : status;
    if (previousStatus !== status) {
      await notifyCustomerOrder(customer, order, notifyStatus);
    }
  }

  emitOrderUpdate(order);
  return order;
};

export const getOrderStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalOrders, todayOrders, revenueResult, statusBreakdown] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: today } }),
    Order.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const todayRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: today }, status: { $nin: ['cancelled'] } } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  return {
    totalOrders,
    todayOrders,
    totalRevenue: revenueResult[0]?.total || 0,
    todayRevenue: todayRevenue[0]?.total || 0,
    statusBreakdown: statusBreakdown.reduce((acc, s) => {
      acc[s._id] = s.count;
      return acc;
    }, {}),
  };
};

export const getRevenueChart = async (days = 7) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  return Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $nin: ['cancelled'] },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};
