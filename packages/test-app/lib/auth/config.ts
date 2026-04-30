export const authConfig = {
  username: process.env.AUTH_USERNAME ?? "demo@minivoda.test",
  password: process.env.AUTH_PASSWORD ?? "demo",
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-not-for-production",
} as const;

export const COOKIE_NAME = "minivoda_jwt";
export const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours
