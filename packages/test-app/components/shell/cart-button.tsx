"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconArrowRight,
  IconDiamond,
  IconDiamondsFilled,
  IconHeart,
  IconHeartFilled,
  IconInfoCircle,
  IconShoppingCart,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { useCartStore, type CartItem } from "@/hooks/use-cart-store";
import { cn, formatUSD } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const CATEGORY_ICONS: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  natural_diamond: IconDiamond,
  lab_grown_diamond: IconDiamond,
  gemstone: IconDiamondsFilled,
  natural_melee: IconDiamond,
  lab_grown_melee: IconDiamond,
  engagement_ring: IconDiamondsFilled,
  wedding_band: IconDiamondsFilled,
  tennis_bracelet: IconDiamondsFilled,
};

const CREDIT_USED = 4500;
const CREDIT_TOTAL = 5000;

function CartItemRow({
  item,
  isShortlisted,
  removing,
  reference,
  onReferenceChange,
  onRemove,
  onShortlist,
}: {
  item: CartItem;
  isShortlisted: boolean;
  removing: boolean;
  reference: string;
  onReferenceChange: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  onShortlist: (id: string) => void;
}) {
  const FallbackIcon = CATEGORY_ICONS[item.category] ?? IconDiamond;

  return (
    <div
      className={cn(
        "flex gap-4 border-b border-muted p-4 transition-all duration-200 last:border-b-0",
        removing && "h-0 overflow-hidden opacity-0 !p-0",
      )}
    >
      {/* Thumbnail */}
      <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        {item.image ? (
          <img src={item.image} alt="" className="size-full object-cover" />
        ) : (
          <FallbackIcon size={20} className="text-muted-foreground" />
        )}
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {/* Name */}
        <div>
          <p className="truncate text-sm font-medium text-foreground">
            {item.name}
          </p>

          {/* Cert / Stock line */}
          <p className="text-xs text-muted-foreground">
            {item.certLab && item.certNumber ? (
              <>
                <span>{item.certLab}</span>{" "}
                <span className="text-foreground">{item.certNumber}</span>
                {" · "}
              </>
            ) : null}
            <span>Stock ID</span>{" "}
            <span className="text-foreground">{item.stockId}</span>
          </p>

          {/* Price + discount */}
          <div className="mt-1 flex items-center gap-1">
            <span className="text-sm font-medium text-foreground">
              {formatUSD(item.price)}
            </span>
            {item.discount !== null && (
              <span className="rounded bg-[#f4f2ff] px-1.5 py-0.5 text-xs text-[#5620e1]">
                {Math.abs(item.discount)}%
              </span>
            )}
          </div>

          {/* Internal order reference */}
          <input
            type="text"
            value={reference}
            onChange={(e) => onReferenceChange(item.id, e.target.value)}
            placeholder="Internal order ref."
            className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring/50"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onShortlist(item.id)}
          >
            {isShortlisted ? (
              <IconHeartFilled size={16} className="text-rose-500" />
            ) : (
              <IconHeart size={16} />
            )}
            {isShortlisted ? "Shortlisted" : "Add to shortlist"}
          </Button>
          <Button variant="ghost" size="xs" onClick={() => onRemove(item.id)}>
            <IconTrash size={16} />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}

function CartFooter({ total }: { total: number }) {
  const router = useRouter();
  const creditPercent = Math.min((CREDIT_USED / CREDIT_TOTAL) * 100, 100);

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Credit available */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          Credit available
          <IconInfoCircle size={14} className="text-muted-foreground/60" />
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${creditPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span>
            <span className="font-medium text-primary">
              {formatUSD(CREDIT_USED)}
            </span>{" "}
            <span className="text-muted-foreground">used</span>
          </span>
          <span>
            <span className="font-medium text-foreground">
              {formatUSD(CREDIT_TOTAL)}
            </span>{" "}
            <span className="text-muted-foreground">total</span>
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Total */}
      <div className="flex items-baseline justify-between">
        <span className="text-base text-muted-foreground">Total</span>
        <span className="text-xl font-medium text-foreground">
          {formatUSD(total)}
        </span>
      </div>

      {/* CTA */}
      <Button
        className="h-11 w-full gap-2"
        onClick={() => {
          useCartStore.getState().closeSheet();
          router.push("/buyer/checkout");
        }}
      >
        Proceed to checkout
        <IconArrowRight size={20} />
      </Button>
    </div>
  );
}

function CartEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-5">
      <p className="text-sm text-muted-foreground">Your cart is empty</p>
      <Button
        variant="link"
        className="text-sm"
        onClick={() => useCartStore.getState().closeSheet()}
      >
        Continue shopping
      </Button>
    </div>
  );
}

export function CartButton() {
  const items = useCartStore((s) => s.items);
  const isSheetOpen = useCartStore((s) => s.isSheetOpen);
  const openSheet = useCartStore((s) => s.openSheet);
  const toggleSheet = useCartStore((s) => s.toggleSheet);
  const closeSheet = useCartStore((s) => s.closeSheet);
  const removeItem = useCartStore((s) => s.removeItem);

  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [references, setReferences] = useState<Record<string, string>>({});

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  function handleRemove(id: string) {
    const item = items.find((i) => i.id === id);
    setRemovingId(id);
    setTimeout(() => {
      if (item) removeItem(item.productId);
      setRemovingId(null);
      toast("Item removed from cart");
    }, 200);
  }

  function handleShortlist(id: string) {
    setShortlisted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast("Removed from shortlist");
      } else {
        next.add(id);
        toast("Added to shortlist");
      }
      return next;
    });
  }

  return (
    <Sheet
      open={isSheetOpen}
      onOpenChange={(open) => {
        if (open) openSheet();
        else closeSheet();
      }}
    >
      <button
        type="button"
        onClick={toggleSheet}
        className="flex h-11 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        Cart ({items.length})
        <IconShoppingCart size={20} />
      </button>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex flex-col gap-0 p-0"
      >
        <SheetTitle className="sr-only">Cart</SheetTitle>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="text-base">My cart ({items.length})</span>
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full bg-muted hover:bg-muted/80"
            onClick={closeSheet}
          >
            <IconX size={16} />
            <span className="sr-only">Close cart</span>
          </Button>
        </div>

        {/* Item list or empty state */}
        {items.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto border-b border-border">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  isShortlisted={shortlisted.has(item.id)}
                  removing={removingId === item.id}
                  reference={references[item.id] ?? ""}
                  onReferenceChange={(id, value) =>
                    setReferences((prev) => ({ ...prev, [id]: value }))
                  }
                  onRemove={handleRemove}
                  onShortlist={handleShortlist}
                />
              ))}
            </div>
            <CartFooter total={total} />
          </>
        ) : (
          <CartEmptyState />
        )}
      </SheetContent>
    </Sheet>
  );
}
