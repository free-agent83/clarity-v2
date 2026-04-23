"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@nivoda/components";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@nivoda/components";
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
import { Input } from "@nivoda/components";
import {
  IconArrowLeft,
  IconDots,
  IconTrash,
  IconShoppingCartPlus,
  IconDiamond,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useShortlistsState } from "@/hooks/use-shortlists-state";
import type { ShortlistItem } from "@/hooks/use-shortlists-state";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(price: number) {
  return "$" + price.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function RenameDialog({
  open,
  onOpenChange,
  currentName,
  onRename,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onRename: (name: string) => void;
}) {
  const [name, setName] = useState(currentName);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onRename(trimmed);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename shortlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!name.trim()}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ItemRow({
  item,
  onRemove,
}: {
  item: ShortlistItem;
  onRemove: () => void;
}) {
  return (
    <TableRow>
      <TableCell className="w-14">
        <Link href={item.href}>
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
            <IconDiamond className="size-4 text-muted-foreground/50" />
          </div>
        </Link>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        <Link href={item.href}>{item.stockId}</Link>
      </TableCell>
      <TableCell className="max-w-md">
        <Link href={item.href} className="block">
          <span className="text-sm font-medium text-foreground">
            {item.title}
          </span>
          <br />
          <span className="text-sm text-muted-foreground">{item.specs}</span>
        </Link>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {item.category}
      </TableCell>
      <TableCell className="text-right text-sm font-semibold text-foreground">
        {formatPrice(item.price)}
      </TableCell>
      <TableCell className="w-20">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              toast("Added to cart");
            }}
          >
            <IconShoppingCartPlus className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              onRemove();
              toast("Removed from shortlist");
            }}
          >
            <IconTrash className="size-4 text-muted-foreground" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function ShortlistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getShortlist, renameShortlist, deleteShortlist, removeItem } =
    useShortlistsState();
  const shortlist = getShortlist(id);
  const [renameOpen, setRenameOpen] = useState(false);

  if (!shortlist) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-lg font-medium text-foreground">
          Shortlist not found
        </p>
        <Button variant="outline" asChild>
          <Link href="/buyer/shortlists">
            <IconArrowLeft className="size-4" />
            Back to shortlists
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-32">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/buyer/shortlists"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <IconArrowLeft className="size-4" />
          Back to shortlists
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-medium leading-14 text-foreground">
              {shortlist.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {shortlist.items.length}{" "}
              {shortlist.items.length === 1 ? "item" : "items"} · Created{" "}
              {formatDate(shortlist.createdAt)}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <IconDots className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setRenameOpen(true)}>
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  deleteShortlist(id);
                  toast("Shortlist deleted");
                  router.push("/buyer/shortlists");
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Data grid or empty state */}
      {shortlist.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <p className="text-lg font-medium text-foreground">
            This shortlist is empty
          </p>
          <p className="text-sm text-muted-foreground">
            Browse products to add items to this shortlist.
          </p>
          <Button variant="outline" asChild>
            <Link href="/buyer">Browse products</Link>
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14" />
              <TableHead>Internal Ref</TableHead>
              <TableHead className="max-w-md">Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {shortlist.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onRemove={() => removeItem(id, item.id)}
              />
            ))}
          </TableBody>
        </Table>
      )}

      <RenameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        currentName={shortlist.name}
        onRename={(name) => renameShortlist(id, name)}
      />
    </div>
  );
}
