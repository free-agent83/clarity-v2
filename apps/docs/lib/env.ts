// Resolves the public Storybook URL with a sensible default.
// Override via NEXT_PUBLIC_STORYBOOK_URL (e.g. http://localhost:6006 for local Storybook).
export const STORYBOOK_URL =
  process.env.NEXT_PUBLIC_STORYBOOK_URL ?? 'https://storybook-clarity-nivoda.vercel.app';
