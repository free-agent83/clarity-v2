"use client";

import * as React from "react";
import { IconDots, IconEdit, IconTrash } from "@tabler/icons-react";
import { Button } from "@nivoda/components";
import { Checkbox } from "@nivoda/components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@nivoda/components";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@nivoda/components";

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface AdminDataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  extraActions?: (row: T) => React.ReactNode;
}

export function AdminDataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  onEdit,
  onDelete,
  extraActions,
}: AdminDataTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox disabled aria-label="Select all" />
          </TableHead>
          {columns.map((col) => (
            <TableHead
              key={String(col.accessorKey ?? col.header)}
              className={col.className}
            >
              {col.header}
            </TableHead>
          ))}
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length + 2}
              className="py-12 text-center text-muted-foreground"
            >
              No results found.
            </TableCell>
          </TableRow>
        ) : (
          data.map((row) => (
            <TableRow
              key={row.id}
              className={onRowClick ? "cursor-pointer" : undefined}
              onClick={() => onRowClick?.(row)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox disabled aria-label="Select row" />
              </TableCell>

              {columns.map((col) => (
                <TableCell
                  key={String(col.accessorKey ?? col.header)}
                  className={col.className}
                >
                  {col.cell
                    ? col.cell(row)
                    : col.accessorKey != null
                      ? String(row[col.accessorKey] ?? "")
                      : null}
                </TableCell>
              ))}

              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Row actions"
                    >
                      <IconDots />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(row)}>
                        <IconEdit />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {extraActions?.(row)}
                    {onDelete && (
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDelete(row)}
                      >
                        <IconTrash />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
