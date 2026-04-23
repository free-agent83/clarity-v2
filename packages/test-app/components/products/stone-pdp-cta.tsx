"use client";

import { useState } from "react";
import {
  IconCheck,
  IconShoppingCartPlus,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@nivoda/components";

import { useCartStore, type CartItem } from "@/hooks/use-cart-store";

export type StonePdpCtaProps = {
  product: Omit<CartItem, "id">;
};

export function StonePdpCta({ product }: StonePdpCtaProps) {
  const [hovering, setHovering] = useState(false);
  const isInCart = useCartStore((s) =>
    s.items.some((i) => i.productId === product.productId),
  );
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);

  if (isInCart) {
    return (
      <Button
        className="w-full"
        size="lg"
        variant={hovering ? "destructive" : "default"}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={() => {
          removeItem(product.productId);
          setHovering(false);
          toast("Removed from cart");
        }}
      >
        {hovering ? (
          <>
            Remove from cart
            <IconX size={16} />
          </>
        ) : (
          <>
            In cart
            <IconCheck size={16} />
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      className="w-full"
      size="lg"
      onClick={() => {
        addItem(product);
        toast("Added to cart");
      }}
    >
      Add to cart
      <IconShoppingCartPlus size={16} />
    </Button>
  );
}
