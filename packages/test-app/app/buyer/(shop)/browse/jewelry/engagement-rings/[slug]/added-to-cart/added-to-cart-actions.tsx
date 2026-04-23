"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { IconShoppingCart, IconShare } from "@tabler/icons-react";

import { useCartStore } from "@/hooks/use-cart-store";
import type { ShareableProduct } from "@/components/share-modal";

const ShareModal = dynamic(
  () =>
    import("@/components/share-modal").then((m) => ({
      default: m.ShareModal,
    })),
  { ssr: false },
);

type AddedToCartActionsProps = {
  product: ShareableProduct;
};

export function AddedToCartActions({ product }: AddedToCartActionsProps) {
  const openSheet = useCartStore((s) => s.openSheet);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={openSheet}
        className="flex h-11.25 items-center gap-2 rounded-lg bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
      >
        View cart
        <IconShoppingCart size={20} />
      </button>

      <ShareModal product={product}>
        <button className="flex h-11.25 items-center gap-2 rounded-lg border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
          Share with stone
          <IconShare size={20} />
        </button>
      </ShareModal>

      <Link
        href="/buyer/browse/jewelry/engagement-rings"
        className="flex h-11.25 items-center rounded-lg border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        Back to browsing
      </Link>
    </div>
  );
}
