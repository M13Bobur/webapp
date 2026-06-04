import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const { admin, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebar = (
    <>
      <div className="p-5 border-b border-slate-600">
        <h1 className="text-lg font-bold sm:text-xl">Faiza Cafe</h1>
        <p className="text-slate-400 text-sm">Admin Panel</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {nav.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                isActive ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`
            }
          >
            <span className="text-lg">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-600">
        <p className="text-sm text-slate-400 truncate">{admin?.phone}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 text-sm text-red-400 hover:text-red-300"
        >
          Chiqish
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100 lg:flex">
      {menuOpen && (
        <button
          type="button"
          aria-label="Menyuni yopish"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(100vw-3rem,18rem)] flex-col bg-sidebar text-white shadow-xl transition-transform duration-200 lg:static lg:z-auto lg:w-64 lg:translate-x-0 lg:shadow-none ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebar}
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-xl"
            aria-label="Menyu"
          >
            ☰
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-sm font-semibold text-gray-900">Faiza Cafe</p>
            <p className="truncate text-xs text-gray-500">
              {nav.find((n) => (n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to)))?.label || 'Admin'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs font-medium text-red-600 shrink-0"
          >
            Chiqish
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
