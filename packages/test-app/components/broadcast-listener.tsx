"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function BroadcastListener() {
  const router = useRouter();

  useEffect(() => {
    let channel: BroadcastChannel | null = null;

    try {
      channel = new BroadcastChannel("minivoda-admin");
      channel.onmessage = async (event) => {
        if (event.data?.type === "user-switched") {
          // For now, just refresh the page to pick up the new session
          // Full impersonation (via the /api/v1/admin/impersonate endpoint)
          // will be wired in a future iteration
          router.refresh();
        }
      };
    } catch {
      // BroadcastChannel not supported
    }

    return () => {
      channel?.close();
    };
  }, [router]);

  return null;
}
