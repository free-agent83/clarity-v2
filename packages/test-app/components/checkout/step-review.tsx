"use client";

import { useState } from "react";
import {
  IconDiamond,
  IconDiamondsFilled,
  IconTrash,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { cn, formatUSD } from "@/lib/utils";
import { useCartStore, type CartItem } from "@/hooks/use-cart-store";
import { useCheckoutStore } from "@/hooks/use-checkout-store";
import { Input } from "@nivoda/components";
import { Textarea } from "@nivoda/components";
import { Button } from "@nivoda/components";
import { Separator } from "@nivoda/components";

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

function ReviewItem({
  item,
  reference,
  notes,
  removing,
  onReferenceChange,
  onNotesChange,
  onRemove,
}: {
  item: CartItem;
  reference: string;
  notes: string;
  removing: boolean;
  onReferenceChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onRemove: () => void;
}) {
  const FallbackIcon = CATEGORY_ICONS[item.category] ?? IconDiamond;

  return (
    <div
      className={cn(
        "flex gap-4 rounded-lg border border-border p-4 transition-all duration-200",
        removing && "h-0 overflow-hidden opacity-0 !p-0 !border-0",
      )}
    >
      {/* Thumbnail */}
      <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        {item.image ? (
          <img src={item.image} alt="" className="size-full object-cover" />
        ) : (
          <FallbackIcon size={24} className="text-muted-foreground" />
        )}
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">
              {item.certLab && item.certNumber && (
                <>
                  {item.certLab}{" "}
                  <span className="text-foreground">{item.certNumber}</span>
                  {" · "}
                </>
              )}
              Stock ID <span className="text-foreground">{item.stockId}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium whitespace-nowrap">
              {formatUSD(item.price)}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={onRemove}
            >
              <IconTrash size={16} />
            </Button>
          </div>
        </div>

        {/* Reference and notes inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">
              Internal order reference
            </label>
            <Input
              value={reference}
              onChange={(e) => onReferenceChange(e.target.value)}
              placeholder="Your internal reference"
              className="h-9 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Notes</label>
            <Input
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Notes for this item"
              className="h-9 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StepReview() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const generalNotes = useCheckoutStore((s) => s.generalNotes);
  const setGeneralNotes = useCheckoutStore((s) => s.setGeneralNotes);
  const itemNotes = useCheckoutStore((s) => s.itemNotes);
  const setItemNote = useCheckoutStore((s) => s.setItemNote);
  const removeItemNote = useCheckoutStore((s) => s.removeItemNote);
  const [removingId, setRemovingId] = useState<string | null>(null);

  function handleRemove(item: CartItem) {
    setRemovingId(item.id);
    setTimeout(() => {
      removeItem(item.productId);
      removeItemNote(item.productId);
      setRemovingId(null);
      toast("Item removed from cart");
    }, 200);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Review cart & add notes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review the items in your cart, add internal order references & general
          notes.
        </p>
      </div>

      {/* General order notes */}
      <div className="flex flex-col gap-2">
        <div>
          <h2 className="text-sm font-medium text-foreground">
            General order notes
          </h2>
          <p className="text-xs text-muted-foreground">
            These notes will be visible to your sellers (optional)
          </p>
        </div>
        <Textarea
          value={generalNotes}
          onChange={(e) => setGeneralNotes(e.target.value)}
          placeholder="Add any notes that apply to all items in your order..."
          rows={3}
        />
      </div>

      <Separator />

      {/* Cart items */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-foreground">
          Your cart ({items.length})
        </h2>
        {items.map((item) => (
          <ReviewItem
            key={item.id}
            item={item}
            reference={itemNotes[item.productId]?.reference ?? ""}
            notes={itemNotes[item.productId]?.notes ?? ""}
            removing={removingId === item.id}
            onReferenceChange={(value) =>
              setItemNote(item.productId, "reference", value)
            }
            onNotesChange={(value) =>
              setItemNote(item.productId, "notes", value)
            }
            onRemove={() => handleRemove(item)}
          />
        ))}
      </div>
    </div>
  );
}
