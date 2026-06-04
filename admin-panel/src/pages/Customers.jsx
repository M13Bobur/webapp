import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/axios';
import { Input, Pagination, PageShell } from '../components/ui';

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
    <PageShell title="Mijozlar">
      <Input
        placeholder="Qidirish..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full sm:mb-6 sm:w-64"
      />

      <div className="space-y-3 md:hidden">
        {loading ? (
          <p className="py-8 text-center text-gray-500">Yuklanmoqda...</p>
        ) : customers.length === 0 ? (
          <p className="py-8 text-center text-gray-500">Mijozlar yo&apos;q</p>
        ) : (
          customers.map((c) => (
            <div key={c._id} className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="font-semibold">{c.fullname || '—'}</p>
              <p className="mt-1 text-sm text-gray-600">{c.phone || '—'}</p>
              {c.username && <p className="text-sm text-gray-500">@{c.username}</p>}
              <p className="mt-2 font-mono text-xs text-gray-400">ID: {c.telegramId}</p>
              <p className="mt-1 text-xs text-gray-400">
                {new Date(c.createdAt).toLocaleDateString('uz-UZ')}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-hidden rounded-xl border bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Ism</th>
                <th className="px-4 py-3 text-left">Telefon</th>
                <th className="px-4 py-3 text-left">Username</th>
                <th className="px-4 py-3 text-left">Telegram ID</th>
                <th className="px-4 py-3 text-left">Ro&apos;yxatdan o&apos;tgan</th>
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
      </div>
      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={load} />
    </PageShell>
  );
}
