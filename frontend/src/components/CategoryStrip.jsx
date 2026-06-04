import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getImageUrl } from '../api/axios';
import { CategorySkeleton } from './Skeleton';

export const CategoryStrip = ({ activeId }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/categories?active=true')
      .then((res) => setCategories(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
      <div className="flex gap-3 overflow-x-auto px-4 py-3 scrollbar-hide">
        {loading ? (
          Array(5)
            .fill(0)
            .map((_, i) => <CategorySkeleton key={i} />)
        ) : (
          categories.map((cat) => {
            const isActive = activeId === cat._id;
            return (
              <Link
                key={cat._id}
                to={`/categories/${cat._id}`}
                className={`flex shrink-0 flex-col items-center min-w-[72px] transition ${
                  isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <div
                  className={`h-14 w-14 overflow-hidden rounded-full border-2 ${
                    isActive
                      ? 'border-brand-600 ring-2 ring-brand-600/30'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {cat.image ? (
                    <img
                      src={getImageUrl(cat.image)}
                      alt={cat.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-brand-100 text-xl dark:bg-brand-900/30">
                      🍴
                    </div>
                  )}
                </div>
                <span
                  className={`mt-1 max-w-[72px] truncate text-center text-xs ${
                    isActive ? 'font-semibold text-brand-600' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {cat.title}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};
