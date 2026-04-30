import type { AppUser, Address } from "@/fixtures/types/user";

const BILLING: Address = {
  id: "addr-billing-001",
  kind: "billing",
  name: "Demo Buyer",
  street: "1 Demo Street, Suite 200",
  city: "London",
  state: null,
  postalCode: "EC1A 1BB",
  country: "United Kingdom",
  isDefault: true,
};

const SHIPPING: Address = {
  id: "addr-shipping-001",
  kind: "shipping",
  name: "Demo Buyer",
  street: "1 Demo Street, Suite 200",
  city: "London",
  state: null,
  postalCode: "EC1A 1BB",
  country: "United Kingdom",
  isDefault: true,
};

export const HARDCODED_USER: AppUser = {
  id: "user-001",
  email: "demo@minivoda.test",
  name: "Demo Buyer",
  companyName: "Minivoda Demo Co.",
  phone: "+44 20 7946 0100",
  verified: true,
  currency: "USD",
  role: "admin",
  addresses: [BILLING, SHIPPING],
};
