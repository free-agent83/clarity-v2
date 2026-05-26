/** Shared DocsPage slot overrides for all doc routes. */
export const docsTableOfContent = {
  container: {
    className: [
      /* Active link colour */
      '[&_a.prose[data-active=true]]:!text-fd-foreground [&_a.prose[data-active=true]_a]:!text-inherit',
      /* Hug content — override fumadocs' full-column h-[calc(...)] */
      '!h-auto !max-h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1)-2*var(--spacing-4))] !self-start',
      '!pt-8 !pb-8 !pe-4 !ps-8',
      /* Let the card scroll as a unit; keep Fumadocs py-3 on scroll area (title → list gap) */
      '[&_[class*="overflow-auto"]]:!overflow-visible [&_[class*="overflow-auto"]]:![mask-image:none] [&_[class*="overflow-auto"]]:!min-h-0',
    ].join(' '),
  },
} as const;

/** Active sidebar links: foreground at rest, no fill. Hover styles in docs-layout.css. */
export const docsSidebar = {
  className:
    '[&_a[data-active=true]]:!text-fd-foreground [&_a[data-active=true]]:!bg-transparent [&_a[data-active=true]]:!rounded-none',
} as const;

/** Current page crumb: white text instead of fumadocs' text-fd-primary. */
export const docsBreadcrumb = {
  className: 'docs-breadcrumb',
} as const;

/** Prev/next page links — elevated card surfaces in both themes. */
export const docsFooter = {
  className: 'docs-page-footer',
} as const;
