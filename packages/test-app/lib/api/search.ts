import { NATURAL_DIAMONDS } from "@/fixtures/products/natural-diamonds";
import { LAB_GROWN_DIAMONDS } from "@/fixtures/products/lab-grown-diamonds";
import { GEMSTONES } from "@/fixtures/products/gemstones";
import { NATURAL_MELEE } from "@/fixtures/products/natural-melee";
import { LAB_GROWN_MELEE } from "@/fixtures/products/lab-grown-melee";
import { ENGAGEMENT_RINGS } from "@/fixtures/products/engagement-rings";
import { ORDERS } from "@/fixtures/orders";
import { simulateLatency } from "./_simulate";
import type { ServerPaginationParams } from "./helpers";

const CATEGORY_LABELS: Record<string, string> = {
  natural_diamond: "Natural Diamond",
  lab_grown_diamond: "Lab Grown Diamond",
  gemstone: "Gemstone",
  natural_melee: "Natural Melee",
  lab_grown_melee: "Lab Grown Melee",
  engagement_ring: "Engagement Ring",
};

export interface SuggestProduct {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  image: string;
}

export interface SuggestOrder {
  id: string;
  title: string;
  status: string;
}

export interface SuggestResult {
  products: SuggestProduct[];
  orders: SuggestOrder[];
}

function matchesQuery(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

function allProducts(): Array<{ id: string; description: string; category: string; price: number; image: string }> {
  return [
    ...NATURAL_DIAMONDS.map((d) => ({ id: d.id, description: d.description, category: "natural_diamond", price: d.price, image: d.images.main })),
    ...LAB_GROWN_DIAMONDS.map((d) => ({ id: d.id, description: d.description, category: "lab_grown_diamond", price: d.price, image: d.images.main })),
    ...GEMSTONES.map((g) => ({ id: g.id, description: g.description, category: "gemstone", price: g.price, image: g.images.main })),
    ...NATURAL_MELEE.map((m) => ({ id: m.id, description: m.description, category: "natural_melee", price: m.totalPrice, image: m.images.main })),
    ...LAB_GROWN_MELEE.map((m) => ({ id: m.id, description: m.description, category: "lab_grown_melee", price: m.totalPrice, image: m.images.main })),
    ...ENGAGEMENT_RINGS.map((r) => ({
      id: r.id,
      description: r.description,
      category: "engagement_ring",
      price: r.availableMetals.length ? Math.min(...r.availableMetals.map((m) => m.priceUsd)) : 0,
      image: r.images.find((img) => img.isThumbnail)?.url ?? r.images[0]?.url ?? "",
    })),
  ];
}

export async function searchSuggest(
  query: string,
  _userId: string | null,
  limit: number = 8,
): Promise<SuggestResult> {
  await simulateLatency();

  const matchedProducts = allProducts()
    .filter((p) => matchesQuery(p.description, query))
    .slice(0, limit)
    .map((p) => {
      const category = CATEGORY_LABELS[p.category] ?? p.category;
      return {
        id: p.id,
        title: p.description,
        subtitle: `${category} — $${p.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        category,
        image: p.image,
      };
    });

  const matchedOrders = ORDERS
    .filter((o) => matchesQuery(o.orderNumber, query))
    .slice(0, limit)
    .map((o) => ({
      id: o.id,
      title: `Order ${o.orderNumber}`,
      status: o.currentStatus?.value ?? "",
    }));

  return { products: matchedProducts, orders: matchedOrders };
}

export interface SearchFullResult {
  items: Array<{
    resultType: "product" | "order";
    data: Record<string, unknown>;
  }>;
  totalItems: number;
}

export async function searchFull(
  query: string,
  _userId: string | null,
  type: "all" | "products" | "orders",
  pagination: ServerPaginationParams,
): Promise<SearchFullResult> {
  await simulateLatency();

  const includeProducts = type === "all" || type === "products";
  const includeOrders = type === "all" || type === "orders";

  const matchedProducts = includeProducts
    ? allProducts().filter((p) => matchesQuery(p.description, query))
    : [];

  const matchedOrders = includeOrders
    ? ORDERS.filter((o) => matchesQuery(o.orderNumber, query))
    : [];

  const productItems = matchedProducts.map((p) => {
    const cv = p.category;
    return {
      resultType: "product" as const,
      data: {
        id: p.id,
        description: p.description,
        productType: cv,
        category: CATEGORY_LABELS[cv] ?? cv,
        priceUsd: p.price,
        image: p.image,
      },
    };
  });

  const orderItems = matchedOrders.map((o) => ({
    resultType: "order" as const,
    data: {
      id: o.id,
      orderNumber: o.orderNumber,
      currentStatus: o.currentStatus?.value ?? null,
    },
  }));

  const all = type === "orders" ? orderItems : type === "products" ? productItems : [...productItems, ...orderItems];
  const totalItems = all.length;
  const page = all.slice(pagination.offset, pagination.offset + pagination.perPage);

  return { items: page, totalItems };
}
