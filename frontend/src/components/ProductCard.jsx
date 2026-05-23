import { Link } from 'react-router-dom';
import { getImageUrl } from '../api/axios';
import { useCartStore } from '../store/cartStore';

const badgeColors = {
  new: 'bg-green-500',
  hot: 'bg-red-500',
  popular: 'bg-purple-500',
};

export const ProductCard = ({ product }) => {
  const addItem = useCartStore((s) => s.addItem);
  const price = product.discountPrice ?? product.price;

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
      <Link to={`/products/${product._id}`}>
        <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-700">
          <img
            src={getImageUrl(product.images?.[0])}
            alt={product.title}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f3f4f6" width="100" height="100"/><text x="50" y="55" text-anchor="middle" font-size="30">🍽</text></svg>';
            }}
          />
          {product.badges?.map((b) => (
            <span
              key={b}
              className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white uppercase ${badgeColors[b] || 'bg-gray-500'}`}
            >
              {b}
            </span>
          ))}
          {!product.isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-white text-sm font-medium">Mavjud emas</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-3">
        <Link to={`/products/${product._id}`}>
          <h3 className="font-semibold text-sm line-clamp-1">{product.title}</h3>
          {product.shortDescription && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{product.shortDescription}</p>
          )}
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="font-bold text-brand-600">{price.toLocaleString()} so'm</span>
            {product.discountPrice && (
              <span className="ml-1 text-xs text-gray-400 line-through">
                {product.price.toLocaleString()}
              </span>
            )}
          </div>
          <button
            disabled={!product.isAvailable}
            onClick={() => addItem(product)}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};
