"use client";

import { useContext, useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RealtimeContext } from "@/components/realtime-provider";
import { IconCheck, IconLoader2, IconUser } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  fetchSwitchableUsers,
  switchToUser,
  type SwitchableUser,
} from "@/app/buyer/(shop)/switch-user";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nivoda/components";

export function RealtimeStatus() {
  const { isConnected, isSyncing } = useContext(RealtimeContext);
  const router = useRouter();
  const [users, setUsers] = useState<SwitchableUser[]>([]);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [isSwitching, startTransition] = useTransition();
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    fetchSwitchableUsers().then(setUsers);

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setCurrentEmail(data.user?.email ?? null);
    });
  }, []);

  async function handleSwitch(userId: string) {
    startTransition(async () => {
      const result = await switchToUser(userId);
      if ("error" in result) {
        console.error("Switch user failed:", result.error);
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        token_hash: result.tokenHash,
        type: result.type,
      });

      if (error) {
        console.error("OTP verification failed:", error.message);
        return;
      }

      const { data } = await supabase.auth.getUser();
      setCurrentEmail(data.user?.email ?? null);
      setPopoverOpen(false);
      router.refresh();
    });
  }

  const currentUser = users.find((u) => u.email === currentEmail);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-full border bg-background px-4 py-2 text-xs shadow-sm">
      {/* Connection status */}
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "inline-block h-2 w-2 rounded-full",
            isConnected ? "animate-pulse bg-green-500" : "bg-amber-500",
          )}
        />
        <span className="text-muted-foreground">
          {isConnected ? "Database live" : "Connecting..."}
        </span>
      </div>

      {/* Sync status */}
      <div className="flex items-center gap-1.5">
        {isSyncing || isSwitching ? (
          <>
            <IconLoader2 size={12} className="animate-spin text-green-500" />
            <span className="text-muted-foreground">
              {isSwitching ? "Switching..." : "Syncing..."}
            </span>
          </>
        ) : (
          <>
            <IconCheck size={12} className="text-green-500" />
            <span className="text-muted-foreground">Data synced</span>
          </>
        )}
      </div>

      {/* User switcher */}
      {users.length > 0 && (
        <>
          <div className="h-3 w-px bg-border" />
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground">
                <IconUser size={12} />
                <span>{currentUser?.name ?? currentEmail ?? "..."}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              side="top"
              className="w-56 p-1"
              sideOffset={8}
            >
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSwitch(user.id)}
                  disabled={isSwitching}
                  className={cn(
                    "flex w-full flex-col rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                    user.email === currentEmail && "bg-chart-2/10 text-chart-2",
                  )}
                >
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  );
}
