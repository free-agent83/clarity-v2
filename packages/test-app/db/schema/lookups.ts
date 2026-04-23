import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

function lookupTable<T extends string>(name: T) {
  return pgTable(name, {
    id: uuid("id").primaryKey().defaultRandom(),
    value: text("value").notNull(),
    sortOrder: integer("sort_order").notNull(),
  });
}

// Diamond-specific
export const shapes = lookupTable("shapes");
export const diamondColors = lookupTable("diamond_colors");
export const diamondClarityGrades = lookupTable("diamond_clarity_grades");
export const diamondCutGrades = lookupTable("diamond_cut_grades");
export const diamondPolishGrades = lookupTable("diamond_polish_grades");
export const diamondSymmetryGrades = lookupTable("diamond_symmetry_grades");
export const diamondFluorescenceLevels = lookupTable(
  "diamond_fluorescence_levels",
);

// Gemstone-specific
export const gemstoneTypes = lookupTable("gemstone_types");
export const gemstoneCutGrades = lookupTable("gemstone_cut_grades");
export const gemstoneTreatments = lookupTable("gemstone_treatments");
export const gemstoneOrigins = lookupTable("gemstone_origins");

// Jewelry
export const certificationLabs = lookupTable("certification_labs");
export const metals = lookupTable("metals");
export const bandStyles = lookupTable("band_styles");

// Global
export const paymentMethods = lookupTable("payment_methods");
export const countries = lookupTable("countries");
export const currencies = lookupTable("currencies");
export const orderEventTypes = lookupTable("order_event_types");
export const invoiceStatuses = lookupTable("invoice_statuses");
export const ledgerEntryTypes = lookupTable("ledger_entry_types");
export const paymentTerms = lookupTable("payment_terms");
export const productCategories = lookupTable("product_categories");
