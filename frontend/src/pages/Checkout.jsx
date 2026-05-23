import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import { useCartStore } from '../store/cartStore';
import { useTelegram } from '../hooks/useTelegram';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { tg } = useTelegram();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    phone: '',
    address: '',
    comment: '',
    deliveryType: 'delivery',
    paymentMethod: 'cash',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone) {
      tg?.showAlert?.('Telefon raqamni kiriting');
      return;
    }
    setLoading(true);
    try {
      await api.post('/orders', {
        items: items.map((i) => ({ productId: i._id, quantity: i.quantity })),
        phone: form.phone,
        address: form.address,
        comment: form.comment,
        deliveryType: form.deliveryType,
        paymentMethod: form.paymentMethod,
      });
      clearCart();
      tg?.HapticFeedback?.notificationOccurred('success');
      navigate('/orders');
    } catch (err) {
      tg?.showAlert?.(err.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="px-4 py-4 pb-8">
      <h1 className="text-xl font-bold mb-4">Buyurtma</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-gray-500">Telefon *</label>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+998 90 123 45 67"
            className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-gray-500">Yetkazish turi</label>
          <div className="flex gap-2 mt-1">
            {['delivery', 'pickup'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setForm({ ...form, deliveryType: type })}
                className={`flex-1 rounded-xl py-2.5 text-sm font-medium border ${
                  form.deliveryType === type
                    ? 'border-brand-600 bg-brand-50 text-brand-600 dark:bg-brand-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {type === 'delivery' ? '🚗 Yetkazish' : '🏪 Olib ketish'}
              </button>
            ))}
          </div>
        </div>
        {form.deliveryType === 'delivery' && (
          <div>
            <label className="text-sm text-gray-500">Manzil</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={2}
              placeholder="Ko'cha, uy, kvartira..."
              className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm"
            />
          </div>
        )}
        <div>
          <label className="text-sm text-gray-500">To'lov usuli</label>
          <select
            value={form.paymentMethod}
            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm"
          >
            <option value="cash">Naqd pul</option>
            <option value="card">Karta</option>
            <option value="click">Click</option>
            <option value="payme">Payme</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-500">Izoh</label>
          <textarea
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            rows={2}
            placeholder="Qo'shimcha tilak..."
            className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm"
          />
        </div>
        <div className="rounded-2xl bg-brand-50 dark:bg-brand-900/20 p-4">
          <div className="flex justify-between font-semibold text-lg">
            <span>Jami</span>
            <span className="text-brand-600">{getTotal().toLocaleString()} so'm</span>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-600 py-3.5 font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Yuborilmoqda...' : 'Buyurtmani tasdiqlash'}
        </button>
      </form>
    </div>
  );
}
