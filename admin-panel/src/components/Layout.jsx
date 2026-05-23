import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const nav = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/orders', label: 'Buyurtmalar', icon: '📦' },
  { to: '/products', label: 'Mahsulotlar', icon: '🍽' },
  { to: '/categories', label: 'Kategoriyalar', icon: '📂' },
  { to: '/customers', label: 'Mijozlar', icon: '👥' },
  { to: '/settings', label: 'Sozlamalar', icon: '⚙️' },
];

export const AdminLayout = () => {
  const navigate = useNavigate();
  const { admin, logout } = useAuthStore();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-sidebar text-white flex flex-col">
        <div className="p-6 border-b border-slate-600">
          <h1 className="text-xl font-bold">Faiza Cafe</h1>
          <p className="text-slate-400 text-sm">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                }`
              }
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-600">
          <p className="text-sm text-slate-400 truncate">{admin?.phone}</p>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="mt-2 text-sm text-red-400 hover:text-red-300"
          >
            Chiqish
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
