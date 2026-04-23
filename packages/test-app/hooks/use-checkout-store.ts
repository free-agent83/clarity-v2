import { create } from "zustand";

import { useCartStore } from "@/hooks/use-cart-store";

/* ── Mock data ─────────────────────────────────────────────── */

export const MOCK_PAYMENT_TERMS = [
  {
    id: "pt-3-days",
    name: "Pay in 3 days",
    badge: "1.4% DISCOUNT + TAX",
    discountPercent: 1.4,
    description: "Invoice issued after shipping",
    steps: [
      "Our team confirms your order, usually within 48 hours",
      "If applicable, jewelry items are manufactured",
      "All items are quality controlled before shipping",
      "We ship your order and issue an invoice",
      "You have 3 days to pay the invoice",
    ],
  },
  {
    id: "pt-30-days",
    name: "Pay in 30 days",
    badge: null,
    discountPercent: 0,
    description: "Invoice issued after shipping",
    steps: [
      "Our team confirms your order, usually within 48 hours",
      "If applicable, jewelry items are manufactured",
      "All items are quality controlled before shipping",
      "We ship your order and issue an invoice",
      "You have 30 days to pay the invoice",
    ],
  },
  {
    id: "pt-60-days",
    name: "Pay in 60 days",
    badge: "1.4% FEE + TAX",
    discountPercent: -1.4,
    description: "Invoice issued after shipping",
    steps: [
      "Our team confirms your order, usually within 48 hours",
      "If applicable, jewelry items are manufactured",
      "All items are quality controlled before shipping",
      "We ship your order and issue an invoice",
      "You have 60 days to pay the invoice",
    ],
  },
  {
    id: "pt-upfront",
    name: "Upfront payment",
    badge: "1.4% DISCOUNT + TAX",
    discountPercent: 1.4,
    description: "Shipping after confirmed payment",
    steps: [
      "Our team confirms your order, usually within 48 hours",
      "We issue an invoice for upfront payment",
      "If applicable, jewelry items are manufactured",
      "All items are quality controlled before shipping",
      "We ship your order after payment is confirmed",
    ],
  },
] as const;

export type PaymentTerm = (typeof MOCK_PAYMENT_TERMS)[number];

export const CREDIT_LIMIT = 10_000;
export const CREDIT_USED_BEFORE = 5_000;
export const MOCK_DISCOUNT_CODE = "DEMO10";
export const MOCK_DISCOUNT_PERCENT = 10;

export const DEFAULT_QC_REQUIREMENTS =
  "Flag any BGM or not eye clean stones to us";

/* ── Address type (for locally-added addresses) ────────────── */

export type LocalAddress = {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  countryName: string;
  isDefault: boolean;
};

/* ── Store ─────────────────────────────────────────────────── */

type CheckoutStep = 1 | 2 | 3 | 4;

interface CheckoutState {
  // Navigation
  step: CheckoutStep;
  completedSteps: Set<number>;

  // Step 1 — Review & notes
  generalNotes: string;
  itemNotes: Record<string, { reference: string; notes: string }>;

  // Step 2 — Delivery
  deliveryMode: "single" | "multiple";
  selectedAddressId: string | null;
  perItemAddressId: Record<string, string>;
  localAddresses: LocalAddress[];

  // Step 3 — Payment
  selectedPaymentTermId: string;
  savePaymentPreference: boolean;

  // Discount
  discountCode: string;
  appliedDiscount: { code: string; percent: number } | null;

  // QC
  qcRequirements: string;

  // Confirmation guard
  orderJustPlaced: boolean;
}

interface CheckoutActions {
  setStep: (step: CheckoutStep) => void;
  completeStep: (step: number) => void;

  setGeneralNotes: (notes: string) => void;
  setItemNote: (
    productId: string,
    field: "reference" | "notes",
    value: string,
  ) => void;
  removeItemNote: (productId: string) => void;

  setDeliveryMode: (mode: "single" | "multiple") => void;
  setSelectedAddressId: (id: string | null) => void;
  setPerItemAddressId: (productId: string, addressId: string) => void;
  addLocalAddress: (address: LocalAddress) => void;

  setSelectedPaymentTermId: (id: string) => void;
  setSavePaymentPreference: (save: boolean) => void;

  applyDiscountCode: (code: string) => boolean;
  clearDiscount: () => void;
  setDiscountCode: (code: string) => void;

  setQcRequirements: (requirements: string) => void;

  placeOrder: () => void;
  clearOrderJustPlaced: () => void;
  reset: () => void;
}

type CheckoutStore = CheckoutState & CheckoutActions;

const initialState: CheckoutState = {
  step: 1,
  completedSteps: new Set(),
  generalNotes: "",
  itemNotes: {},
  deliveryMode: "single",
  selectedAddressId: null,
  perItemAddressId: {},
  localAddresses: [],
  selectedPaymentTermId: MOCK_PAYMENT_TERMS[0].id,
  savePaymentPreference: false,
  discountCode: "",
  appliedDiscount: null,
  qcRequirements: DEFAULT_QC_REQUIREMENTS,
  orderJustPlaced: false,
};

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  completeStep: (step) =>
    set((s) => ({
      completedSteps: new Set([...s.completedSteps, step]),
    })),

  setGeneralNotes: (generalNotes) => set({ generalNotes }),
  setItemNote: (productId, field, value) =>
    set((s) => ({
      itemNotes: {
        ...s.itemNotes,
        [productId]: {
          reference: s.itemNotes[productId]?.reference ?? "",
          notes: s.itemNotes[productId]?.notes ?? "",
          [field]: value,
        },
      },
    })),
  removeItemNote: (productId) =>
    set((s) => {
      const { [productId]: _, ...rest } = s.itemNotes;
      return { itemNotes: rest };
    }),

  setDeliveryMode: (deliveryMode) => set({ deliveryMode }),
  setSelectedAddressId: (selectedAddressId) => set({ selectedAddressId }),
  setPerItemAddressId: (productId, addressId) =>
    set((s) => ({
      perItemAddressId: { ...s.perItemAddressId, [productId]: addressId },
    })),
  addLocalAddress: (address) =>
    set((s) => ({
      localAddresses: [...s.localAddresses, address],
    })),

  setSelectedPaymentTermId: (selectedPaymentTermId) =>
    set({ selectedPaymentTermId }),
  setSavePaymentPreference: (savePaymentPreference) =>
    set({ savePaymentPreference }),

  setDiscountCode: (discountCode) => set({ discountCode }),
  applyDiscountCode: (code) => {
    if (code.toUpperCase() === MOCK_DISCOUNT_CODE) {
      set({
        appliedDiscount: {
          code: MOCK_DISCOUNT_CODE,
          percent: MOCK_DISCOUNT_PERCENT,
        },
        discountCode: "",
      });
      return true;
    }
    return false;
  },
  clearDiscount: () => set({ appliedDiscount: null }),

  setQcRequirements: (qcRequirements) => set({ qcRequirements }),

  placeOrder: () => {
    useCartStore.getState().items.forEach((item) => {
      useCartStore.getState().removeItem(item.productId);
    });
    set({ ...initialState, orderJustPlaced: true });
  },
  clearOrderJustPlaced: () => set({ orderJustPlaced: false }),
  reset: () => set(initialState),
}));

/* ── Derived selectors ─────────────────────────────────────── */

export function useCheckoutSubtotal() {
  const items = useCartStore((s) => s.items);
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function useCheckoutPaymentTerm() {
  const id = useCheckoutStore((s) => s.selectedPaymentTermId);
  return MOCK_PAYMENT_TERMS.find((t) => t.id === id) ?? MOCK_PAYMENT_TERMS[0];
}
