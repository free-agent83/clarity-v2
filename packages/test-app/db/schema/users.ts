import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { timestamps } from "./helpers";
import { currencies, countries } from "./lookups";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  authUserId: uuid("auth_user_id").unique(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  companyName: text("company_name"),
  phone: text("phone"),
  verified: boolean("verified").notNull().default(false),
  currencyId: uuid("currency_id")
    .references(() => currencies.id)
    .notNull(),
  ...timestamps,
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  name: text("name").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  state: text("state"),
  postalCode: text("postal_code"),
  countryId: uuid("country_id")
    .references(() => countries.id)
    .notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  ...timestamps,
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  countryId: uuid("country_id")
    .references(() => countries.id)
    .notNull(),
  email: text("email").notNull(),
  ...timestamps,
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  currency: one(currencies, {
    fields: [users.currencyId],
    references: [currencies.id],
  }),
  addresses: many(addresses),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
  country: one(countries, {
    fields: [addresses.countryId],
    references: [countries.id],
  }),
}));

export const suppliersRelations = relations(suppliers, ({ one }) => ({
  country: one(countries, {
    fields: [suppliers.countryId],
    references: [countries.id],
  }),
}));
