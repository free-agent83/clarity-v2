import { HARDCODED_USER } from "@/fixtures/user";
import type { AppUser } from "@/fixtures/types/user";

export function getCurrentUserServer(): AppUser {
  return HARDCODED_USER;
}
