import mongoose from 'mongoose';

const ORDER_STATUSES = [
  'pending',
  'accepted',
  'preparing',
  'delivering',
  'completed',
  'cancelled',
];

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    image: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    items: [orderItemSchema],
    totalPrice: { type: Number, required: true, min: 0 },
    deliveryType: { type: String, enum: ['pickup', 'delivery'], default: 'delivery' },
    address: { type: String, default: '' },
    comment: { type: String, default: '' },
    phone: { type: String, required: true },
    paymentMethod: { type: String, enum: ['cash', 'card', 'click', 'payme'], default: 'cash' },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending', index: true },
    orderNumber: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

export const ORDER_STATUS = ORDER_STATUSES;
export const Order = mongoose.model('Order', orderSchema);
