import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getImageUrl } from '../api/axios';
import { ProductCard } from '../components/ProductCard';
import { ProductSkeleton, CategorySkeleton } from '../components/Skeleton';
import { useTelegram } from '../hooks/useTelegram';

export default function Home() {
  const { user } = useTelegram();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories?active=true'),
          api.get('/products/top?limit=6'),
        ]);
        setCategories(catRes.data.data || []);
        setProducts(prodRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSearch = async (q) => {
    setSearch(q);
    if (!q.trim()) {
      const res = await api.get('/products/top?limit=6');
      setProducts(res.data.data || []);
      return;
    }
    const res = await api.get(`/products/search?search=${encodeURIComponent(q)}&limit=12`);
    setProducts(res.data.data || []);
  };

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur dark:bg-gray-900/95 px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <h1 className="text-xl font-bold text-brand-600">Faiza Cafe 🍽</h1>
        <p className="text-sm text-gray-500">
          {user ? `Salom, ${user.first_name}!` : 'An\'anaviy o\'zbek taomlari'}
        </p>
        <input
          type="search"
          placeholder="Taom qidirish..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="mt-3 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </header>

      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Kategoriyalar</h2>
          <Link to="/categories" className="text-sm text-brand-600">Barchasi</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {loading
            ? Array(5).fill(0).map((_, i) => <CategorySkeleton key={i} />)
            : categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/categories/${cat._id}`}
                  className="flex flex-col items-center min-w-[72px]"
                >
                  <div className="h-16 w-16 rounded-full overflow-hidden bg-brand-100 dark:bg-brand-900/30 border-2 border-brand-200">
                    {cat.image ? (
                      <img src={getImageUrl(cat.image)} alt={cat.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl">🍴</div>
                    )}
                  </div>
                  <span className="text-xs mt-1 text-center line-clamp-1">{cat.title}</span>
                </Link>
              ))}
        </div>
      </section>

      <section className="px-4 pb-4">
        <h2 className="font-semibold mb-3">{search ? 'Qidiruv natijalari' : 'Mashhur taomlar'}</h2>
        <div className="grid grid-cols-2 gap-3">
          {loading
            ? Array(4).fill(0).map((_, i) => <ProductSkeleton key={i} />)
            : products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
        {!loading && products.length === 0 && (
          <p className="text-center text-gray-500 py-8">Hech narsa topilmadi</p>
        )}
      </section>
    </div>
  );
}
