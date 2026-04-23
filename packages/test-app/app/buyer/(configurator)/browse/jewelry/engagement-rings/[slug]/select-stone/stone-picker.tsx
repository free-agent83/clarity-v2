"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconShoppingCart } from "@tabler/icons-react";

import { cn, formatUSD } from "@/lib/utils";

type StoneItem = {
  id: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  pricePerCarat: number;
  image: string;
  description: string;
  labGrown: boolean;
};

type MountInfo = {
  name: string;
  thumbnail: string;
  metalLabel: string;
  metalPrice: number;
  size: string;
  engraving: string;
  slug: string;
};

type StonePickerProps = {
  stones: StoneItem[];
  mount: MountInfo;
  configParams: Record<string, string>;
};

export function StonePicker({ stones, mount, configParams }: StonePickerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();

  const selectedStone = stones.find((s) => s.id === selectedId);
  const totalPrice = selectedStone
    ? mount.metalPrice + selectedStone.price
    : mount.metalPrice;

  function handleConfirm() {
    if (!selectedStone) return;
    const params = new URLSearchParams({
      metalId: configParams.metalId ?? "",
      size: configParams.size ?? "",
      stoneId: selectedStone.id,
      labGrown: String(selectedStone.labGrown),
    });
    if (configParams.engraving) {
      params.set("engraving", configParams.engraving);
    }
    router.push(
      `/buyer/browse/jewelry/engagement-rings/${mount.slug}/added-to-cart?${params.toString()}`,
    );
  }

  return (
    <div className="pb-40">
      {/* Stone grid */}
      <div className="grid grid-cols-4 gap-x-5 gap-y-10">
        {stones.map((stone) => {
          const isSelected = selectedId === stone.id;
          return (
            <button
              key={stone.id}
              onClick={() => setSelectedId(stone.id)}
              className={cn(
                "flex flex-col gap-3 rounded-2xl p-2 text-left transition-all",
                isSelected
                  ? "ring-2 ring-foreground"
                  : "hover:ring-1 hover:ring-border",
              )}
            >
              {/* Image */}
              <div className="aspect-square overflow-hidden rounded-xl border border-black/4">
                <img
                  src={stone.image}
                  alt={stone.description}
                  className="size-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1">
                <p className="truncate text-base leading-7 text-foreground">
                  {stone.description}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stone.shape} · {stone.carat}ct · {stone.color} ·{" "}
                  {stone.clarity} · {stone.cut}
                </p>
                <p className="text-base leading-7 text-foreground">
                  {formatUSD(stone.price)}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Fixed footer */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-4">
          {/* Mount info */}
          <div className="flex items-center gap-3">
            <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-border">
              <img
                src={mount.thumbnail}
                alt={mount.name}
                className="size-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Mount</span>
              <span className="text-sm font-medium text-foreground">
                {mount.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatUSD(mount.metalPrice)}
              </span>
            </div>
          </div>

          {/* Selected stone info */}
          {selectedStone && (
            <>
              <div className="h-10 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-border">
                  <img
                    src={selectedStone.image}
                    alt={selectedStone.description}
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    Center stone
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {selectedStone.description}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatUSD(selectedStone.price)}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Total + CTA */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground">
                Total ring price
              </span>
              <span className="text-lg font-medium text-foreground">
                {formatUSD(totalPrice)}
              </span>
            </div>
            <button
              disabled={!selectedStone}
              onClick={handleConfirm}
              className={cn(
                "flex h-12 items-center gap-2 rounded-lg px-6 text-sm font-medium transition-colors",
                selectedStone
                  ? "bg-foreground text-background hover:bg-foreground/90"
                  : "cursor-not-allowed bg-muted text-muted-foreground",
              )}
            >
              Confirm and add ring to cart
              <IconShoppingCart size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
