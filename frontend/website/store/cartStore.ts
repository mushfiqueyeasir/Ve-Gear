import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  title: string;
  image: string;
  currentPrice: number;
  originalPrice: number;
  size: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  isItemInCart: (id: string, size: string) => boolean;
  getTotal: () => number;
  getItemCount: () => number;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { id, size, quantity = 1 } = item;
        const currentState = get();
        const existingItem = currentState.items.find(
          (i) => i.id === id && i.size === size,
        );

        if (existingItem) {
          set({
            ...currentState,
            items: currentState.items.map((i) =>
              i.id === id && i.size === size
                ? { ...i, quantity: i.quantity + quantity }
                : i,
            ),
          });
        } else {
          set({
            ...currentState,
            items: [...currentState.items, { ...item, quantity }],
          });
        }
      },

      removeItem: (id, size) => {
        const currentState = get();
        set({
          ...currentState,
          items: currentState.items.filter(
            (i) => !(i.id === id && i.size === size),
          ),
        });
      },

      updateQuantity: (id, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id, size);
          return;
        }

        const currentState = get();
        set({
          ...currentState,
          items: currentState.items.map((i) =>
            i.id === id && i.size === size ? { ...i, quantity } : i,
          ),
        });
      },

      isItemInCart: (id, size) => {
        return get().items.some((i) => i.id === id && i.size === size);
      },

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.currentPrice * item.quantity,
          0,
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      clearCart: () => {
        const currentState = get();
        set({ ...currentState, items: [] });
      },
    }),
    {
      name: "cart-storage",
    },
  ),
);
