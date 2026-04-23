"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { currencies } from "@/db/schema/lookups";
import { createClient } from "@/lib/supabase/server";

const COMPANY_NAMES = [
  "Diamond & Co.",
  "Prestige Gems Ltd.",
  "Crown Jewellers",
  "Brilliance Fine Jewellery",
  "Azure Diamonds",
  "Sterling Stone Co.",
  "Radiant Luxe",
  "Heritage Gems",
  "Lumina Jewellers",
  "Sapphire & Gold",
];

function randomCompanyName() {
  return COMPANY_NAMES[Math.floor(Math.random() * COMPANY_NAMES.length)];
}

function randomPhone() {
  const digits = Array.from({ length: 10 }, () =>
    Math.floor(Math.random() * 10),
  ).join("");
  return `+1${digits}`;
}

async function ensureUserRow(authUserId: string, email: string, name: string) {
  const existing = await db.query.users.findFirst({
    where: eq(users.authUserId, authUserId),
  });

  if (existing) return;

  const usdCurrency = await db.query.currencies.findFirst({
    where: eq(currencies.value, "USD"),
  });

  if (!usdCurrency) {
    throw new Error("USD currency not found in lookup table");
  }

  await db.insert(users).values({
    authUserId,
    email,
    name,
    companyName: randomCompanyName(),
    phone: randomPhone(),
    currencyId: usdCurrency.id,
  });
}

export async function login(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const next = formData.get("next") as string | null;

  const supabase = await createClient();

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const authUser = data.user;
  const name =
    authUser.user_metadata?.full_name ||
    authUser.user_metadata?.name ||
    email.split("@")[0];

  await ensureUserRow(authUser.id, email, name);

  redirect(next || "/buyer/");
}
