import { HARDCODED_USER } from "@/fixtures/user";
import type { AppUser } from "@/fixtures/types/user";

export type { AppUser };

export async function getCurrentUser(): Promise<AppUser> {
  return HARDCODED_USER;
}
