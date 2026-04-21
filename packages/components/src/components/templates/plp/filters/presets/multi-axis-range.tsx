"use client";

import { useEffect, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "../../../../atoms/input-group/input-group";
import { Slider } from "../../../../atoms/slider/slider";
import { Typography } from "../../../../atoms/typography/typography";
import type {
  FilterControlProps,
  FilterValue,
  PresetFilterDefinition,
} from "../../plp-types";

type AxisValues = Record<string, { min: number; max: number }>;

function toAxisValues(value: FilterValue): AxisValues {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !("min" in value && typeof (value as { min: unknown }).min === "number")
  ) {
    return value as AxisValues;
  }
  return {};
}

/**
 * Multi-axis range filter preset.
 *
 * Renders one range control per axis, each with its own min/max slider
 * and numeric inputs. Value is a record keyed by axis id. Axes at their
 * full range are omitted from the value object; clearing all axes yields
 * `undefined`.
 */
export function MultiAxisRangeFilter({
  value,
  onChange,
  definition,
}: FilterControlProps) {
  if (!definition || definition.preset !== "multi-axis-range") {
    return null;
  }
  const axes = definition.axes ?? [];
  const axisValues = toAxisValues(value);

  function commitAxis(axisId: string, nextMin: number, nextMax: number) {
    const axis = axes.find((a) => a.id === axisId);
    if (!axis) return;

    const clampedMin = Math.max(axis.min, Math.min(nextMin, axis.max));
    const clampedMax = Math.max(axis.min, Math.min(nextMax, axis.max));
    const orderedMin = Math.min(clampedMin, clampedMax);
    const orderedMax = Math.max(clampedMin, clampedMax);

    const isFullRange = orderedMin === axis.min && orderedMax === axis.max;
    const next: AxisValues = { ...axisValues };

    if (isFullRange) {
      delete next[axisId];
    } else {
      next[axisId] = { min: orderedMin, max: orderedMax };
    }

    onChange(Object.keys(next).length > 0 ? next : undefined);
  }

  return (
    <div className="flex flex-col gap-6">
      {axes.map((axis) => (
        <AxisRow
          key={axis.id}
          axis={axis}
          currentMin={axisValues[axis.id]?.min ?? axis.min}
          currentMax={axisValues[axis.id]?.max ?? axis.max}
          onCommit={(nextMin, nextMax) => commitAxis(axis.id, nextMin, nextMax)}
        />
      ))}
    </div>
  );
}

/**
 * A single axis row: label heading, slider, and min/max numeric inputs.
 */
function AxisRow({
  axis,
  currentMin,
  currentMax,
  onCommit,
}: {
  axis: NonNullable<PresetFilterDefinition["axes"]>[number];
  currentMin: number;
  currentMax: number;
  onCommit: (min: number, max: number) => void;
}) {
  const step = axis.step ?? 1;
  const [minInput, setMinInput] = useState(String(currentMin));
  const [maxInput, setMaxInput] = useState(String(currentMax));

  useEffect(() => {
    setMinInput(String(currentMin));
    setMaxInput(String(currentMax));
  }, [currentMin, currentMax]);

  function commitInputs() {
    const nextMin = Number.parseFloat(minInput);
    const nextMax = Number.parseFloat(maxInput);
    if (Number.isFinite(nextMin) && Number.isFinite(nextMax)) {
      onCommit(nextMin, nextMax);
    } else {
      setMinInput(String(currentMin));
      setMaxInput(String(currentMax));
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitInputs();
      (e.target as HTMLInputElement).blur();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Typography as="h4" variant="body-2" emphasis>{axis.label}</Typography>
      <Slider
        value={[currentMin, currentMax]}
        min={axis.min}
        max={axis.max}
        step={step}
        onValueChange={(values) => onCommit(values[0], values[1])}
        className="my-3"
      />
      <div className="flex items-center gap-2">
        <InputGroup className="flex-1">
          <InputGroupInput
            type="number"
            inputMode="decimal"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            onBlur={commitInputs}
            onKeyDown={handleKeyDown}
            aria-label={`${axis.label} min`}
          />
          {axis.unit && (
            <InputGroupAddon align="inline-end">
              <InputGroupText>{axis.unit}</InputGroupText>
            </InputGroupAddon>
          )}
        </InputGroup>
        <Typography as="span" variant="body-2" className="text-muted-foreground">–</Typography>
        <InputGroup className="flex-1">
          <InputGroupInput
            type="number"
            inputMode="decimal"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            onBlur={commitInputs}
            onKeyDown={handleKeyDown}
            aria-label={`${axis.label} max`}
          />
          {axis.unit && (
            <InputGroupAddon align="inline-end">
              <InputGroupText>{axis.unit}</InputGroupText>
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>
    </div>
  );
}
