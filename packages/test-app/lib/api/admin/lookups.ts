import { db } from "@/db/client";
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
  metals,
  bandStyles,
  paymentMethods,
  orderEventTypes,
  invoiceStatuses,
  ledgerEntryTypes,
  paymentTerms,
  productCategories,
} from "@/db/schema";

export interface LookupItem {
  id: string;
  value: string;
}

export interface AllLookups {
  shapes: LookupItem[];
  diamondColors: LookupItem[];
  diamondClarityGrades: LookupItem[];
  diamondCutGrades: LookupItem[];
  diamondPolishGrades: LookupItem[];
  diamondSymmetryGrades: LookupItem[];
  diamondFluorescenceLevels: LookupItem[];
  gemstoneTypes: LookupItem[];
  gemstoneCutGrades: LookupItem[];
  gemstoneTreatments: LookupItem[];
  gemstoneOrigins: LookupItem[];
  metals: LookupItem[];
  bandStyles: LookupItem[];
  paymentMethods: LookupItem[];
  orderEventTypes: LookupItem[];
  invoiceStatuses: LookupItem[];
  ledgerEntryTypes: LookupItem[];
  paymentTerms: LookupItem[];
  productCategories: LookupItem[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchTable(table: any): Promise<LookupItem[]> {
  return db
    .select({ id: table.id, value: table.value })
    .from(table)
    .orderBy(table.sortOrder);
}

export async function fetchAllLookups(): Promise<AllLookups> {
  const [
    shapesRows,
    diamondColorsRows,
    diamondClarityGradesRows,
    diamondCutGradesRows,
    diamondPolishGradesRows,
    diamondSymmetryGradesRows,
    diamondFluorescenceLevelsRows,
    gemstoneTypesRows,
    gemstoneCutGradesRows,
    gemstoneTreatmentsRows,
    gemstoneOriginsRows,
    metalsRows,
    bandStylesRows,
    paymentMethodsRows,
    orderEventTypesRows,
    invoiceStatusesRows,
    ledgerEntryTypesRows,
    paymentTermsRows,
    productCategoriesRows,
  ] = await Promise.all([
    fetchTable(shapes),
    fetchTable(diamondColors),
    fetchTable(diamondClarityGrades),
    fetchTable(diamondCutGrades),
    fetchTable(diamondPolishGrades),
    fetchTable(diamondSymmetryGrades),
    fetchTable(diamondFluorescenceLevels),
    fetchTable(gemstoneTypes),
    fetchTable(gemstoneCutGrades),
    fetchTable(gemstoneTreatments),
    fetchTable(gemstoneOrigins),
    fetchTable(metals),
    fetchTable(bandStyles),
    fetchTable(paymentMethods),
    fetchTable(orderEventTypes),
    fetchTable(invoiceStatuses),
    fetchTable(ledgerEntryTypes),
    fetchTable(paymentTerms),
    fetchTable(productCategories),
  ]);

  return {
    shapes: shapesRows,
    diamondColors: diamondColorsRows,
    diamondClarityGrades: diamondClarityGradesRows,
    diamondCutGrades: diamondCutGradesRows,
    diamondPolishGrades: diamondPolishGradesRows,
    diamondSymmetryGrades: diamondSymmetryGradesRows,
    diamondFluorescenceLevels: diamondFluorescenceLevelsRows,
    gemstoneTypes: gemstoneTypesRows,
    gemstoneCutGrades: gemstoneCutGradesRows,
    gemstoneTreatments: gemstoneTreatmentsRows,
    gemstoneOrigins: gemstoneOriginsRows,
    metals: metalsRows,
    bandStyles: bandStylesRows,
    paymentMethods: paymentMethodsRows,
    orderEventTypes: orderEventTypesRows,
    invoiceStatuses: invoiceStatusesRows,
    ledgerEntryTypes: ledgerEntryTypesRows,
    paymentTerms: paymentTermsRows,
    productCategories: productCategoriesRows,
  };
}
