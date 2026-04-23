"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@nivoda/components";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@nivoda/components";
import { Input } from "@nivoda/components";
import { IconPlus, IconHeart, IconDiamond } from "@tabler/icons-react";
import { useShortlistsState } from "@/hooks/use-shortlists-state";
import type { Shortlist } from "@/hooks/use-shortlists-state";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

function ThumbnailMosaic({ items }: { items: Shortlist["items"] }) {
  if (items.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-t-lg border border-dashed border-border bg-muted">
        <IconHeart className="size-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid aspect-[4/3] grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-t-lg bg-muted">
      {Array.from({ length: 4 }).map((_, i) =>
        i < items.length ? (
          <div key={i} className="flex items-center justify-center bg-muted/80">
            <IconDiamond className="size-5 text-muted-foreground/50" />
          </div>
        ) : (
          <div key={i} className="bg-muted" />
        ),
      )}
    </div>
  );
}

function ShortlistCard({ shortlist }: { shortlist: Shortlist }) {
  return (
    <Link
      href={`/buyer/shortlists/${shortlist.id}`}
      className="group rounded-lg border border-border bg-background transition-colors hover:bg-muted/50"
    >
      <ThumbnailMosaic items={shortlist.items} />
      <div className="p-4">
        <h3 className="text-sm font-semibold text-foreground">
          {shortlist.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {shortlist.items.length}{" "}
          {shortlist.items.length === 1 ? "item" : "items"} ·{" "}
          {formatDate(shortlist.createdAt)}
        </p>
      </div>
    </Link>
  );
}

function CreateShortlistDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setName(""), 150);
      return () => clearTimeout(t);
    }
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New shortlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Input
              placeholder="e.g. Wedding Collection"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!name.trim()}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ShortlistsPage() {
  const { shortlists, createShortlist } = useShortlistsState();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-medium leading-14 text-foreground">
            Shortlists
          </h1>
          <p className="text-sm text-muted-foreground">
            {shortlists.length} {shortlists.length === 1 ? "list" : "lists"}
          </p>
        </div>
        <Button variant="outline" size="lg" onClick={() => setDialogOpen(true)}>
          <IconPlus className="size-5" />
          New shortlist
        </Button>
      </div>

      {/* Card grid or empty state */}
      {shortlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <IconHeart className="size-12 text-muted-foreground" />
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">
              No shortlists yet
            </p>
            <p className="text-sm text-muted-foreground">
              Create your first shortlist to start saving items.
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <IconPlus className="size-4" />
            New shortlist
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shortlists.map((sl) => (
            <ShortlistCard key={sl.id} shortlist={sl} />
          ))}
        </div>
      )}

      <CreateShortlistDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreate={createShortlist}
      />
    </div>
  );
}
