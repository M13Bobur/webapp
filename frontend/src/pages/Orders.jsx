import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { EmptyState } from '../components/EmptyState';
import { Skeleton } from '../components/Skeleton';

const statusLabels = {
  pending: { label: 'Kutilmoqda', color: 'bg-yellow-100 text-yellow-800' },
  accepted: { label: 'Qabul qilindi', color: 'bg-blue-100 text-blue-800' },
  preparing: { label: 'Tayyorlanmoqda', color: 'bg-purple-100 text-purple-800' },
  delivering: { label: 'Yetkazilmoqda', color: 'bg-indigo-100 text-indigo-800' },
  completed: { label: 'Yakunlandi', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Bekor qilindi', color: 'bg-red-100 text-red-800' },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my')
      .then((res) => setOrders(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
      </div>
    );
  }

  if (orders.length === 0) {
    return <EmptyState icon="📋" title="Buyurtmalar yo'q" description="Birinchi buyurtmangizni bering!" />;
  }

  return (
    <div className="px-4 py-4">
      <h1 className="text-xl font-bold mb-4">Mening buyurtmalarim</h1>
      <div className="space-y-3">
        {orders.map((order) => {
          const status = statusLabels[order.status] || statusLabels.pending;
          return (
            <div key={order._id} className="rounded-2xl bg-white dark:bg-gray-800 p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(order.createdAt).toLocaleString('uz-UZ')}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <ul className="mt-3 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.title} × {item.quantity}
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-bold text-brand-600">
                {order.totalPrice.toLocaleString()} so'm
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
