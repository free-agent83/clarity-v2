"use client";

import { createContext, useContext } from "react";
import type { AppUser } from "@/fixtures/types/user";
import { HARDCODED_USER } from "@/fixtures/user";

const UserContext = createContext<AppUser>(HARDCODED_USER);

export function UserProvider({ children }: { children: React.ReactNode }) {
  return (
    <UserContext.Provider value={HARDCODED_USER}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): AppUser {
  return useContext(UserContext);
}
