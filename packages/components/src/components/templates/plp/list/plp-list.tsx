"use client";

import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../organisms/table/table";
import type { GridItemData, ListColumn } from "../plp-types";
import { PlpListRow } from "./plp-list-row";

/**
 * List view container — a table of items with sticky header.
 *
 * Renders fixed core columns around category-configured middle columns.
 * The Price/ct column is conditionally rendered when at least one item in
 * the current page has per-carat pricing data.
 *
 * No sticky columns — horizontal overflow scrolls normally in the
 * underlying Table organism.
 */
export function PlpList<TItem>({
  items,
  renderGridItem,
  listColumns,
  onItemClick,
}: {
  items: TItem[];
  renderGridItem: (item: TItem) => GridItemData;
  listColumns: ListColumn<TItem>[];
  onItemClick?: (item: TItem) => void;
}) {
  const rows = useMemo(
    () => items.map((item) => ({ item, data: renderGridItem(item) })),
    [items, renderGridItem]
  );

  const showPricePerCarat = useMemo(
    () => rows.some(({ data }) => !!data.pricing.perCarat),
    [rows]
  );

  return (
    <div className="overflow-hidden rounded-lg border border-border">
    <Table data-slot="plp-list">
      <TableHeader className="sticky top-0 z-10 bg-background">
        <TableRow>
          <TableHead className="w-[72px]">
            <span className="sr-only">Thumbnail</span>
          </TableHead>
          <TableHead>Name</TableHead>
          {listColumns.map((column) => (
            <TableHead
              key={column.id}
              style={{
                textAlign: column.align ?? "left",
                width:
                  typeof column.width === "number"
                    ? `${column.width}px`
                    : column.width,
              }}
            >
              {column.header}
            </TableHead>
          ))}
          <TableHead>Delivery</TableHead>
          <TableHead>Returns</TableHead>
          <TableHead>Price</TableHead>
          {showPricePerCarat && <TableHead>Price/ct</TableHead>}
          <TableHead className="text-right">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(({ item, data }) => (
          <PlpListRow
            key={data.id}
            item={item}
            data={data}
            listColumns={listColumns}
            showPricePerCarat={showPricePerCarat}
            onItemClick={onItemClick}
          />
        ))}
      </TableBody>
    </Table>
    </div>
  );
}
