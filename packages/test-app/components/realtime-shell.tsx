"use client";

import { type ReactNode } from "react";
import { RealtimeProvider } from "@/components/realtime-provider";
import { RealtimeStatus } from "@/components/realtime-status";
import { BroadcastListener } from "@/components/broadcast-listener";

export function RealtimeShell({ children }: { children: ReactNode }) {
  return (
    <RealtimeProvider>
      {children}
      <RealtimeStatus />
      <BroadcastListener />
    </RealtimeProvider>
  );
}
