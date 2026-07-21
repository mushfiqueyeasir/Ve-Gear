import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  id: string;
  title: string;
  image: string;
  href: string;
  currentPrice: number;
  originalPrice: number;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: WishlistItem) => boolean;
  isFavorite: (id: string) => boolean;
  getItemCount: () => number;
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        if (get().items.some((i) => i.id === item.id)) return;
        set({ items: [...get().items, item] });
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      toggleItem: (item) => {
        const exists = get().items.some((i) => i.id === item.id);
        if (exists) {
          set({ items: get().items.filter((i) => i.id !== item.id) });
          return false;
        }
        set({ items: [...get().items, item] });
        return true;
      },

      isFavorite: (id) => get().items.some((i) => i.id === id),

      getItemCount: () => get().items.length,

      clear: () => set({ items: [] }),
    }),
    {
      name: "wishlist-storage",
    },
  ),
);
