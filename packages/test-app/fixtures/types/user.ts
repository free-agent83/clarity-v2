export interface Address {
  id: string;
  kind: "billing" | "shipping";
  name: string;
  street: string;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
  companyName: string | null;
  phone: string | null;
  verified: boolean;
  currency: string;
  role: "admin" | "buyer";
  addresses: Address[];
}
