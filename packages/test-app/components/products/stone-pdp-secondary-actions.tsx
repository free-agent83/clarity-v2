"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  IconHeart,
  IconHeartFilled,
  IconShare3,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@nivoda/components";

import type { ShareableProduct } from "@/components/share-modal";

const ShareModal = dynamic(
  () =>
    import("@/components/share-modal").then((m) => ({
      default: m.ShareModal,
    })),
  { ssr: false },
);

export type StonePdpSecondaryActionsProps = {
  product: ShareableProduct;
};

export function StonePdpSecondaryActions({
  product,
}: StonePdpSecondaryActionsProps) {
  const [isShortlisted, setIsShortlisted] = useState(false);

  return (
    <>
      <Button
        className="flex-1"
        variant="outline"
        onClick={() => {
          const next = !isShortlisted;
          setIsShortlisted(next);
          toast(next ? "Added to shortlist" : "Removed from shortlist");
        }}
      >
        Shortlist
        {isShortlisted ? (
          <IconHeartFilled size={16} className="text-rose-500" />
        ) : (
          <IconHeart size={16} />
        )}
      </Button>
      <ShareModal product={product}>
        <Button className="flex-1" variant="outline">
          Share
          <IconShare3 size={16} />
        </Button>
      </ShareModal>
    </>
  );
}
