import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getImageUrl } from '../api/axios';
import { CategorySkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories?active=true')
      .then((res) => setCategories(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-4 py-4">
      <h1 className="text-xl font-bold mb-4">Kategoriyalar</h1>
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <CategorySkeleton key={i} />)}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState title="Kategoriyalar yo'q" description="Tez orada qo'shiladi" />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/categories/${cat._id}`}
              className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
            >
              <div className="aspect-video bg-gray-100 dark:bg-gray-700">
                {cat.image ? (
                  <img src={getImageUrl(cat.image)} alt={cat.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl">🍴</div>
                )}
              </div>
              <p className="p-3 font-semibold text-sm">{cat.title}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
