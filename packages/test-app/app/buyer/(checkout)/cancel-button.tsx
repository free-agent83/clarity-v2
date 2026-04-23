"use client";

import { useRouter } from "next/navigation";
import { IconX } from "@tabler/icons-react";

export function CancelButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      Cancel
      <IconX size={20} />
    </button>
  );
}
