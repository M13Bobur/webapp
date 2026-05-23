import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/axios';
import { Input, Pagination } from '../components/ui';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      const res = await api.get(`/customers?${params}`);
      setCustomers(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => load(1), 400);
    return () => clearTimeout(t);
  }, [search, load]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Mijozlar</h1>
      <Input placeholder="Qidirish..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 mb-6" />

      <div className="rounded-xl bg-white border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3">Ism</th>
              <th className="text-left px-4 py-3">Telefon</th>
              <th className="text-left px-4 py-3">Username</th>
              <th className="text-left px-4 py-3">Telegram ID</th>
              <th className="text-left px-4 py-3">Ro'yxatdan o'tgan</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center">Yuklanmoqda...</td></tr>
            ) : customers.map((c) => (
              <tr key={c._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.fullname || '—'}</td>
                <td className="px-4 py-3">{c.phone || '—'}</td>
                <td className="px-4 py-3">@{c.username || '—'}</td>
                <td className="px-4 py-3 font-mono text-xs">{c.telegramId}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(c.createdAt).toLocaleDateString('uz-UZ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={load} />
    </div>
  );
}
