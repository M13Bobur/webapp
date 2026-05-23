import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/axios';
import { Button, Badge, Select, Input, Pagination } from '../components/ui';
import { useOrderSocket } from '../hooks/useSocket';

const statusOptions = [
  { value: '', label: 'Barcha holatlar' },
  { value: 'pending', label: 'Kutilmoqda' },
  { value: 'accepted', label: 'Qabul qilindi' },
  { value: 'preparing', label: 'Tayyorlanmoqda' },
  { value: 'delivering', label: 'Yetkazilmoqda' },
  { value: 'completed', label: 'Yakunlandi' },
  { value: 'cancelled', label: 'Bekor qilindi' },
];

const statusColors = {
  pending: 'yellow', accepted: 'blue', preparing: 'purple',
  delivering: 'blue', completed: 'green', cancelled: 'red',
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
              <th className="text-left px-4 py-3 font-medium">Mahsulotlar</th>
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
            ) : orders.map((order) => (
              <tr key={order._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{order.orderNumber}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{order.customerId?.fullname || '—'}</p>
                  <p className="text-gray-500 text-xs">{order.phone}</p>
                </td>
                <td className="px-4 py-3 max-w-xs">
                  {order.items.map((i, idx) => (
                    <span key={idx} className="block text-xs">{i.title} ×{i.quantity}</span>
                  ))}
                </td>
                <td className="px-4 py-3 font-semibold">{order.totalPrice.toLocaleString()} so'm</td>
                <td className="px-4 py-3">
                  <Badge color={statusColors[order.status]}>{order.status}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleString('uz-UZ')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(nextStatuses[order.status] || []).map((s) => (
                      <Button key={s} variant="secondary" className="!px-2 !py-1 text-xs" onClick={() => updateStatus(order._id, s)}>
                        {s}
                      </Button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={loadOrders}
      />
    </div>
  );
}
