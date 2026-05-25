import { HARDCODED_USER } from "@/fixtures/user";
import { simulateLatency } from "./_simulate";
import type { Address } from "@/fixtures/types/user";

export type { Address };

export async function fetchAddresses(_userId: string): Promise<Address[]> {
  await simulateLatency();
  return HARDCODED_USER.addresses;
}

export async function fetchAddress(id: string): Promise<Address | undefined> {
  await simulateLatency();
  return HARDCODED_USER.addresses.find((a) => a.id === id);
}
