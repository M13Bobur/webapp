import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import { useCartStore } from '../store/cartStore';
import { useTelegram } from '../hooks/useTelegram';

const formatPhoneDisplay = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('998')) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
  }
  return phone;
};

const PhoneOption = ({ checked, onSelect, title, subtitle, disabled }) => (
  <button
    type="button"
    role="radio"
    aria-checked={checked}
    disabled={disabled}
    onClick={onSelect}
    className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
      disabled
        ? 'cursor-not-allowed opacity-50'
        : checked
          ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600/30 dark:bg-brand-900/20'
          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 active:scale-[0.99]'
    }`}
  >
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
        checked ? 'border-brand-600 bg-brand-600' : 'border-gray-300 dark:border-gray-600'
      }`}
    >
      {checked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium">{title}</p>
      {subtitle && <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
    </div>
  </button>
);

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { tg } = useTelegram();
  const otherPhoneRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(true);
  const [userPhone, setUserPhone] = useState('');
  const [phoneMode, setPhoneMode] = useState('own');
  const [otherPhone, setOtherPhone] = useState('');
  const [form, setForm] = useState({
    address: '',
    comment: '',
    deliveryType: 'delivery',
  });

  useEffect(() => {
    api
      .get('/customers/me')
      .then((res) => {
        const phone = res.data.data?.phone || '';
        setUserPhone(phone);
        setPhoneMode(phone ? 'own' : 'other');
      })
      .catch(() => setPhoneMode('other'))
      .finally(() => setPhoneLoading(false));
  }, []);

  const selectPhoneMode = (mode) => {
    setPhoneMode(mode);
    tg?.HapticFeedback?.selectionChanged?.();
    if (mode === 'other') {
      requestAnimationFrame(() => otherPhoneRef.current?.focus());
    }
  };

  const orderPhone = phoneMode === 'own' ? userPhone : otherPhone.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderPhone) {
      tg?.showAlert?.(
        phoneMode === 'own'
          ? 'Profil telefon raqami topilmadi. Boshqa raqamni tanlang.'
          : 'Telefon raqamni kiriting'
      );
      return;
    }
    setLoading(true);
    try {
      await api.post('/orders', {
        items: items.map((i) => ({ productId: i._id, quantity: i.quantity })),
        phone: orderPhone,
        address: form.address,
        comment: form.comment,
        deliveryType: form.deliveryType,
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
        <fieldset>
          <legend className="text-sm text-gray-500">Aloqa telefoni *</legend>
          {phoneLoading ? (
            <div className="mt-2 space-y-2">
              <div className="h-[72px] animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
              <div className="h-[72px] animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              <PhoneOption
                checked={phoneMode === 'own'}
                disabled={!userPhone}
                onSelect={() => userPhone && selectPhoneMode('own')}
                title="Mening raqamim"
                subtitle={
                  userPhone
                    ? formatPhoneDisplay(userPhone)
                    : 'Botda telefon ulashing, keyin qayta urinib ko\'ring'
                }
              />
              <PhoneOption
                checked={phoneMode === 'other'}
                onSelect={() => selectPhoneMode('other')}
                title="Boshqa raqam"
                subtitle="Boshqa raqam kiritish"
              />
              {phoneMode === 'other' && (
                <input
                  ref={otherPhoneRef}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={otherPhone}
                  onChange={(e) => setOtherPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
                />
              )}
            </div>
          )}
        </fieldset>

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
          disabled={loading || phoneLoading}
          className="w-full rounded-xl bg-brand-600 py-3.5 font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Yuborilmoqda...' : 'Buyurtmani tasdiqlash'}
        </button>
      </form>
    </div>
  );
}
