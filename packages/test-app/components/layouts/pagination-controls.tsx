"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@nivoda/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nivoda/components";

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  perPage: number;
  perPageOptions: number[];
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
};

function PaginationUI({
  currentPage,
  totalPages,
  perPage,
  perPageOptions,
  navigate,
}: {
  currentPage: number;
  totalPages: number;
  perPage: number;
  perPageOptions: number[];
  navigate: (page: number, newPerPage?: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Results per page:</span>
      <Select
        value={String(perPage)}
        onValueChange={(value) => navigate(1, Number(value))}
      >
        <SelectTrigger className="h-11.25">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {perPageOptions.map((option) => (
            <SelectItem key={option} value={String(option)}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="secondary"
        size="lg"
        className="h-11.25 w-21.25"
        disabled={currentPage <= 1}
        onClick={() => navigate(currentPage - 1)}
      >
        Previous
      </Button>
      <span className="text-sm">
        <span className="text-muted-foreground">Page </span>
        <span className="font-semibold text-foreground">{currentPage}</span>
        <span className="text-muted-foreground"> of </span>
        <span className="font-semibold text-foreground">{totalPages}</span>
      </span>
      <Button
        variant="secondary"
        size="lg"
        className="h-11.25 w-21.25"
        disabled={currentPage >= totalPages}
        onClick={() => navigate(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );
}

function UrlPaginationControls({
  currentPage,
  totalPages,
  perPage,
  perPageOptions,
}: Omit<PaginationControlsProps, "onPageChange" | "onPerPageChange">) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(page: number, newPerPage?: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    params.set("perPage", String(newPerPage ?? perPage));
    router.push(`?${params.toString()}`);
  }

  return (
    <PaginationUI
      currentPage={currentPage}
      totalPages={totalPages}
      perPage={perPage}
      perPageOptions={perPageOptions}
      navigate={navigate}
    />
  );
}

export function PaginationControls({
  currentPage,
  totalPages,
  perPage,
  perPageOptions,
  onPageChange,
  onPerPageChange,
}: PaginationControlsProps) {
  if (onPageChange) {
    return (
      <PaginationUI
        currentPage={currentPage}
        totalPages={totalPages}
        perPage={perPage}
        perPageOptions={perPageOptions}
        navigate={(page, newPerPage) => {
          if (newPerPage != null) onPerPageChange?.(newPerPage);
          onPageChange(page);
        }}
      />
    );
  }

  return (
    <UrlPaginationControls
      currentPage={currentPage}
      totalPages={totalPages}
      perPage={perPage}
      perPageOptions={perPageOptions}
    />
  );
}
