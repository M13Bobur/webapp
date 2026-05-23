import { NavLink } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

const links = [
  { to: '/', label: 'Bosh', icon: '🏠' },
  { to: '/categories', label: 'Kategoriya', icon: '📂' },
  { to: '/cart', label: 'Savat', icon: '🛒' },
  { to: '/orders', label: 'Buyurtmalar', icon: '📋' },
];

export const BottomNav = () => {
  const count = useCartStore((s) => s.getCount());

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 safe-bottom">
      <div className="flex justify-around py-2">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center px-3 py-1 text-xs transition-colors ${
                isActive ? 'text-brand-600' : 'text-gray-500 dark:text-gray-400'
              }`
            }
          >
            <span className="relative text-xl">
              {icon}
              {to === '/cart' && count > 0 && (
                <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] text-white">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </span>
            <span className="mt-0.5">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
