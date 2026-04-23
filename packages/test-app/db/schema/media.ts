import { pgTable, uuid, text, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { products } from "./products";
import { certificationLabs } from "./lookups";

export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isThumbnail: boolean("is_thumbnail").notNull().default(false),
});

export const certifications = pgTable("certifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull()
    .unique(),
  labId: uuid("lab_id")
    .references(() => certificationLabs.id)
    .notNull(),
  certificateNumber: text("certificate_number").notNull(),
  pdfUrl: text("pdf_url"),
});

// Relations
export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const certificationsRelations = relations(certifications, ({ one }) => ({
  product: one(products, {
    fields: [certifications.productId],
    references: [products.id],
  }),
  lab: one(certificationLabs, {
    fields: [certifications.labId],
    references: [certificationLabs.id],
  }),
}));
