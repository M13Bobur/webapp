import { Link } from 'react-router-dom';
import { getImageUrl } from '../api/axios';
import { useCartStore } from '../store/cartStore';
import { EmptyState } from '../components/EmptyState';

export default function Cart() {
  const { items, updateQuantity, removeItem, getTotal, getCount } = useCartStore();

  if (items.length === 0) {
    return (
      <EmptyState
        icon="🛒"
        title="Savat bo'sh"
        description="Menyudan taom tanlang"
        action={
          <Link to="/" className="rounded-xl bg-brand-600 px-6 py-2 text-white text-sm">
            Menyuga o'tish
          </Link>
        }
      />
    );
  }

  return (
    <div className="px-4 py-4 pb-32">
      <h1 className="text-xl font-bold mb-4">Savat ({getCount()})</h1>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item._id} className="flex gap-3 rounded-2xl bg-white dark:bg-gray-800 p-3 shadow-sm">
            <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              <img src={getImageUrl(item.image)} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{item.title}</h3>
              <p className="text-brand-600 font-semibold text-sm mt-0.5">
                {(item.price * item.quantity).toLocaleString()} so'm
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-600">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-2 py-1">−</button>
                  <span className="px-2 text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-2 py-1">+</button>
                </div>
                <button onClick={() => removeItem(item._id)} className="text-red-500 text-xs">O'chirish</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white/95 dark:bg-gray-900/95 border-t dark:border-gray-800">
        <div className="flex justify-between mb-3 font-semibold">
          <span>Jami</span>
          <span className="text-brand-600">{getTotal().toLocaleString()} so'm</span>
        </div>
        <Link
          to="/checkout"
          className="block w-full rounded-xl bg-brand-600 py-3.5 text-center font-semibold text-white"
        >
          Buyurtma berish
        </Link>
      </div>
    </div>
  );
}
