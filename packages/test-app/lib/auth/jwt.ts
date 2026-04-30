import { SignJWT, jwtVerify } from "jose";
import { authConfig, COOKIE_MAX_AGE } from "./config";

function getSecret(): Uint8Array {
  return new TextEncoder().encode(authConfig.jwtSecret);
}

export async function signToken(payload: { sub: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifyToken(
  token: string,
): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return { sub: payload.sub as string };
  } catch {
    return null;
  }
}
