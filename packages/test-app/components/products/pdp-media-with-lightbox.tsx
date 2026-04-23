"use client";

import { useState } from "react";
import { Lightbox } from "@nivoda/components/components/molecules/lightbox/lightbox";
import { PdpMediaGallery } from "@nivoda/components/components/templates/pdp/pdp-media-gallery";
import type { ProductMedia } from "@nivoda/components/components/templates/pdp/pdp-types";

export type PdpMediaWithLightboxProps = {
  media: ProductMedia[];
};

export function PdpMediaWithLightbox({ media }: PdpMediaWithLightboxProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  return (
    <>
      <PdpMediaGallery media={media} onMediaClick={setLightboxIndex} />
      {lightboxIndex !== null && (
        <Lightbox
          media={media}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
