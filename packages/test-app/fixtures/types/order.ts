export interface OrderProduct {
  id: string;
  productId: string;
  snapshot: Record<string, unknown>;
  priceUsd: number;
}

export interface OrderEvent {
  id: string;
  eventType: { id: string; value: string };
  occurredAt: string;
}

export interface OrderExchangeRate {
  currency: { id: string; value: string };
  rate: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  paymentTerm: { id: string; value: string };
  currentStatus: { id: string; value: string } | null;
  estimatedDelivery: string;
  deliveryAddress: {
    name: string;
    street: string;
    city: string;
    state: string | null;
    postalCode: string | null;
    country: string;
  };
  shippingCost: number;
  vatAmount: number;
  finalPriceUsd: number;
  canTrack: boolean;
  canPayInvoice: boolean;
  products: OrderProduct[];
  events: OrderEvent[];
  exchangeRates: OrderExchangeRate[];
}
