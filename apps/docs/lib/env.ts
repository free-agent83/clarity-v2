// Resolves the public Storybook URL with a sensible default for local development.
// In production, set NEXT_PUBLIC_STORYBOOK_URL to https://storybook.clarity.nivoda.com.
export const STORYBOOK_URL =
  process.env.NEXT_PUBLIC_STORYBOOK_URL ?? 'https://storybook.clarity.nivoda.com';
