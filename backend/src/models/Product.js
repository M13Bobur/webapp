import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '' },
    shortDescription: { type: String, default: '' },
    variants: { type: [variantSchema], default: [] },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0, default: null },
    images: [{ type: String }],
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    isAvailable: { type: Boolean, default: true },
    stock: { type: Number, default: 100, min: 0 },
    tags: [{ type: String }],
    badges: [{ type: String, enum: ['new', 'hot', 'popular'], default: [] }],
    preparationTime: { type: Number, default: 15 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    orderCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Product = mongoose.model('Product', productSchema);
