import { Customer } from '../models/Customer.js';
import { Order } from '../models/Order.js';
import { AppError } from '../utils/AppError.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';

export const saveTelegramCustomer = async (data) => {
  const { telegramId, chatId, fullname, username, phone } = data;

  const customer = await Customer.findOneAndUpdate(
    { telegramId: String(telegramId) },
    {
      telegramId: String(telegramId),
      chatId: String(chatId),
      fullname: fullname || '',
      username: username || '',
      phone: phone || '',
    },
    { upsert: true, new: true, runValidators: true }
  );

  return customer;
};

export const getCustomers = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.search) {
    filter.$or = [
      { fullname: { $regex: query.search, $options: 'i' } },
      { phone: { $regex: query.search, $options: 'i' } },
      { username: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [customers, total] = await Promise.all([
    Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Customer.countDocuments(filter),
  ]);

  return paginatedResponse(customers, total, page, limit);
};

export const getCustomerById = async (id) => {
  const customer = await Customer.findById(id);
  if (!customer) throw new AppError('Customer not found', 404);

  const orders = await Order.find({ customerId: id })
    .sort({ createdAt: -1 })
    .limit(10);

  return { customer, recentOrders: orders };
};

export const getActiveCustomersCount = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return Order.distinct('customerId', { createdAt: { $gte: thirtyDaysAgo } }).then(
    (ids) => ids.length
  );
};
