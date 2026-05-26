/** Sidebar / nav header brand — Clarity primary, BY NIVODA attribution. */
export function SidebarBrand() {
  return (
    <span
      data-sidebar-brand
      className="flex w-full min-w-0 items-center justify-between gap-3"
    >
      <span
        className="shrink-0 text-xl font-bold tracking-normal"
        style={{ fontFamily: 'var(--font-nanum), serif' }}
      >
        Clarity
      </span>
      <span
        className="shrink-0 text-xs uppercase tracking-wide text-fd-muted-foreground"
        style={{ fontFamily: 'var(--font-mono), monospace' }}
      >
        by Nivoda
      </span>
    </span>
  );
}
