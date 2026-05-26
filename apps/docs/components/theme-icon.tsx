import { twMerge } from 'tailwind-merge';

type ThemeIconProps = {
  className?: string;
};

/** Nivoda icon — black on light surfaces, white on dark (see /docs/brand/logo). */
export function ThemeIcon({ className }: ThemeIconProps) {
  const classes = twMerge('w-auto shrink-0', className);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/icon-black.svg"
        alt=""
        aria-hidden
        className={twMerge(classes, 'dark:hidden')}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/icon-white.svg"
        alt=""
        aria-hidden
        className={twMerge(classes, 'hidden dark:block')}
      />
    </>
  );
}
