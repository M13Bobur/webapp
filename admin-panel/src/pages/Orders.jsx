import { useEffect, useState, useCallback } from 'react';
import { api, getImageUrl } from '../api/axios';
import { Button, Badge, Select, Input, Pagination, Modal } from '../components/ui';
import { useOrderSocket } from '../hooks/useSocket';

const OrderViewIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
    <line x1="8" y1="9" x2="10" y2="9" />
  </svg>
);

const getItemImage = (item) => (item.image ? getImageUrl(item.image) : '');

const statusOptions = [
  { value: '', label: 'Barcha holatlar' },
  { value: 'pending', label: 'Kutilmoqda' },
  { value: 'accepted', label: 'Qabul qilindi' },
  { value: 'preparing', label: 'Tayyorlanmoqda' },
  { value: 'delivering', label: 'Yetkazilmoqda' },
  { value: 'completed', label: 'Yakunlandi' },
  { value: 'cancelled', label: 'Bekor qilindi' },
];

const statusLabels = {
  pending: 'Kutilmoqda',
  accepted: 'Qabul qilindi',
  preparing: 'Tayyorlanmoqda',
  delivering: 'Yetkazilmoqda',
  completed: 'Yakunlandi',
  cancelled: 'Bekor qilindi',
};

const statusColors = {
  pending: 'yellow', accepted: 'blue', preparing: 'purple',
  delivering: 'blue', completed: 'green', cancelled: 'red',
};

const deliveryLabels = {
  pickup: { label: 'Olib ketish', color: 'purple', icon: '🏪' },
  delivery: { label: 'Yetkazib berish', color: 'blue', icon: '🚗' },
};

const nextStatuses = {
  pending: ['accepted', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['delivering', 'cancelled'],
  delivering: ['completed', 'cancelled'],
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const loadOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      const res = await api.get(`/orders?${params}`);
      setOrders(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => ({ ...f, search: searchInput })), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { loadOrders(1); }, [filters, loadOrders]);
  useOrderSocket(() => loadOrders(pagination.page));

  const updateStatus = async (id, status) => {
    await api.patch(`/orders/${id}/status`, { status });
    loadOrders(pagination.page);
    if (viewOrder?._id === id) {
      setViewOrder((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const delivery = viewOrder ? deliveryLabels[viewOrder.deliveryType] : null;

  const openOrderView = async (order) => {
    setViewOrder(order);
    setViewLoading(true);
    try {
      const res = await api.get(`/orders/${order._id}`);
      setViewOrder(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setViewLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Buyurtmalar</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Buyurtma raqami yoki telefon..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-64"
        />
        <Select
          options={statusOptions}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="w-48"
        />
      </div>

      <div className="rounded-xl bg-white shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">№</th>
              <th className="text-left px-4 py-3 font-medium">Mijoz</th>
              <th className="text-left px-4 py-3 font-medium">Yetkazish</th>
              <th className="text-left px-4 py-3 font-medium">Jami</th>
              <th className="text-left px-4 py-3 font-medium">Holat</th>
              <th className="text-left px-4 py-3 font-medium">Vaqt</th>
              <th className="text-left px-4 py-3 font-medium">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Yuklanmoqda...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Buyurtmalar yo'q</td></tr>
            ) : orders.map((order) => {
              const d = deliveryLabels[order.deliveryType] || deliveryLabels.delivery;
              return (
                <tr key={order._id} className="border-b hover:bg-gray-50 relative">
                  <td className="px-4 py-3 font-mono text-xs">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.customerId?.fullname || '—'}</p>
                    <p className="text-gray-500 text-xs">{order.phone}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{order.items.length} ta mahsulot</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={d.color}>{d.icon} {d.label}</Badge>
                    {order.deliveryType === 'delivery' && order.address && (
                      <p className="text-xs text-gray-500 mt-1 max-w-[180px] truncate" title={order.address}>
                        {order.address}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold">{order.totalPrice.toLocaleString()} so'm</td>
                  <td className="px-4 py-3">
                    <Badge color={statusColors[order.status]}>{statusLabels[order.status] || order.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleString('uz-UZ')}
                  </td>
                  <td className="px-4 py-3 pr-14">
                    <div className="flex flex-wrap gap-1">
                      {(nextStatuses[order.status] || []).map((s) => (
                        <Button key={s} variant="secondary" className="!px-2 !py-1 text-xs" onClick={() => updateStatus(order._id, s)}>
                          {statusLabels[s] || s}
                        </Button>
                      ))}
                    </div>
                  </td>
                  <button
                    type="button"
                    title="Buyurtmani ko'rish"
                    onClick={() => openOrderView(order)}
                    className="absolute top-2 right-2 z-10 flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-orange-600 shadow-sm transition hover:border-orange-300 hover:bg-orange-50"
                  >
                    <OrderViewIcon />
                  </button>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={loadOrders}
      />

      <Modal
        wide
        open={!!viewOrder}
        onClose={() => setViewOrder(null)}
        title={viewOrder ? `Buyurtma ${viewOrder.orderNumber}` : ''}
      >
        {viewOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Mijoz</p>
                <p className="font-medium">{viewOrder.customerId?.fullname || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Telefon</p>
                <p className="font-medium">{viewOrder.phone}</p>
              </div>
              <div>
                <p className="text-gray-500">Holat</p>
                <Badge color={statusColors[viewOrder.status]}>
                  {statusLabels[viewOrder.status] || viewOrder.status}
                </Badge>
              </div>
              <div>
                <p className="text-gray-500">Vaqt</p>
                <p className="font-medium">{new Date(viewOrder.createdAt).toLocaleString('uz-UZ')}</p>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-3 text-sm">
              <p className="text-gray-500 mb-1">Yetkazish turi</p>
              <p className="font-medium">
                {delivery?.icon} {delivery?.label}
              </p>
              {viewOrder.deliveryType === 'delivery' && viewOrder.address && (
                <p className="mt-2 text-gray-700">
                  <span className="text-gray-500">Manzil: </span>
                  {viewOrder.address}
                </p>
              )}
              {viewOrder.comment && (
                <p className="mt-2 text-gray-700">
                  <span className="text-gray-500">Izoh: </span>
                  {viewOrder.comment}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Buyurtma qilingan mahsulotlar</p>
              {viewLoading ? (
                <p className="text-sm text-gray-500 py-4 text-center">Yuklanmoqda...</p>
              ) : (
              <div className="space-y-4">
                {viewOrder.items.map((item, idx) => {
                  const img = getItemImage(item);
                  return (
                    <div
                      key={idx}
                      className="flex gap-5 rounded-xl border border-gray-200 bg-gray-50/50 p-4"
                    >
                      <div className="w-36 shrink-0">
                        <div className="h-36 w-36 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                          {img ? (
                            <img
                              src={img}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-400">
                              Rasm yo&apos;q
                            </div>
                          )}
                        </div>
                        <p className="mt-2 text-sm font-semibold text-gray-900 leading-snug">
                          {item.title}
                        </p>
                      </div>
                      <div className="flex min-h-[9rem] flex-1 flex-col items-end justify-between py-1">
                        <p className="text-4xl font-bold leading-none text-gray-800">
                          ×{item.quantity}
                        </p>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {item.price.toLocaleString()} so&apos;m / dona
                          </p>
                          <p className="mt-0.5 text-sm font-medium text-orange-600">
                            {(item.price * item.quantity).toLocaleString()} so&apos;m
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
              <div className="mt-4 flex justify-between rounded-xl bg-orange-50 px-4 py-3 font-semibold">
                <span>Jami</span>
                <span className="text-lg text-orange-600">
                  {viewOrder.totalPrice.toLocaleString()} so&apos;m
                </span>
              </div>
            </div>

            {(nextStatuses[viewOrder.status] || []).length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {(nextStatuses[viewOrder.status] || []).map((s) => (
                  <Button
                    key={s}
                    variant="secondary"
                    className="text-xs"
                    onClick={() => updateStatus(viewOrder._id, s)}
                  >
                    {statusLabels[s] || s}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
