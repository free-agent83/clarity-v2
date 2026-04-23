import { create } from "zustand";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  certLab: string | null;
  certNumber: string | null;
  stockId: string;
  price: number;
  discount: number | null;
  image: string | null;
  category: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isSheetOpen: boolean;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (productId: string) => void;
  openSheet: () => void;
  closeSheet: () => void;
  toggleSheet: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isSheetOpen: false,

  addItem: (item) => {
    const existing = get().items.find((i) => i.productId === item.productId);
    if (existing) {
      // Stone products are unique — don't add duplicates, just open the sheet
      set({ isSheetOpen: true });
      return;
    }
    set((state) => ({
      items: [...state.items, { ...item, id: crypto.randomUUID() }],
      isSheetOpen: true,
    }));
  },

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    })),

  openSheet: () => set({ isSheetOpen: true }),
  closeSheet: () => set({ isSheetOpen: false }),
  toggleSheet: () => set((state) => ({ isSheetOpen: !state.isSheetOpen })),
}));
