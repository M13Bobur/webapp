import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/axios';
import { Card } from '../components/ui';
import { useOrderSocket } from '../hooks/useSocket';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const StatCard = ({ title, value, icon, color }) => (
  <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const res = await api.get('/orders/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);
  useOrderSocket(() => loadStats());

  if (loading) return <div className="p-8">Yuklanmoqda...</div>;

  const chartData = stats?.revenueChart?.map((d) => ({
    date: d._id?.slice(5) || d._id,
    revenue: d.revenue,
    orders: d.orders,
  })) || [];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Jami buyurtmalar" value={stats?.totalOrders || 0} icon="📦" color="text-blue-600" />
        <StatCard title="Bugungi buyurtmalar" value={stats?.todayOrders || 0} icon="📅" color="text-green-600" />
        <StatCard title="Jami daromad" value={`${(stats?.totalRevenue || 0).toLocaleString()} so'm`} icon="💰" color="text-orange-600" />
        <StatCard title="Faol mijozlar" value={stats?.activeCustomers || 0} icon="👥" color="text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="7 kunlik daromad">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(v) => `${v.toLocaleString()} so'm`} />
                <Bar dataKey="revenue" fill="#ea580c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Top mahsulotlar">
          <ul className="space-y-3">
            {(stats?.topProducts || []).map((p, i) => (
              <li key={p._id} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="flex items-center gap-2">
                  <span className="text-orange-600 font-bold">#{i + 1}</span>
                  {p.title}
                </span>
                <span className="text-sm text-gray-500">{p.orderCount} buyurtma</span>
              </li>
            ))}
            {!stats?.topProducts?.length && <p className="text-gray-500 text-sm">Ma'lumot yo'q</p>}
          </ul>
        </Card>
      </div>
    </div>
  );
}
