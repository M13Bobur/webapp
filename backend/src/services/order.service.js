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

const normalizeImagePath = (path) => {
  if (!path || typeof path !== 'string') return '';
  const p = path.trim();
  if (p.startsWith('http')) return p;
  if (p.startsWith('/uploads/')) return p;
  if (p.startsWith('uploads/')) return `/${p}`;
  return `/uploads/${p}`;
};

const orderPopulate = [
  { path: 'customerId', select: 'fullname phone username telegramId chatId' },
  { path: 'items.productId', select: 'images title' },
];

export const enrichOrdersWithImages = async (orders) => {
  const productIds = new Set();

  for (const order of orders) {
    for (const item of order.items || []) {
      const id = item.productId?._id || item.productId;
      if (id) productIds.add(String(id));
    }
  }

  let productMap = {};
  if (productIds.size > 0) {
    const products = await Product.find({ _id: { $in: [...productIds] } })
      .select('images title')
      .lean();
    productMap = Object.fromEntries(
      products.map((p) => {
        const image = normalizeImagePath(p.images?.[0] || '');
        return [
          String(p._id),
          {
            _id: p._id,
            title: p.title,
            image,
            images: (p.images || []).map(normalizeImagePath).filter(Boolean),
          },
        ];
      })
    );
  }

  return orders.map((order) => {
    const doc = order.toObject ? order.toObject() : { ...order };
    doc.items = (doc.items || []).map((item) => {
      const pid = String(item.productId?._id || item.productId || '');
      const populated =
        item.productId && typeof item.productId === 'object' ? item.productId : null;
      const fromDb = productMap[pid];
      const fromPopulate = populated
        ? {
            _id: populated._id,
            title: populated.title,
            image: normalizeImagePath(populated.images?.[0] || ''),
            images: (populated.images || []).map(normalizeImagePath).filter(Boolean),
          }
        : null;
      const product = fromDb || fromPopulate;
      const image = normalizeImagePath(
        item.image || product?.image || product?.images?.[0] || ''
      );

      return {
        productId: pid,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        image,
        product: {
          _id: product?._id || pid,
          title: product?.title || item.title,
          image,
          images: product?.images?.length ? product.images : image ? [image] : [],
        },
      };
    });
    return doc;
  });
};

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
      image: normalizeImagePath(product.images?.[0] || ''),
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

  const populated = await Order.findById(order._id).populate(orderPopulate);
  const [enriched] = await enrichOrdersWithImages([populated]);

  const customer = populated.customerId;
  await notifyAdminNewOrder(enriched, customer);
  await notifyCustomerOrder(customer, enriched, 'pending');
  emitOrderUpdate(enriched);

  return enriched;
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
    Order.find(filter).populate(orderPopulate).sort(sort).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  const enriched = await enrichOrdersWithImages(orders);
  return paginatedResponse(enriched, total, page, limit);
};

export const getOrderById = async (id) => {
  const order = await Order.findById(id).populate(orderPopulate);
  if (!order) throw new AppError('Order not found', 404);
  const [enriched] = await enrichOrdersWithImages([order]);
  return enriched;
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
  const order = await Order.findById(id).populate(orderPopulate);
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

  const [enriched] = await enrichOrdersWithImages([order]);
  emitOrderUpdate(enriched);
  return enriched;
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
