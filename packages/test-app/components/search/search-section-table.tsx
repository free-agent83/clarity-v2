"use client";

import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";

type Column = {
  key: string;
  label: string;
  className?: string;
};

type Row = {
  id: string;
  href: string;
  cells: Record<string, React.ReactNode>;
};

type SearchSectionTableProps = {
  title: string;
  count: number;
  columns: Column[];
  rows: Row[];
};

export function SearchSectionTable({
  title,
  count,
  columns,
  rows,
}: SearchSectionTableProps) {
  if (rows.length === 0) return null;

  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-xl font-medium leading-8 text-foreground">
        {title} ({count})
      </h2>
      <div className="overflow-hidden rounded-xl border border-border">
        {/* Header */}
        <div className="flex items-center gap-5 border-b border-muted bg-background px-4 py-3">
          {columns.map((col) => (
            <div key={col.key} className={col.className ?? "flex-1"}>
              <span className="text-sm text-muted-foreground">{col.label}</span>
            </div>
          ))}
          {/* Spacer for chevron */}
          <div className="w-6" />
        </div>

        {/* Rows */}
        {rows.map((row) => (
          <Link
            key={row.id}
            href={row.href}
            className="flex items-center gap-5 border-b border-muted px-4 py-5 transition-colors last:border-b-0 hover:bg-muted/50"
          >
            {columns.map((col) => (
              <div key={col.key} className={col.className ?? "flex-1"}>
                {row.cells[col.key]}
              </div>
            ))}
            <IconChevronRight
              size={20}
              className="shrink-0 text-muted-foreground"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
