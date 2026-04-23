"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nivoda/components";
import type { AdminUserItem } from "@/lib/api/admin/users";

interface UserSwitcherProps {
  users: AdminUserItem[];
  currentUserId?: string;
}

export function UserSwitcher({ users, currentUserId }: UserSwitcherProps) {
  const [selectedUserId, setSelectedUserId] = useState(
    currentUserId ?? users[0]?.id ?? "",
  );

  function handleChange(userId: string) {
    setSelectedUserId(userId);
    try {
      const channel = new BroadcastChannel("minivoda-admin");
      channel.postMessage({ type: "user-switched", userId });
      channel.close();
    } catch {
      // BroadcastChannel not supported
    }
  }

  const selected = users.find((u) => u.id === selectedUserId);

  return (
    <Select value={selectedUserId} onValueChange={handleChange}>
      <SelectTrigger className="w-56">
        <SelectValue>
          {selected ? (selected.name ?? selected.email) : "Select user..."}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            <div className="flex flex-col">
              <span>{user.name ?? user.email}</span>
              {user.name && (
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
