import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, getImageUrl } from '../api/axios';
import { useCartStore } from '../store/cartStore';
import { Skeleton } from '../components/Skeleton';
import { hasVariants, getVariantPrice } from '../utils/productPrice';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => {
        const p = res.data.data;
        setProduct(p);
        if (hasVariants(p)) {
          setSelectedVariant(p.variants[0]?.name || '');
        }
      })
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

  const withVariants = hasVariants(product);
  const price = withVariants
    ? getVariantPrice(product, selectedVariant)
    : (product.discountPrice ?? product.price);

  const handleAdd = () => {
    const ok = addItem(product, qty, selectedVariant);
    if (!ok) return;
    navigate('/cart');
  };

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
          {!withVariants && product.discountPrice && (
            <span className="text-gray-400 line-through">{product.price.toLocaleString()}</span>
          )}
        </div>
        {withVariants && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">O'lcham / variant</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.name}
                  type="button"
                  onClick={() => setSelectedVariant(v.name)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                    selectedVariant === v.name
                      ? 'border-brand-600 bg-brand-50 text-brand-600 dark:bg-brand-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <span>{v.name}</span>
                  <span className="ml-2 text-gray-500">{v.price.toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>
        )}
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
          disabled={!product.isAvailable || (withVariants && !selectedVariant)}
          onClick={handleAdd}
          className="w-full rounded-xl bg-brand-600 py-3.5 font-semibold text-white disabled:opacity-50"
        >
          Savatga qo'shish — {(price * qty).toLocaleString()} so'm
        </button>
      </div>
    </div>
  );
}
