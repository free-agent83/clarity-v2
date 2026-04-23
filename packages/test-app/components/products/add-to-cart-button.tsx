"use client";

import { useState } from "react";
import { IconCheck, IconShoppingCartPlus, IconX } from "@tabler/icons-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useCartStore, type CartItem } from "@/hooks/use-cart-store";

interface AddToCartButtonProps {
  product: Omit<CartItem, "id">;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isInCart = useCartStore((s) =>
    s.items.some((i) => i.productId === product.productId),
  );
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);

  if (isInCart) {
    return (
      <button
        type="button"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          removeItem(product.productId);
          setIsHovered(false);
          toast("Removed from cart");
        }}
        className={cn(
          "flex h-15 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors",
          isHovered
            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            : "bg-emerald-600 text-white hover:bg-emerald-700",
        )}
      >
        {isHovered ? (
          <>
            Remove from cart
            <IconX size={20} />
          </>
        ) : (
          <>
            In cart
            <IconCheck size={20} />
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        addItem(product);
        toast("Added to cart");
      }}
      className="flex h-15 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-medium text-background transition-colors hover:bg-foreground/90"
    >
      Add to cart
      <IconShoppingCartPlus size={20} />
    </button>
  );
}
