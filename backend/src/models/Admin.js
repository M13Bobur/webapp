import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, select: false },
    name: { type: String, default: 'Admin' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const Admin = mongoose.model('Admin', adminSchema);
