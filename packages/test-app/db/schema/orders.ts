import {
  pgTable,
  uuid,
  numeric,
  boolean,
  timestamp,
  date,
  jsonb,
  integer,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { timestamps } from "./helpers";
import { users, addresses } from "./users";
import { products } from "./products";
import { orderEventTypes, currencies, paymentTerms } from "./lookups";

export const orderCheckouts = pgTable(
  "order_checkouts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    orderNumber: integer("order_number").notNull(),
    paymentTermId: uuid("payment_term_id")
      .references(() => paymentTerms.id)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique().on(t.userId, t.orderNumber)],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    checkoutId: uuid("checkout_id")
      .references(() => orderCheckouts.id)
      .notNull(),
    orderNumber: integer("order_number").notNull(),
    paymentTermId: uuid("payment_term_id")
      .references(() => paymentTerms.id)
      .notNull(),
    currentStatus: uuid("current_status").references(() => orderEventTypes.id),
    estimatedDelivery: date("estimated_delivery").notNull(),
    deliveryAddressId: uuid("delivery_address_id")
      .references(() => addresses.id)
      .notNull(),
    shippingCost: numeric("shipping_cost").notNull().default("0"),
    vatAmount: numeric("vat_amount").notNull().default("0"),
    finalPriceUsd: numeric("final_price_usd").notNull(),
    canTrack: boolean("can_track").notNull().default(false),
    canPayInvoice: boolean("can_pay_invoice").notNull().default(false),
    ...timestamps,
  },
  (t) => [unique().on(t.checkoutId, t.orderNumber)],
);

export const orderProducts = pgTable("order_products", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .references(() => orders.id)
    .notNull(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),
  snapshot: jsonb("snapshot").notNull(),
  priceUsd: numeric("price_usd").notNull(),
});

export const orderEvents = pgTable("order_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .references(() => orders.id)
    .notNull(),
  eventTypeId: uuid("event_type_id")
    .references(() => orderEventTypes.id)
    .notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
});

export const orderExchangeRates = pgTable("order_exchange_rates", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .references(() => orders.id)
    .notNull(),
  currencyId: uuid("currency_id")
    .references(() => currencies.id)
    .notNull(),
  rate: numeric("rate").notNull(),
});

// Relations
export const orderCheckoutsRelations = relations(
  orderCheckouts,
  ({ one, many }) => ({
    user: one(users, {
      fields: [orderCheckouts.userId],
      references: [users.id],
    }),
    paymentTerm: one(paymentTerms, {
      fields: [orderCheckouts.paymentTermId],
      references: [paymentTerms.id],
    }),
    orders: many(orders),
  }),
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  checkout: one(orderCheckouts, {
    fields: [orders.checkoutId],
    references: [orderCheckouts.id],
  }),
  paymentTerm: one(paymentTerms, {
    fields: [orders.paymentTermId],
    references: [paymentTerms.id],
  }),
  deliveryAddress: one(addresses, {
    fields: [orders.deliveryAddressId],
    references: [addresses.id],
  }),
  currentStatusRef: one(orderEventTypes, {
    fields: [orders.currentStatus],
    references: [orderEventTypes.id],
  }),
  products: many(orderProducts),
  events: many(orderEvents),
  exchangeRates: many(orderExchangeRates),
}));

export const orderProductsRelations = relations(orderProducts, ({ one }) => ({
  order: one(orders, {
    fields: [orderProducts.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderProducts.productId],
    references: [products.id],
  }),
}));

export const orderEventsRelations = relations(orderEvents, ({ one }) => ({
  order: one(orders, {
    fields: [orderEvents.orderId],
    references: [orders.id],
  }),
  eventType: one(orderEventTypes, {
    fields: [orderEvents.eventTypeId],
    references: [orderEventTypes.id],
  }),
}));

export const orderExchangeRatesRelations = relations(
  orderExchangeRates,
  ({ one }) => ({
    order: one(orders, {
      fields: [orderExchangeRates.orderId],
      references: [orders.id],
    }),
    currency: one(currencies, {
      fields: [orderExchangeRates.currencyId],
      references: [currencies.id],
    }),
  }),
);
