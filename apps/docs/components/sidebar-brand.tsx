/** Sidebar / nav header brand — left-aligned ClarityAI V2.0.1. */
export function SidebarBrand() {
  return (
    <span
      data-sidebar-brand
      className="flex flex-col min-w-0 leading-none"
    >
      <span
        className="text-xl font-normal tracking-normal text-fd-foreground"
        style={{ fontFamily: 'var(--font-nanum), serif' }}
      >
        ClarityAI{' '}
        <span className="text-base">V2.0.1</span>
      </span>
    </span>
  );
}
