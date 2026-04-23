import {
  pgTable,
  uuid,
  integer,
  timestamp,
  text,
  numeric,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { timestamps } from "./helpers";
import { users } from "./users";
import { products } from "./products";
import { orders } from "./orders";
import {
  paymentMethods,
  invoiceStatuses,
  ledgerEntryTypes,
  currencies,
  metals,
} from "./lookups";

export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),
  quantity: integer("quantity").notNull().default(1),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cartItemConfig = pgTable("cart_item_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  cartItemId: uuid("cart_item_id")
    .references(() => cartItems.id)
    .notNull()
    .unique(),
  metalId: uuid("metal_id").references(() => metals.id),
  centerStoneProductId: uuid("center_stone_product_id").references(
    () => products.id,
  ),
  ringSize: numeric("ring_size"),
  braceletLength: numeric("bracelet_length"),
  engravingText: text("engraving_text"),
});

export const shortlists = pgTable("shortlists", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  name: text("name").notNull(),
  ...timestamps,
});

export const shortlistItems = pgTable("shortlist_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  shortlistId: uuid("shortlist_id")
    .references(() => shortlists.id)
    .notNull(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  paymentMethodId: uuid("payment_method_id")
    .references(() => paymentMethods.id)
    .notNull(),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  totalAmountUsd: numeric("total_amount_usd").notNull(),
  currentStatus: uuid("current_status").references(() => invoiceStatuses.id),
  ...timestamps,
});

export const ledgerEntries = pgTable("ledger_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id")
    .references(() => invoices.id)
    .notNull(),
  ledgerEntryTypeId: uuid("ledger_entry_type_id")
    .references(() => ledgerEntryTypes.id)
    .notNull(),
  orderId: uuid("order_id").references(() => orders.id),
  description: text("description").notNull(),
  amountUsd: numeric("amount_usd").notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
});

export const ledgerEntryExchangeRates = pgTable("ledger_entry_exchange_rates", {
  id: uuid("id").primaryKey().defaultRandom(),
  ledgerEntryId: uuid("ledger_entry_id")
    .references(() => ledgerEntries.id)
    .notNull(),
  currencyId: uuid("currency_id")
    .references(() => currencies.id)
    .notNull(),
  rate: numeric("rate").notNull(),
});

// Relations
export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, { fields: [cartItems.userId], references: [users.id] }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  config: one(cartItemConfig),
}));

export const cartItemConfigRelations = relations(cartItemConfig, ({ one }) => ({
  cartItem: one(cartItems, {
    fields: [cartItemConfig.cartItemId],
    references: [cartItems.id],
  }),
  metal: one(metals, {
    fields: [cartItemConfig.metalId],
    references: [metals.id],
  }),
  centerStoneProduct: one(products, {
    fields: [cartItemConfig.centerStoneProductId],
    references: [products.id],
  }),
}));

export const shortlistsRelations = relations(shortlists, ({ one, many }) => ({
  user: one(users, {
    fields: [shortlists.userId],
    references: [users.id],
  }),
  items: many(shortlistItems),
}));

export const shortlistItemsRelations = relations(shortlistItems, ({ one }) => ({
  shortlist: one(shortlists, {
    fields: [shortlistItems.shortlistId],
    references: [shortlists.id],
  }),
  product: one(products, {
    fields: [shortlistItems.productId],
    references: [products.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user: one(users, { fields: [invoices.userId], references: [users.id] }),
  paymentMethod: one(paymentMethods, {
    fields: [invoices.paymentMethodId],
    references: [paymentMethods.id],
  }),
  currentStatusRef: one(invoiceStatuses, {
    fields: [invoices.currentStatus],
    references: [invoiceStatuses.id],
  }),
  ledgerEntries: many(ledgerEntries),
}));

export const ledgerEntriesRelations = relations(
  ledgerEntries,
  ({ one, many }) => ({
    invoice: one(invoices, {
      fields: [ledgerEntries.invoiceId],
      references: [invoices.id],
    }),
    ledgerEntryType: one(ledgerEntryTypes, {
      fields: [ledgerEntries.ledgerEntryTypeId],
      references: [ledgerEntryTypes.id],
    }),
    order: one(orders, {
      fields: [ledgerEntries.orderId],
      references: [orders.id],
    }),
    exchangeRates: many(ledgerEntryExchangeRates),
  }),
);

export const ledgerEntryExchangeRatesRelations = relations(
  ledgerEntryExchangeRates,
  ({ one }) => ({
    ledgerEntry: one(ledgerEntries, {
      fields: [ledgerEntryExchangeRates.ledgerEntryId],
      references: [ledgerEntries.id],
    }),
    currency: one(currencies, {
      fields: [ledgerEntryExchangeRates.currencyId],
      references: [currencies.id],
    }),
  }),
);
