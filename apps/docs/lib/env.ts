// Resolves the public Storybook URL with a sensible default.
// Override via NEXT_PUBLIC_STORYBOOK_URL (e.g. http://localhost:6006 for local Storybook).
const FALLBACK_STORYBOOK_URL = 'https://storybook-clarity-nivoda.vercel.app';
const configured = process.env.NEXT_PUBLIC_STORYBOOK_URL?.trim();
// Guard: the retired storybook.clarity.nivoda.com host no longer resolves (DNS dead).
// Ignore it if it's still set as a build-time env var in production, so embeds
// always fall back to the live Vercel-hosted Storybook.
export const STORYBOOK_URL =
  configured && !configured.includes('clarity.nivoda.com') ? configured : FALLBACK_STORYBOOK_URL;
