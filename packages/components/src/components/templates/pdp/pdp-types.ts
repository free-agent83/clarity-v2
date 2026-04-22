import type { ReactNode } from "react";

// ── Media ─────────────────────────────────────────────────

export type ProductMedia =
  | { type: "image"; src: string; alt: string; thumbnailSrc?: string }
  | { type: "video360"; src: string; poster?: string };

// ── Layout ────────────────────────────────────────────────

export interface PdpLayoutProps {
  media: ReactNode;
  body: ReactNode;
  children?: ReactNode;
  stickyTop?: string;
  className?: string;
}

// ── Heading ───────────────────────────────────────────────

export interface PdpHeadingProps {
  name: string;
  sku?: string;
  className?: string;
}

// ── Media gallery ─────────────────────────────────────────

export interface PdpMediaGalleryProps {
  media: ProductMedia[];
  onMediaClick?: (index: number) => void;
  className?: string;
}

// ── Price ─────────────────────────────────────────────────

export interface PdpPriceProps {
  amount: number;
  currency: string;
  label?: string;
  perCarat?: { amount: number; currency: string };
  discount?: { percentage: number; originalAmount: number };
  includeTariffs?: boolean;
  /** amount = item price (primary, large); deliveredAmount is shown as caption below. Mutually exclusive with discount. */
  legacy?: { deliveredAmount: number; deliveredCurrency: string };
  alternateCurrency?: { amount: number; currency: string };
  showAlternateCurrency?: boolean;
  className?: string;
}

// ── Variant selector ──────────────────────────────────────

export interface PdpVariantSelectorProps {
  label: string;
  children: ReactNode;
  className?: string;
}

// ── Primary action ────────────────────────────────────────

export interface PdpPrimaryActionProps {
  children: ReactNode;
  secondaryActions?: ReactNode;
  className?: string;
}

// ── Delivery ──────────────────────────────────────────────

export interface PdpDeliveryProps {
  variant: "express" | "regular";
  date: ReactNode;
  shipsFrom?: ReactNode;
  className?: string;
}

// ── Returns ───────────────────────────────────────────────

export interface PdpReturnsProps {
  variant: "returnable" | "non-returnable";
  returnsWindow?: ReactNode;
  policyLink?: ReactNode;
  className?: string;
}

// ── Specifications ────────────────────────────────────────

export interface PdpSpecificationRow {
  label: string;
  value: ReactNode;
}

export interface PdpSpecificationsProps {
  rows: PdpSpecificationRow[];
  heading?: string;
  className?: string;
}

// ── Description ───────────────────────────────────────────

export interface PdpDescriptionProps {
  children: ReactNode;
  className?: string;
}

// ── Lightbox ──────────────────────────────────────────────

export interface LightboxProps {
  media: ProductMedia[];
  initialIndex?: number;
  onClose: () => void;
}
