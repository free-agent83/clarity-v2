import { pgTable, uuid, text, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { bandStyles, metals, shapes } from "./lookups";
import { products } from "./products";

// ---------------------------------------------------------------------------
// Engagement Rings
// ---------------------------------------------------------------------------

export const engagementRings = pgTable("engagement_rings", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull()
    .unique(),
  sku: text("sku").notNull(),
  bandStyleId: uuid("band_style_id")
    .references(() => bandStyles.id)
    .notNull(),
  ringWidthMm: numeric("ring_width_mm").notNull(),
});

export const engagementRingAvailableMetals = pgTable(
  "engagement_ring_available_metals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    engagementRingId: uuid("engagement_ring_id")
      .references(() => engagementRings.id)
      .notNull(),
    metalId: uuid("metal_id")
      .references(() => metals.id)
      .notNull(),
    priceUsd: numeric("price_usd").notNull(),
  },
);

export const engagementRingCompatibleStones = pgTable(
  "engagement_ring_compatible_stones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    engagementRingId: uuid("engagement_ring_id")
      .references(() => engagementRings.id)
      .notNull(),
    shapeId: uuid("shape_id")
      .references(() => shapes.id)
      .notNull(),
    maxCarat: numeric("max_carat").notNull(),
  },
);

// ---------------------------------------------------------------------------
// Wedding Bands
// ---------------------------------------------------------------------------

export const weddingBands = pgTable("wedding_bands", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull()
    .unique(),
  sku: text("sku").notNull(),
  bandStyleId: uuid("band_style_id")
    .references(() => bandStyles.id)
    .notNull(),
  ringWidthMm: numeric("ring_width_mm").notNull(),
});

export const weddingBandAvailableMetals = pgTable(
  "wedding_band_available_metals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    weddingBandId: uuid("wedding_band_id")
      .references(() => weddingBands.id)
      .notNull(),
    metalId: uuid("metal_id")
      .references(() => metals.id)
      .notNull(),
    priceUsd: numeric("price_usd").notNull(),
  },
);

// ---------------------------------------------------------------------------
// Tennis Bracelets
// ---------------------------------------------------------------------------

export const tennisBracelets = pgTable("tennis_bracelets", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull()
    .unique(),
  sku: text("sku").notNull(),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const engagementRingsRelations = relations(
  engagementRings,
  ({ one, many }) => ({
    product: one(products, {
      fields: [engagementRings.productId],
      references: [products.id],
    }),
    bandStyle: one(bandStyles, {
      fields: [engagementRings.bandStyleId],
      references: [bandStyles.id],
    }),
    availableMetals: many(engagementRingAvailableMetals),
    compatibleStones: many(engagementRingCompatibleStones),
  }),
);

export const engagementRingAvailableMetalsRelations = relations(
  engagementRingAvailableMetals,
  ({ one }) => ({
    engagementRing: one(engagementRings, {
      fields: [engagementRingAvailableMetals.engagementRingId],
      references: [engagementRings.id],
    }),
    metal: one(metals, {
      fields: [engagementRingAvailableMetals.metalId],
      references: [metals.id],
    }),
  }),
);

export const engagementRingCompatibleStonesRelations = relations(
  engagementRingCompatibleStones,
  ({ one }) => ({
    engagementRing: one(engagementRings, {
      fields: [engagementRingCompatibleStones.engagementRingId],
      references: [engagementRings.id],
    }),
    shape: one(shapes, {
      fields: [engagementRingCompatibleStones.shapeId],
      references: [shapes.id],
    }),
  }),
);

export const weddingBandsRelations = relations(
  weddingBands,
  ({ one, many }) => ({
    product: one(products, {
      fields: [weddingBands.productId],
      references: [products.id],
    }),
    bandStyle: one(bandStyles, {
      fields: [weddingBands.bandStyleId],
      references: [bandStyles.id],
    }),
    availableMetals: many(weddingBandAvailableMetals),
  }),
);

export const weddingBandAvailableMetalsRelations = relations(
  weddingBandAvailableMetals,
  ({ one }) => ({
    weddingBand: one(weddingBands, {
      fields: [weddingBandAvailableMetals.weddingBandId],
      references: [weddingBands.id],
    }),
    metal: one(metals, {
      fields: [weddingBandAvailableMetals.metalId],
      references: [metals.id],
    }),
  }),
);

export const tennisBraceletsRelations = relations(
  tennisBracelets,
  ({ one }) => ({
    product: one(products, {
      fields: [tennisBracelets.productId],
      references: [products.id],
    }),
  }),
);
