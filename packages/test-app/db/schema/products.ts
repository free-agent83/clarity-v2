import {
  pgTable,
  uuid,
  text,
  boolean,
  numeric,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { timestamps } from "./helpers";
import { suppliers } from "./users";
import {
  shapes,
  diamondColors,
  diamondClarityGrades,
  diamondCutGrades,
  diamondPolishGrades,
  diamondSymmetryGrades,
  diamondFluorescenceLevels,
  gemstoneTypes,
  gemstoneCutGrades,
  gemstoneTreatments,
  gemstoneOrigins,
  productCategories,
} from "./lookups";
import { productImages, certifications } from "./media";
import { engagementRings, weddingBands, tennisBracelets } from "./jewelry";

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  supplierId: uuid("supplier_id")
    .references(() => suppliers.id)
    .notNull(),
  stockId: text("stock_id").notNull(),
  productCategoryId: uuid("product_category_id")
    .references(() => productCategories.id)
    .notNull(),
  priceUsd: numeric("price_usd").notNull(),
  description: text("description").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const diamonds = pgTable("diamonds", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull()
    .unique(),
  labGrown: boolean("lab_grown").notNull(),
  shapeId: uuid("shape_id")
    .references(() => shapes.id)
    .notNull(),
  carat: numeric("carat").notNull(),
  colorId: uuid("color_id")
    .references(() => diamondColors.id)
    .notNull(),
  clarityId: uuid("clarity_id")
    .references(() => diamondClarityGrades.id)
    .notNull(),
  cutId: uuid("cut_id")
    .references(() => diamondCutGrades.id)
    .notNull(),
  polishId: uuid("polish_id")
    .references(() => diamondPolishGrades.id)
    .notNull(),
  symmetryId: uuid("symmetry_id")
    .references(() => diamondSymmetryGrades.id)
    .notNull(),
  fluorescenceId: uuid("fluorescence_id")
    .references(() => diamondFluorescenceLevels.id)
    .notNull(),
  pricePerCaratUsd: numeric("price_per_carat_usd"),
  tablePct: numeric("table_pct").notNull(),
  depthPct: numeric("depth_pct").notNull(),
  lengthMm: numeric("length_mm").notNull(),
  widthMm: numeric("width_mm").notNull(),
  depthMm: numeric("depth_mm").notNull(),
});

export const gemstones = pgTable("gemstones", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull()
    .unique(),
  gemstoneTypeId: uuid("gemstone_type_id")
    .references(() => gemstoneTypes.id)
    .notNull(),
  shapeId: uuid("shape_id")
    .references(() => shapes.id)
    .notNull(),
  carat: numeric("carat").notNull(),
  color: text("color").notNull(),
  clarity: text("clarity").notNull(),
  cutId: uuid("cut_id")
    .references(() => gemstoneCutGrades.id)
    .notNull(),
  treatmentId: uuid("treatment_id")
    .references(() => gemstoneTreatments.id)
    .notNull(),
  originId: uuid("origin_id")
    .references(() => gemstoneOrigins.id)
    .notNull(),
  pricePerCaratUsd: numeric("price_per_carat_usd"),
  lengthMm: numeric("length_mm").notNull(),
  widthMm: numeric("width_mm").notNull(),
  depthMm: numeric("depth_mm").notNull(),
});

export const meleeLots = pgTable("melee_lots", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull()
    .unique(),
  labGrown: boolean("lab_grown").notNull(),
  shapeId: uuid("shape_id")
    .references(() => shapes.id)
    .notNull(),
  sizeRange: text("size_range").notNull(),
  colorRange: text("color_range").notNull(),
  clarityRange: text("clarity_range").notNull(),
  cutId: uuid("cut_id")
    .references(() => diamondCutGrades.id)
    .notNull(),
  quantity: integer("quantity").notNull(),
  totalCaratWeight: numeric("total_carat_weight").notNull(),
});

// Relations
export const productsRelations = relations(products, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.id],
  }),
  productCategory: one(productCategories, {
    fields: [products.productCategoryId],
    references: [productCategories.id],
  }),
  diamond: one(diamonds),
  gemstone: one(gemstones),
  meleeLot: one(meleeLots),
  engagementRing: one(engagementRings),
  weddingBand: one(weddingBands),
  tennisBracelet: one(tennisBracelets),
  images: many(productImages),
  certification: one(certifications),
}));

export const diamondsRelations = relations(diamonds, ({ one }) => ({
  product: one(products, {
    fields: [diamonds.productId],
    references: [products.id],
  }),
  shape: one(shapes, { fields: [diamonds.shapeId], references: [shapes.id] }),
  color: one(diamondColors, {
    fields: [diamonds.colorId],
    references: [diamondColors.id],
  }),
  clarity: one(diamondClarityGrades, {
    fields: [diamonds.clarityId],
    references: [diamondClarityGrades.id],
  }),
  cut: one(diamondCutGrades, {
    fields: [diamonds.cutId],
    references: [diamondCutGrades.id],
  }),
  polish: one(diamondPolishGrades, {
    fields: [diamonds.polishId],
    references: [diamondPolishGrades.id],
  }),
  symmetry: one(diamondSymmetryGrades, {
    fields: [diamonds.symmetryId],
    references: [diamondSymmetryGrades.id],
  }),
  fluorescence: one(diamondFluorescenceLevels, {
    fields: [diamonds.fluorescenceId],
    references: [diamondFluorescenceLevels.id],
  }),
}));

export const gemstonesRelations = relations(gemstones, ({ one }) => ({
  product: one(products, {
    fields: [gemstones.productId],
    references: [products.id],
  }),
  gemstoneType: one(gemstoneTypes, {
    fields: [gemstones.gemstoneTypeId],
    references: [gemstoneTypes.id],
  }),
  shape: one(shapes, {
    fields: [gemstones.shapeId],
    references: [shapes.id],
  }),
  cut: one(gemstoneCutGrades, {
    fields: [gemstones.cutId],
    references: [gemstoneCutGrades.id],
  }),
  treatment: one(gemstoneTreatments, {
    fields: [gemstones.treatmentId],
    references: [gemstoneTreatments.id],
  }),
  origin: one(gemstoneOrigins, {
    fields: [gemstones.originId],
    references: [gemstoneOrigins.id],
  }),
}));

export const meleeLotsRelations = relations(meleeLots, ({ one }) => ({
  product: one(products, {
    fields: [meleeLots.productId],
    references: [products.id],
  }),
  shape: one(shapes, {
    fields: [meleeLots.shapeId],
    references: [shapes.id],
  }),
  cut: one(diamondCutGrades, {
    fields: [meleeLots.cutId],
    references: [diamondCutGrades.id],
  }),
}));
