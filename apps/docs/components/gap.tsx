interface GapProps {
  /** One-line summary of what is missing. */
  children: React.ReactNode;
}

export function Gap({ children }: GapProps) {
  return (
    <aside
      className="my-6 rounded-md border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm flex gap-3"
      role="note"
      aria-label="Documentation gap"
    >
      <span className="font-mono text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 pt-0.5">
        Gap
      </span>
      <span className="text-fd-foreground/90">{children}</span>
    </aside>
  );
}
