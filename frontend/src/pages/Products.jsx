import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/axios';
import { ProductCard } from '../components/ProductCard';
import { ProductSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';

export default function Products() {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadProducts = async (pageNum = 1, append = false) => {
    try {
      const res = await api.get(`/products/category/${categoryId}?page=${pageNum}&limit=12`);
      const newProducts = res.data.data || [];
      setProducts((prev) => (append ? [...prev, ...newProducts] : newProducts));
      setHasMore(res.data.pagination?.hasNext || false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setPage(1);
    api.get(`/categories/${categoryId}`).then((res) => setCategory(res.data.data)).catch(() => {});
    loadProducts(1);
  }, [categoryId]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    loadProducts(next, true);
  };

  return (
    <div className="px-4 py-4">
      <h1 className="text-xl font-bold mb-4">{category?.title || 'Mahsulotlar'}</h1>
      {loading && products.length === 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {Array(4).fill(0).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <EmptyState title="Mahsulotlar yo'q" icon="🍽" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
          {hasMore && (
            <button
              onClick={loadMore}
              className="mt-4 w-full rounded-xl border border-brand-600 py-2 text-brand-600 text-sm font-medium"
            >
              Ko'proq yuklash
            </button>
          )}
        </>
      )}
    </div>
  );
}
