import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, getImageUrl } from '../api/axios';
import { useCartStore } from '../store/cartStore';
import { Skeleton } from '../components/Skeleton';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => setProduct(res.data.data))
      .catch(() => navigate(-1))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="p-4">
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="mt-4 h-6 w-2/3" />
        <Skeleton className="mt-2 h-20 w-full" />
      </div>
    );
  }

  if (!product) return null;
  const price = product.discountPrice ?? product.price;

  return (
    <div className="pb-24">
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
        <img
          src={getImageUrl(product.images?.[0])}
          alt={product.title}
          className="h-full w-full object-cover"
        />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 rounded-full bg-white/90 p-2 shadow"
        >
          ←
        </button>
      </div>
      <div className="p-4">
        <h1 className="text-xl font-bold">{product.title}</h1>
        <p className="text-gray-500 mt-1 text-sm">{product.description || product.shortDescription}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-2xl font-bold text-brand-600">{price.toLocaleString()} so'm</span>
          {product.discountPrice && (
            <span className="text-gray-400 line-through">{product.price.toLocaleString()}</span>
          )}
        </div>
        {product.preparationTime && (
          <p className="text-sm text-gray-500 mt-2">⏱ ~{product.preparationTime} daqiqa</p>
        )}
        <div className="flex items-center gap-4 mt-6">
          <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-700">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2 text-lg">−</button>
            <span className="px-4 font-semibold">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="px-4 py-2 text-lg">+</button>
          </div>
        </div>
      </div>
      <div className="fixed bottom-20 left-0 right-0 p-4">
        <button
          disabled={!product.isAvailable}
          onClick={() => {
            addItem(product, qty);
            navigate('/cart');
          }}
          className="w-full rounded-xl bg-brand-600 py-3.5 font-semibold text-white disabled:opacity-50"
        >
          Savatga qo'shish — {(price * qty).toLocaleString()} so'm
        </button>
      </div>
    </div>
  );
}
