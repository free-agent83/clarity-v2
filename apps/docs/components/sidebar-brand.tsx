/** Sidebar / nav header brand — left-aligned Clarity V2.0.1 + BY NIVODA mono. */
export function SidebarBrand() {
  return (
    <span
      data-sidebar-brand
      className="flex flex-col min-w-0 leading-none gap-0.5"
    >
      <span
        className="text-xl font-normal tracking-normal text-fd-foreground"
        style={{ fontFamily: 'var(--font-nanum), serif' }}
      >
        Clarity{' '}
        <span className="text-base">V2.0.1</span>
      </span>
      <span
        className="text-[10px] uppercase tracking-widest text-fd-muted-foreground"
        style={{ fontFamily: 'var(--font-mono), monospace' }}
      >
        By Nivoda
      </span>
    </span>
  );
}
