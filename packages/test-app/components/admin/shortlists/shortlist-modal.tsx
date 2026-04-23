"use client";

import * as React from "react";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ProductCombobox,
  type ProductOption,
} from "@/components/admin/product-combobox";
import type { AdminShortlistDetail } from "@/lib/api/admin/shortlists";
import type { CreateShortlistInput } from "@/lib/api/admin/shortlists";
import type { AdminUserItem } from "@/lib/api/admin/users";

interface ShortlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortlist?: AdminShortlistDetail;
  users: AdminUserItem[];
  products: ProductOption[];
  onSave: (data: CreateShortlistInput) => Promise<void>;
  defaultUserId?: string;
}

interface ItemRow {
  productId: string;
}

export function ShortlistModal({
  open,
  onOpenChange,
  shortlist,
  users,
  products,
  onSave,
  defaultUserId,
}: ShortlistModalProps) {
  const [userId, setUserId] = React.useState("");
  const [name, setName] = React.useState("");
  const [items, setItems] = React.useState<ItemRow[]>([]);
  const [saving, setSaving] = React.useState(false);

  // Reset form when dialog opens / shortlist changes
  React.useEffect(() => {
    if (!open) return;

    if (shortlist) {
      setUserId(shortlist.userId);
      setName(shortlist.name);
      setItems(shortlist.items.map((i) => ({ productId: i.productId })));
    } else {
      setUserId(defaultUserId ?? "");
      setName("");
      setItems([]);
    }
  }, [open, shortlist, defaultUserId]);

  function addItem() {
    setItems((prev) => [...prev, { productId: "" }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, productId: string) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { productId } : item)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const data: CreateShortlistInput = {
        userId,
        name,
        items: items.filter((i) => i.productId),
      };

      await onSave(data);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {shortlist ? "Edit Shortlist" : "Create Shortlist"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Core fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="shortlist-user">User</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger id="shortlist-user">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name ?? u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="shortlist-name">Name</Label>
              <Input
                id="shortlist-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Wedding Collection"
                required
              />
            </div>
          </div>

          {/* Items */}
          <Separator />
          <div className="flex flex-col gap-3">
            <Label className="text-base font-medium">Items</Label>
            {items.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <Separator />}
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <ProductCombobox
                      products={products}
                      value={item.productId || null}
                      onChange={(productId, _product) =>
                        updateItem(index, productId)
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeItem(index)}
                  >
                    <IconTrash />
                  </Button>
                </div>
              </React.Fragment>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={addItem}
            >
              <IconPlus />
              Add item
            </Button>
          </div>

          {/* Footer */}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
