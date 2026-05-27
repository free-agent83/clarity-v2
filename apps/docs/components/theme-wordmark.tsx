import { twMerge } from 'tailwind-merge';

type ThemeWordmarkProps = {
  className?: string;
};

/** Nivoda wordmark — black on light surfaces, white on dark (see /docs/brand/logo). */
export function ThemeWordmark({ className }: ThemeWordmarkProps) {
  const classes = twMerge('w-auto', className);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/wordmark-black.svg"
        alt="Nivoda"
        className={twMerge(classes, 'dark:hidden')}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/wordmark-white.svg"
        alt=""
        aria-hidden
        className={twMerge(classes, 'hidden dark:block')}
      />
    </>
  );
}
