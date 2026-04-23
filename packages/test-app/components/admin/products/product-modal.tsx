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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { CreateProductInput } from "@/lib/api/admin/products";
import type { AdminSupplierItem } from "@/lib/api/admin/products";
import type { LookupItem } from "@/lib/api/admin/lookups";
import type { AllLookups } from "@/lib/api/admin/lookups";

// ---------------------------------------------------------------------------
// Category slug helper
// ---------------------------------------------------------------------------

const CATEGORY_SLUG_MAP: Record<string, string> = {
  "Natural Diamond": "natural_diamond",
  "Lab Grown Diamond": "lab_grown_diamond",
  Gemstone: "gemstone",
  "Natural Melee": "natural_melee",
  "Lab Grown Melee": "lab_grown_melee",
  "Engagement Ring": "engagement_ring",
  "Wedding Band": "wedding_band",
  "Tennis Bracelet": "tennis_bracelet",
};

function getCategorySlug(categoryId: string, categories: LookupItem[]): string {
  const cat = categories.find((c) => c.id === categoryId);
  if (!cat) return "";
  return CATEGORY_SLUG_MAP[cat.value] ?? "";
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MetalRow {
  metalId: string;
  priceUsd: number;
}

interface StoneRow {
  shapeId: string;
  maxCarat: number;
}

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lookups: AllLookups;
  suppliers: AdminSupplierItem[];
  onSave: (data: CreateProductInput) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProductModal({
  open,
  onOpenChange,
  lookups,
  suppliers,
  onSave,
}: ProductModalProps) {
  // Common fields
  const [categoryId, setCategoryId] = React.useState("");
  const [supplierId, setSupplierId] = React.useState("");
  const [stockId, setStockId] = React.useState("");
  const [priceUsd, setPriceUsd] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);

  // Diamond fields
  const [dLabGrown, setDLabGrown] = React.useState(false);
  const [dShapeId, setDShapeId] = React.useState("");
  const [dCarat, setDCarat] = React.useState("");
  const [dColorId, setDColorId] = React.useState("");
  const [dClarityId, setDClarityId] = React.useState("");
  const [dCutId, setDCutId] = React.useState("");
  const [dPolishId, setDPolishId] = React.useState("");
  const [dSymmetryId, setDSymmetryId] = React.useState("");
  const [dFluorescenceId, setDFluorescenceId] = React.useState("");
  const [dPricePerCarat, setDPricePerCarat] = React.useState("");
  const [dTablePct, setDTablePct] = React.useState("");
  const [dDepthPct, setDDepthPct] = React.useState("");
  const [dLengthMm, setDLengthMm] = React.useState("");
  const [dWidthMm, setDWidthMm] = React.useState("");
  const [dDepthMm, setDDepthMm] = React.useState("");

  // Gemstone fields
  const [gTypeId, setGTypeId] = React.useState("");
  const [gShapeId, setGShapeId] = React.useState("");
  const [gCarat, setGCarat] = React.useState("");
  const [gColor, setGColor] = React.useState("");
  const [gClarity, setGClarity] = React.useState("");
  const [gCutId, setGCutId] = React.useState("");
  const [gTreatmentId, setGTreatmentId] = React.useState("");
  const [gOriginId, setGOriginId] = React.useState("");
  const [gPricePerCarat, setGPricePerCarat] = React.useState("");
  const [gLengthMm, setGLengthMm] = React.useState("");
  const [gWidthMm, setGWidthMm] = React.useState("");
  const [gDepthMm, setGDepthMm] = React.useState("");

  // Melee fields
  const [mLabGrown, setMLabGrown] = React.useState(false);
  const [mShapeId, setMShapeId] = React.useState("");
  const [mSizeRange, setMSizeRange] = React.useState("");
  const [mColorRange, setMColorRange] = React.useState("");
  const [mClarityRange, setMClarityRange] = React.useState("");
  const [mCutId, setMCutId] = React.useState("");
  const [mQuantity, setMQuantity] = React.useState("");
  const [mTotalCaratWeight, setMTotalCaratWeight] = React.useState("");

  // Engagement ring fields
  const [erSku, setErSku] = React.useState("");
  const [erBandStyleId, setErBandStyleId] = React.useState("");
  const [erRingWidthMm, setErRingWidthMm] = React.useState("");
  const [erMetals, setErMetals] = React.useState<MetalRow[]>([]);
  const [erStones, setErStones] = React.useState<StoneRow[]>([]);

  // Wedding band fields
  const [wbSku, setWbSku] = React.useState("");
  const [wbBandStyleId, setWbBandStyleId] = React.useState("");
  const [wbRingWidthMm, setWbRingWidthMm] = React.useState("");
  const [wbMetals, setWbMetals] = React.useState<MetalRow[]>([]);

  // Tennis bracelet fields
  const [tbSku, setTbSku] = React.useState("");

  const [saving, setSaving] = React.useState(false);

  const categorySlug = getCategorySlug(categoryId, lookups.productCategories);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (!open) return;

    setCategoryId("");
    setSupplierId("");
    setStockId("");
    setPriceUsd("");
    setDescription("");
    setIsActive(true);
    // Diamond
    setDLabGrown(false);
    setDShapeId("");
    setDCarat("");
    setDColorId("");
    setDClarityId("");
    setDCutId("");
    setDPolishId("");
    setDSymmetryId("");
    setDFluorescenceId("");
    setDPricePerCarat("");
    setDTablePct("");
    setDDepthPct("");
    setDLengthMm("");
    setDWidthMm("");
    setDDepthMm("");
    // Gemstone
    setGTypeId("");
    setGShapeId("");
    setGCarat("");
    setGColor("");
    setGClarity("");
    setGCutId("");
    setGTreatmentId("");
    setGOriginId("");
    setGPricePerCarat("");
    setGLengthMm("");
    setGWidthMm("");
    setGDepthMm("");
    // Melee
    setMLabGrown(false);
    setMShapeId("");
    setMSizeRange("");
    setMColorRange("");
    setMClarityRange("");
    setMCutId("");
    setMQuantity("");
    setMTotalCaratWeight("");
    // Engagement ring
    setErSku("");
    setErBandStyleId("");
    setErRingWidthMm("");
    setErMetals([]);
    setErStones([]);
    // Wedding band
    setWbSku("");
    setWbBandStyleId("");
    setWbRingWidthMm("");
    setWbMetals([]);
    // Tennis bracelet
    setTbSku("");
  }, [open]);

  // Auto-set labGrown based on category
  React.useEffect(() => {
    if (categorySlug === "lab_grown_diamond") {
      setDLabGrown(true);
    } else if (categorySlug === "natural_diamond") {
      setDLabGrown(false);
    } else if (categorySlug === "lab_grown_melee") {
      setMLabGrown(true);
    } else if (categorySlug === "natural_melee") {
      setMLabGrown(false);
    }
  }, [categorySlug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const data: CreateProductInput = {
        supplierId,
        stockId,
        productCategoryId: categoryId,
        priceUsd: Number(priceUsd) || 0,
        description,
        isActive,
      };

      if (
        categorySlug === "natural_diamond" ||
        categorySlug === "lab_grown_diamond"
      ) {
        data.diamond = {
          labGrown: dLabGrown,
          shapeId: dShapeId,
          carat: Number(dCarat) || 0,
          colorId: dColorId,
          clarityId: dClarityId,
          cutId: dCutId,
          polishId: dPolishId,
          symmetryId: dSymmetryId,
          fluorescenceId: dFluorescenceId,
          pricePerCaratUsd: dPricePerCarat ? Number(dPricePerCarat) : undefined,
          tablePct: dTablePct ? Number(dTablePct) : undefined,
          depthPct: dDepthPct ? Number(dDepthPct) : undefined,
          lengthMm: dLengthMm ? Number(dLengthMm) : undefined,
          widthMm: dWidthMm ? Number(dWidthMm) : undefined,
          depthMm: dDepthMm ? Number(dDepthMm) : undefined,
        };
      } else if (categorySlug === "gemstone") {
        data.gemstone = {
          gemstoneTypeId: gTypeId,
          shapeId: gShapeId,
          carat: Number(gCarat) || 0,
          color: gColor,
          clarity: gClarity,
          cutId: gCutId,
          treatmentId: gTreatmentId,
          originId: gOriginId,
          pricePerCaratUsd: gPricePerCarat ? Number(gPricePerCarat) : undefined,
          lengthMm: gLengthMm ? Number(gLengthMm) : undefined,
          widthMm: gWidthMm ? Number(gWidthMm) : undefined,
          depthMm: gDepthMm ? Number(gDepthMm) : undefined,
        };
      } else if (
        categorySlug === "natural_melee" ||
        categorySlug === "lab_grown_melee"
      ) {
        data.melee = {
          labGrown: mLabGrown,
          shapeId: mShapeId,
          sizeRange: mSizeRange,
          colorRange: mColorRange,
          clarityRange: mClarityRange,
          cutId: mCutId,
          quantity: Number(mQuantity) || 0,
          totalCaratWeight: Number(mTotalCaratWeight) || 0,
        };
      } else if (categorySlug === "engagement_ring") {
        data.engagementRing = {
          sku: erSku,
          bandStyleId: erBandStyleId,
          ringWidthMm: erRingWidthMm ? Number(erRingWidthMm) : undefined,
          availableMetals: erMetals.filter((m) => m.metalId),
          compatibleStones: erStones.filter((s) => s.shapeId),
        };
      } else if (categorySlug === "wedding_band") {
        data.weddingBand = {
          sku: wbSku,
          bandStyleId: wbBandStyleId,
          ringWidthMm: wbRingWidthMm ? Number(wbRingWidthMm) : undefined,
          availableMetals: wbMetals.filter((m) => m.metalId),
        };
      } else if (categorySlug === "tennis_bracelet") {
        data.tennisBracelet = {
          sku: tbSku,
        };
      }

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
          <DialogTitle>Create Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Common fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="product-category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="product-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {lookups.productCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="product-supplier">Supplier</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger id="product-supplier">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="product-stock-id">Stock ID</Label>
              <Input
                id="product-stock-id"
                value={stockId}
                onChange={(e) => setStockId(e.target.value)}
                placeholder="e.g. D-12345"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="product-price">Price USD</Label>
              <Input
                id="product-price"
                type="number"
                step="0.01"
                min="0"
                value={priceUsd}
                onChange={(e) => setPriceUsd(e.target.value)}
              />
            </div>

            <div className="col-span-2 flex items-center gap-3">
              <Switch
                id="product-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="product-active">Active</Label>
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="product-description">Description</Label>
              <Textarea
                id="product-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Category-specific fields */}
          {categorySlug && (
            <>
              <Separator />

              {categorySlug === "natural_diamond" ||
              categorySlug === "lab_grown_diamond" ? (
                <DiamondFields
                  lookups={lookups}
                  shapeId={dShapeId}
                  onShapeId={setDShapeId}
                  carat={dCarat}
                  onCarat={setDCarat}
                  colorId={dColorId}
                  onColorId={setDColorId}
                  clarityId={dClarityId}
                  onClarityId={setDClarityId}
                  cutId={dCutId}
                  onCutId={setDCutId}
                  polishId={dPolishId}
                  onPolishId={setDPolishId}
                  symmetryId={dSymmetryId}
                  onSymmetryId={setDSymmetryId}
                  fluorescenceId={dFluorescenceId}
                  onFluorescenceId={setDFluorescenceId}
                  pricePerCarat={dPricePerCarat}
                  onPricePerCarat={setDPricePerCarat}
                  tablePct={dTablePct}
                  onTablePct={setDTablePct}
                  depthPct={dDepthPct}
                  onDepthPct={setDDepthPct}
                  lengthMm={dLengthMm}
                  onLengthMm={setDLengthMm}
                  widthMm={dWidthMm}
                  onWidthMm={setDWidthMm}
                  depthMm={dDepthMm}
                  onDepthMm={setDDepthMm}
                />
              ) : categorySlug === "gemstone" ? (
                <GemstoneFields
                  lookups={lookups}
                  typeId={gTypeId}
                  onTypeId={setGTypeId}
                  shapeId={gShapeId}
                  onShapeId={setGShapeId}
                  carat={gCarat}
                  onCarat={setGCarat}
                  color={gColor}
                  onColor={setGColor}
                  clarity={gClarity}
                  onClarity={setGClarity}
                  cutId={gCutId}
                  onCutId={setGCutId}
                  treatmentId={gTreatmentId}
                  onTreatmentId={setGTreatmentId}
                  originId={gOriginId}
                  onOriginId={setGOriginId}
                  pricePerCarat={gPricePerCarat}
                  onPricePerCarat={setGPricePerCarat}
                  lengthMm={gLengthMm}
                  onLengthMm={setGLengthMm}
                  widthMm={gWidthMm}
                  onWidthMm={setGWidthMm}
                  depthMm={gDepthMm}
                  onDepthMm={setGDepthMm}
                />
              ) : categorySlug === "natural_melee" ||
                categorySlug === "lab_grown_melee" ? (
                <MeleeFields
                  lookups={lookups}
                  shapeId={mShapeId}
                  onShapeId={setMShapeId}
                  sizeRange={mSizeRange}
                  onSizeRange={setMSizeRange}
                  colorRange={mColorRange}
                  onColorRange={setMColorRange}
                  clarityRange={mClarityRange}
                  onClarityRange={setMClarityRange}
                  cutId={mCutId}
                  onCutId={setMCutId}
                  quantity={mQuantity}
                  onQuantity={setMQuantity}
                  totalCaratWeight={mTotalCaratWeight}
                  onTotalCaratWeight={setMTotalCaratWeight}
                />
              ) : categorySlug === "engagement_ring" ? (
                <EngagementRingFields
                  lookups={lookups}
                  sku={erSku}
                  onSku={setErSku}
                  bandStyleId={erBandStyleId}
                  onBandStyleId={setErBandStyleId}
                  ringWidthMm={erRingWidthMm}
                  onRingWidthMm={setErRingWidthMm}
                  metals={erMetals}
                  onMetals={setErMetals}
                  stones={erStones}
                  onStones={setErStones}
                />
              ) : categorySlug === "wedding_band" ? (
                <WeddingBandFields
                  lookups={lookups}
                  sku={wbSku}
                  onSku={setWbSku}
                  bandStyleId={wbBandStyleId}
                  onBandStyleId={setWbBandStyleId}
                  ringWidthMm={wbRingWidthMm}
                  onRingWidthMm={setWbRingWidthMm}
                  metals={wbMetals}
                  onMetals={setWbMetals}
                />
              ) : categorySlug === "tennis_bracelet" ? (
                <TennisBraceletFields sku={tbSku} onSku={setTbSku} />
              ) : null}
            </>
          )}

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

// ---------------------------------------------------------------------------
// Lookup Select helper
// ---------------------------------------------------------------------------

function LookupSelect({
  id,
  label,
  value,
  onValueChange,
  items,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  items: LookupItem[];
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id}>
          <SelectValue
            placeholder={placeholder ?? `Select ${label.toLowerCase()}`}
          />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Diamond Fields
// ---------------------------------------------------------------------------

function DiamondFields({
  lookups,
  shapeId,
  onShapeId,
  carat,
  onCarat,
  colorId,
  onColorId,
  clarityId,
  onClarityId,
  cutId,
  onCutId,
  polishId,
  onPolishId,
  symmetryId,
  onSymmetryId,
  fluorescenceId,
  onFluorescenceId,
  pricePerCarat,
  onPricePerCarat,
  tablePct,
  onTablePct,
  depthPct,
  onDepthPct,
  lengthMm,
  onLengthMm,
  widthMm,
  onWidthMm,
  depthMm,
  onDepthMm,
}: {
  lookups: AllLookups;
  shapeId: string;
  onShapeId: (v: string) => void;
  carat: string;
  onCarat: (v: string) => void;
  colorId: string;
  onColorId: (v: string) => void;
  clarityId: string;
  onClarityId: (v: string) => void;
  cutId: string;
  onCutId: (v: string) => void;
  polishId: string;
  onPolishId: (v: string) => void;
  symmetryId: string;
  onSymmetryId: (v: string) => void;
  fluorescenceId: string;
  onFluorescenceId: (v: string) => void;
  pricePerCarat: string;
  onPricePerCarat: (v: string) => void;
  tablePct: string;
  onTablePct: (v: string) => void;
  depthPct: string;
  onDepthPct: (v: string) => void;
  lengthMm: string;
  onLengthMm: (v: string) => void;
  widthMm: string;
  onWidthMm: (v: string) => void;
  depthMm: string;
  onDepthMm: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Label className="text-base font-medium">Diamond Details</Label>
      <div className="grid grid-cols-2 gap-4">
        <LookupSelect
          id="d-shape"
          label="Shape"
          value={shapeId}
          onValueChange={onShapeId}
          items={lookups.shapes}
        />
        <div className="flex flex-col gap-2">
          <Label htmlFor="d-carat">Carat</Label>
          <Input
            id="d-carat"
            type="number"
            step="0.01"
            min="0"
            value={carat}
            onChange={(e) => onCarat(e.target.value)}
          />
        </div>
        <LookupSelect
          id="d-color"
          label="Color"
          value={colorId}
          onValueChange={onColorId}
          items={lookups.diamondColors}
        />
        <LookupSelect
          id="d-clarity"
          label="Clarity"
          value={clarityId}
          onValueChange={onClarityId}
          items={lookups.diamondClarityGrades}
        />
        <LookupSelect
          id="d-cut"
          label="Cut"
          value={cutId}
          onValueChange={onCutId}
          items={lookups.diamondCutGrades}
        />
        <LookupSelect
          id="d-polish"
          label="Polish"
          value={polishId}
          onValueChange={onPolishId}
          items={lookups.diamondPolishGrades}
        />
        <LookupSelect
          id="d-symmetry"
          label="Symmetry"
          value={symmetryId}
          onValueChange={onSymmetryId}
          items={lookups.diamondSymmetryGrades}
        />
        <LookupSelect
          id="d-fluorescence"
          label="Fluorescence"
          value={fluorescenceId}
          onValueChange={onFluorescenceId}
          items={lookups.diamondFluorescenceLevels}
        />
        <div className="flex flex-col gap-2">
          <Label htmlFor="d-price-per-carat">Price Per Carat</Label>
          <Input
            id="d-price-per-carat"
            type="number"
            step="0.01"
            min="0"
            value={pricePerCarat}
            onChange={(e) => onPricePerCarat(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="d-table">Table %</Label>
          <Input
            id="d-table"
            type="number"
            step="0.1"
            min="0"
            value={tablePct}
            onChange={(e) => onTablePct(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="d-depth-pct">Depth %</Label>
          <Input
            id="d-depth-pct"
            type="number"
            step="0.1"
            min="0"
            value={depthPct}
            onChange={(e) => onDepthPct(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="d-length">Length (mm)</Label>
          <Input
            id="d-length"
            type="number"
            step="0.01"
            min="0"
            value={lengthMm}
            onChange={(e) => onLengthMm(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="d-width">Width (mm)</Label>
          <Input
            id="d-width"
            type="number"
            step="0.01"
            min="0"
            value={widthMm}
            onChange={(e) => onWidthMm(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="d-depth">Depth (mm)</Label>
          <Input
            id="d-depth"
            type="number"
            step="0.01"
            min="0"
            value={depthMm}
            onChange={(e) => onDepthMm(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gemstone Fields
// ---------------------------------------------------------------------------

function GemstoneFields({
  lookups,
  typeId,
  onTypeId,
  shapeId,
  onShapeId,
  carat,
  onCarat,
  color,
  onColor,
  clarity,
  onClarity,
  cutId,
  onCutId,
  treatmentId,
  onTreatmentId,
  originId,
  onOriginId,
  pricePerCarat,
  onPricePerCarat,
  lengthMm,
  onLengthMm,
  widthMm,
  onWidthMm,
  depthMm,
  onDepthMm,
}: {
  lookups: AllLookups;
  typeId: string;
  onTypeId: (v: string) => void;
  shapeId: string;
  onShapeId: (v: string) => void;
  carat: string;
  onCarat: (v: string) => void;
  color: string;
  onColor: (v: string) => void;
  clarity: string;
  onClarity: (v: string) => void;
  cutId: string;
  onCutId: (v: string) => void;
  treatmentId: string;
  onTreatmentId: (v: string) => void;
  originId: string;
  onOriginId: (v: string) => void;
  pricePerCarat: string;
  onPricePerCarat: (v: string) => void;
  lengthMm: string;
  onLengthMm: (v: string) => void;
  widthMm: string;
  onWidthMm: (v: string) => void;
  depthMm: string;
  onDepthMm: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Label className="text-base font-medium">Gemstone Details</Label>
      <div className="grid grid-cols-2 gap-4">
        <LookupSelect
          id="g-type"
          label="Gemstone Type"
          value={typeId}
          onValueChange={onTypeId}
          items={lookups.gemstoneTypes}
        />
        <LookupSelect
          id="g-shape"
          label="Shape"
          value={shapeId}
          onValueChange={onShapeId}
          items={lookups.shapes}
        />
        <div className="flex flex-col gap-2">
          <Label htmlFor="g-carat">Carat</Label>
          <Input
            id="g-carat"
            type="number"
            step="0.01"
            min="0"
            value={carat}
            onChange={(e) => onCarat(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="g-color">Color</Label>
          <Input
            id="g-color"
            value={color}
            onChange={(e) => onColor(e.target.value)}
            placeholder="e.g. Blue"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="g-clarity">Clarity</Label>
          <Input
            id="g-clarity"
            value={clarity}
            onChange={(e) => onClarity(e.target.value)}
            placeholder="e.g. Eye Clean"
          />
        </div>
        <LookupSelect
          id="g-cut"
          label="Cut"
          value={cutId}
          onValueChange={onCutId}
          items={lookups.gemstoneCutGrades}
        />
        <LookupSelect
          id="g-treatment"
          label="Treatment"
          value={treatmentId}
          onValueChange={onTreatmentId}
          items={lookups.gemstoneTreatments}
        />
        <LookupSelect
          id="g-origin"
          label="Origin"
          value={originId}
          onValueChange={onOriginId}
          items={lookups.gemstoneOrigins}
        />
        <div className="flex flex-col gap-2">
          <Label htmlFor="g-price-per-carat">Price Per Carat</Label>
          <Input
            id="g-price-per-carat"
            type="number"
            step="0.01"
            min="0"
            value={pricePerCarat}
            onChange={(e) => onPricePerCarat(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="g-length">Length (mm)</Label>
          <Input
            id="g-length"
            type="number"
            step="0.01"
            min="0"
            value={lengthMm}
            onChange={(e) => onLengthMm(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="g-width">Width (mm)</Label>
          <Input
            id="g-width"
            type="number"
            step="0.01"
            min="0"
            value={widthMm}
            onChange={(e) => onWidthMm(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="g-depth">Depth (mm)</Label>
          <Input
            id="g-depth"
            type="number"
            step="0.01"
            min="0"
            value={depthMm}
            onChange={(e) => onDepthMm(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Melee Fields
// ---------------------------------------------------------------------------

function MeleeFields({
  lookups,
  shapeId,
  onShapeId,
  sizeRange,
  onSizeRange,
  colorRange,
  onColorRange,
  clarityRange,
  onClarityRange,
  cutId,
  onCutId,
  quantity,
  onQuantity,
  totalCaratWeight,
  onTotalCaratWeight,
}: {
  lookups: AllLookups;
  shapeId: string;
  onShapeId: (v: string) => void;
  sizeRange: string;
  onSizeRange: (v: string) => void;
  colorRange: string;
  onColorRange: (v: string) => void;
  clarityRange: string;
  onClarityRange: (v: string) => void;
  cutId: string;
  onCutId: (v: string) => void;
  quantity: string;
  onQuantity: (v: string) => void;
  totalCaratWeight: string;
  onTotalCaratWeight: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Label className="text-base font-medium">Melee Details</Label>
      <div className="grid grid-cols-2 gap-4">
        <LookupSelect
          id="m-shape"
          label="Shape"
          value={shapeId}
          onValueChange={onShapeId}
          items={lookups.shapes}
        />
        <div className="flex flex-col gap-2">
          <Label htmlFor="m-size-range">Size Range</Label>
          <Input
            id="m-size-range"
            value={sizeRange}
            onChange={(e) => onSizeRange(e.target.value)}
            placeholder="e.g. 0.8-1.0mm"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="m-color-range">Color Range</Label>
          <Input
            id="m-color-range"
            value={colorRange}
            onChange={(e) => onColorRange(e.target.value)}
            placeholder="e.g. D-F"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="m-clarity-range">Clarity Range</Label>
          <Input
            id="m-clarity-range"
            value={clarityRange}
            onChange={(e) => onClarityRange(e.target.value)}
            placeholder="e.g. VS1-VS2"
          />
        </div>
        <LookupSelect
          id="m-cut"
          label="Cut"
          value={cutId}
          onValueChange={onCutId}
          items={lookups.diamondCutGrades}
        />
        <div className="flex flex-col gap-2">
          <Label htmlFor="m-quantity">Quantity</Label>
          <Input
            id="m-quantity"
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => onQuantity(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="m-total-carat">Total Carat Weight</Label>
          <Input
            id="m-total-carat"
            type="number"
            step="0.01"
            min="0"
            value={totalCaratWeight}
            onChange={(e) => onTotalCaratWeight(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Engagement Ring Fields
// ---------------------------------------------------------------------------

function EngagementRingFields({
  lookups,
  sku,
  onSku,
  bandStyleId,
  onBandStyleId,
  ringWidthMm,
  onRingWidthMm,
  metals,
  onMetals,
  stones,
  onStones,
}: {
  lookups: AllLookups;
  sku: string;
  onSku: (v: string) => void;
  bandStyleId: string;
  onBandStyleId: (v: string) => void;
  ringWidthMm: string;
  onRingWidthMm: (v: string) => void;
  metals: MetalRow[];
  onMetals: (v: MetalRow[]) => void;
  stones: StoneRow[];
  onStones: (v: StoneRow[]) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Label className="text-base font-medium">Engagement Ring Details</Label>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="er-sku">SKU</Label>
          <Input
            id="er-sku"
            value={sku}
            onChange={(e) => onSku(e.target.value)}
          />
        </div>
        <LookupSelect
          id="er-band-style"
          label="Band Style"
          value={bandStyleId}
          onValueChange={onBandStyleId}
          items={lookups.bandStyles}
        />
        <div className="flex flex-col gap-2">
          <Label htmlFor="er-width">Ring Width (mm)</Label>
          <Input
            id="er-width"
            type="number"
            step="0.1"
            min="0"
            value={ringWidthMm}
            onChange={(e) => onRingWidthMm(e.target.value)}
          />
        </div>
      </div>

      {/* Available Metals */}
      <Separator />
      <div className="flex flex-col gap-3">
        <Label className="text-sm font-medium">Available Metals</Label>
        {metals.map((metal, index) => (
          <div key={index} className="flex items-end gap-2">
            <div className="flex-1">
              <Select
                value={metal.metalId}
                onValueChange={(val) => {
                  const updated = [...metals];
                  updated[index] = { ...updated[index], metalId: val };
                  onMetals(updated);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select metal" />
                </SelectTrigger>
                <SelectContent>
                  {lookups.metals.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-32">
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Price"
                value={metal.priceUsd || ""}
                onChange={(e) => {
                  const updated = [...metals];
                  updated[index] = {
                    ...updated[index],
                    priceUsd: Number(e.target.value) || 0,
                  };
                  onMetals(updated);
                }}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onMetals(metals.filter((_, i) => i !== index))}
            >
              <IconTrash />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => onMetals([...metals, { metalId: "", priceUsd: 0 }])}
        >
          <IconPlus />
          Add metal
        </Button>
      </div>

      {/* Compatible Stones */}
      <Separator />
      <div className="flex flex-col gap-3">
        <Label className="text-sm font-medium">Compatible Stones</Label>
        {stones.map((stone, index) => (
          <div key={index} className="flex items-end gap-2">
            <div className="flex-1">
              <Select
                value={stone.shapeId}
                onValueChange={(val) => {
                  const updated = [...stones];
                  updated[index] = { ...updated[index], shapeId: val };
                  onStones(updated);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shape" />
                </SelectTrigger>
                <SelectContent>
                  {lookups.shapes.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-32">
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Max Carat"
                value={stone.maxCarat || ""}
                onChange={(e) => {
                  const updated = [...stones];
                  updated[index] = {
                    ...updated[index],
                    maxCarat: Number(e.target.value) || 0,
                  };
                  onStones(updated);
                }}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onStones(stones.filter((_, i) => i !== index))}
            >
              <IconTrash />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => onStones([...stones, { shapeId: "", maxCarat: 0 }])}
        >
          <IconPlus />
          Add stone
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Wedding Band Fields
// ---------------------------------------------------------------------------

function WeddingBandFields({
  lookups,
  sku,
  onSku,
  bandStyleId,
  onBandStyleId,
  ringWidthMm,
  onRingWidthMm,
  metals,
  onMetals,
}: {
  lookups: AllLookups;
  sku: string;
  onSku: (v: string) => void;
  bandStyleId: string;
  onBandStyleId: (v: string) => void;
  ringWidthMm: string;
  onRingWidthMm: (v: string) => void;
  metals: MetalRow[];
  onMetals: (v: MetalRow[]) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Label className="text-base font-medium">Wedding Band Details</Label>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="wb-sku">SKU</Label>
          <Input
            id="wb-sku"
            value={sku}
            onChange={(e) => onSku(e.target.value)}
          />
        </div>
        <LookupSelect
          id="wb-band-style"
          label="Band Style"
          value={bandStyleId}
          onValueChange={onBandStyleId}
          items={lookups.bandStyles}
        />
        <div className="flex flex-col gap-2">
          <Label htmlFor="wb-width">Ring Width (mm)</Label>
          <Input
            id="wb-width"
            type="number"
            step="0.1"
            min="0"
            value={ringWidthMm}
            onChange={(e) => onRingWidthMm(e.target.value)}
          />
        </div>
      </div>

      {/* Available Metals */}
      <Separator />
      <div className="flex flex-col gap-3">
        <Label className="text-sm font-medium">Available Metals</Label>
        {metals.map((metal, index) => (
          <div key={index} className="flex items-end gap-2">
            <div className="flex-1">
              <Select
                value={metal.metalId}
                onValueChange={(val) => {
                  const updated = [...metals];
                  updated[index] = { ...updated[index], metalId: val };
                  onMetals(updated);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select metal" />
                </SelectTrigger>
                <SelectContent>
                  {lookups.metals.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-32">
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Price"
                value={metal.priceUsd || ""}
                onChange={(e) => {
                  const updated = [...metals];
                  updated[index] = {
                    ...updated[index],
                    priceUsd: Number(e.target.value) || 0,
                  };
                  onMetals(updated);
                }}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onMetals(metals.filter((_, i) => i !== index))}
            >
              <IconTrash />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => onMetals([...metals, { metalId: "", priceUsd: 0 }])}
        >
          <IconPlus />
          Add metal
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tennis Bracelet Fields
// ---------------------------------------------------------------------------

function TennisBraceletFields({
  sku,
  onSku,
}: {
  sku: string;
  onSku: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Label className="text-base font-medium">Tennis Bracelet Details</Label>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="tb-sku">SKU</Label>
          <Input
            id="tb-sku"
            value={sku}
            onChange={(e) => onSku(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
