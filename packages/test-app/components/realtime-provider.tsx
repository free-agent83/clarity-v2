"use client";

import { createContext, useState, useCallback, type ReactNode } from "react";

interface RealtimeState {
  isConnected: boolean;
  isSyncing: boolean;
  setIsConnected: (v: boolean) => void;
  setIsSyncing: (v: boolean) => void;
  incrementSyncing: () => void;
  decrementSyncing: () => void;
}

export const RealtimeContext = createContext<RealtimeState>({
  isConnected: false,
  isSyncing: false,
  setIsConnected: () => {},
  setIsSyncing: () => {},
  incrementSyncing: () => {},
  decrementSyncing: () => {},
});

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [syncCount, setSyncCount] = useState(0);

  const incrementSyncing = useCallback(() => setSyncCount((c) => c + 1), []);
  const decrementSyncing = useCallback(
    () => setSyncCount((c) => Math.max(0, c - 1)),
    [],
  );

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        isSyncing: syncCount > 0,
        setIsConnected,
        setIsSyncing: (v) => setSyncCount(v ? 1 : 0),
        incrementSyncing,
        decrementSyncing,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}
