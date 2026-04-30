"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { authConfig, COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/auth/config";
import { signToken } from "@/lib/auth/jwt";

export async function login(
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const next = (formData.get("next") as string | null) || "/buyer/";

  if (email !== authConfig.username || password !== authConfig.password) {
    return { error: "Invalid email or password." };
  }

  const token = await signToken({ sub: email });

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  redirect(next);
}
