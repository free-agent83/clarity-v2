"use client";

import { useEffect, useState, useCallback, useContext, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { RealtimeContext } from "@/components/realtime-provider";

export function useRealtimeSync<T>(
  initialData: T,
  table: string,
  refetchFn: () => Promise<T>,
): T {
  const [data, setData] = useState<T>(initialData);
  const { setIsConnected, incrementSyncing, decrementSyncing } =
    useContext(RealtimeContext);
  const refetchRef = useRef(refetchFn);
  refetchRef.current = refetchFn;

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        async () => {
          incrementSyncing();
          try {
            const fresh = await refetchRef.current();
            setData(fresh);
          } finally {
            decrementSyncing();
          }
        },
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, setIsConnected, incrementSyncing, decrementSyncing]);

  return data;
}
