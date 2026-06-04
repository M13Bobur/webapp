import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getVariantPrice, hasVariants, makeCartLineId } from '../utils/productPrice';
import { useToastStore } from './toastStore';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, variantName = '') => {
        const vName = hasVariants(product) ? variantName : '';
        if (hasVariants(product) && !vName) {
          useToastStore.getState().show('Variant tanlang');
          return false;
        }

        const cartLineId = makeCartLineId(product._id, vName);
        const price = hasVariants(product) ? getVariantPrice(product, vName) : (product.discountPrice ?? product.price);
        const title = vName ? `${product.title} (${vName})` : product.title;

        const items = get().items;
        const existing = items.find((i) => i.cartLineId === cartLineId);

        if (existing) {
          set({
            items: items.map((i) =>
              i.cartLineId === cartLineId
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                _id: product._id,
                cartLineId,
                title,
                variantName: vName,
                price,
                image: product.images?.[0],
                quantity,
              },
            ],
          });
        }
        useToastStore.getState().show('Savatga qo\'shildi');
        return true;
      },

      removeItem: (cartLineId) => {
        set({ items: get().items.filter((i) => i.cartLineId !== cartLineId) });
      },

      updateQuantity: (cartLineId, quantity) => {
        if (quantity < 1) {
          get().removeItem(cartLineId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.cartLineId === cartLineId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'faiza-cart',
      migrate: (state) => {
        if (!state?.items) return state;
        return {
          ...state,
          items: state.items.map((i) => ({
            ...i,
            cartLineId: i.cartLineId || makeCartLineId(i._id, i.variantName || ''),
          })),
        };
      },
    }
  )
);
