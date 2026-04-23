"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { IconHeart, IconShare } from "@tabler/icons-react";
import { IconHeartFilled } from "@tabler/icons-react";
import { toast } from "sonner";
import type { ShareableProduct } from "@/components/share-modal";

const ShareModal = dynamic(
  () =>
    import("@/components/share-modal").then((m) => ({
      default: m.ShareModal,
    })),
  { ssr: false },
);

export function ProductActions({ product }: { product: ShareableProduct }) {
  const [isShortlisted, setIsShortlisted] = useState(false);

  function handleShortlist() {
    const next = !isShortlisted;
    setIsShortlisted(next);
    toast(next ? "Added to shortlist" : "Removed from shortlist");
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={handleShortlist}
        className="flex h-11.25 flex-1 items-center justify-center gap-2 rounded-lg bg-secondary px-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
      >
        Shortlist
        {isShortlisted ? (
          <IconHeartFilled size={20} className="text-rose-500" />
        ) : (
          <IconHeart size={20} />
        )}
      </button>
      <ShareModal product={product}>
        <button className="flex h-11.25 flex-1 items-center justify-center gap-2 rounded-lg bg-secondary px-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80">
          Share
          <IconShare size={20} />
        </button>
      </ShareModal>
    </div>
  );
}
