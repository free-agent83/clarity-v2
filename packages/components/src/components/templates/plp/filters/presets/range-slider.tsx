"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "../../../../atoms/input/input";
import { Slider } from "../../../../atoms/slider/slider";
import type { FilterControlProps } from "../../plp-types";

/**
 * Range slider filter preset.
 *
 * Renders a two-thumb slider, an optional distribution histogram behind
 * the track, and commit-on-blur numeric inputs for precise min/max entry.
 * Reads `min`, `max`, `step`, `unit`, and `histogram` from the definition.
 */
export function RangeSliderFilter({
  value,
  onChange,
  definition,
}: FilterControlProps) {
  if (!definition || definition.preset !== "range-slider") {
    return null;
  }
  const rangeMin = definition.min ?? 0;
  const rangeMax = definition.max ?? 100;
  const step = definition.step ?? 1;

  const currentMin =
    value && typeof value === "object" && "min" in value
      ? (value as { min: number; max: number }).min
      : rangeMin;
  const currentMax =
    value && typeof value === "object" && "max" in value
      ? (value as { min: number; max: number }).max
      : rangeMax;

  // Local input state — commits to `onChange` on blur or Enter
  const [minInput, setMinInput] = useState(String(currentMin));
  const [maxInput, setMaxInput] = useState(String(currentMax));

  useEffect(() => {
    setMinInput(String(currentMin));
    setMaxInput(String(currentMax));
  }, [currentMin, currentMax]);

  function commit(nextMin: number, nextMax: number) {
    const clampedMin = Math.max(rangeMin, Math.min(nextMin, rangeMax));
    const clampedMax = Math.max(rangeMin, Math.min(nextMax, rangeMax));
    const orderedMin = Math.min(clampedMin, clampedMax);
    const orderedMax = Math.max(clampedMin, clampedMax);

    if (orderedMin === rangeMin && orderedMax === rangeMax) {
      onChange(undefined);
    } else {
      onChange({ min: orderedMin, max: orderedMax });
    }
  }

  function handleSliderChange(values: number[]) {
    const [nextMin, nextMax] = values;
    commit(nextMin, nextMax);
  }

  function commitInputs() {
    const nextMin = Number.parseFloat(minInput);
    const nextMax = Number.parseFloat(maxInput);
    if (Number.isFinite(nextMin) && Number.isFinite(nextMax)) {
      commit(nextMin, nextMax);
    } else {
      // Invalid — reset to last valid values
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

  const isCurrencyUnit = definition.unit
    ? ["$", "€", "£", "¥"].some((c) => definition.unit!.startsWith(c)) ||
      ["USD", "EUR", "GBP", "JPY"].includes(definition.unit)
    : false;

  return (
    <div className="flex flex-col gap-4">
      {definition.histogram && (
        <Histogram
          buckets={definition.histogram.buckets}
          histogramMin={definition.histogram.min}
          histogramMax={definition.histogram.max}
          sliderMin={rangeMin}
          sliderMax={rangeMax}
          selectedMin={currentMin}
          selectedMax={currentMax}
        />
      )}

      <Slider
        value={[currentMin, currentMax]}
        min={rangeMin}
        max={rangeMax}
        step={step}
        onValueChange={handleSliderChange}
      />

      <div className="flex items-center gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs text-muted-foreground" htmlFor={`${definition.id}-min`}>
            Min
          </label>
          <div className="flex items-center gap-1">
            {isCurrencyUnit && definition.unit && (
              <span className="text-sm text-muted-foreground">{definition.unit}</span>
            )}
            <Input
              id={`${definition.id}-min`}
              type="number"
              inputMode="decimal"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              onBlur={commitInputs}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            {!isCurrencyUnit && definition.unit && (
              <span className="text-sm text-muted-foreground">{definition.unit}</span>
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs text-muted-foreground" htmlFor={`${definition.id}-max`}>
            Max
          </label>
          <div className="flex items-center gap-1">
            {isCurrencyUnit && definition.unit && (
              <span className="text-sm text-muted-foreground">{definition.unit}</span>
            )}
            <Input
              id={`${definition.id}-max`}
              type="number"
              inputMode="decimal"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              onBlur={commitInputs}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            {!isCurrencyUnit && definition.unit && (
              <span className="text-sm text-muted-foreground">{definition.unit}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Distribution histogram drawn behind the range slider track.
 *
 * Each bucket renders as a vertical bar with height proportional to its
 * count relative to the max count in the array. Bars span the slider's
 * `[sliderMin, sliderMax]` domain; if the histogram's own `[min, max]`
 * differs from the slider's, bars are offset proportionally within the
 * slider's range.
 */
function Histogram({
  buckets,
  histogramMin,
  histogramMax,
  sliderMin,
  sliderMax,
  selectedMin,
  selectedMax,
}: {
  buckets: number[];
  histogramMin: number;
  histogramMax: number;
  sliderMin: number;
  sliderMax: number;
  selectedMin: number;
  selectedMax: number;
}) {
  const maxBucket = Math.max(...buckets, 1);
  const bucketWidth = (histogramMax - histogramMin) / buckets.length;
  const sliderSpan = sliderMax - sliderMin;

  return (
    <div
      aria-hidden="true"
      className="relative flex h-12 items-end gap-px"
    >
      {buckets.map((count, i) => {
        const bucketStart = histogramMin + i * bucketWidth;
        const bucketEnd = bucketStart + bucketWidth;
        const bucketCenter = (bucketStart + bucketEnd) / 2;
        const inRange =
          bucketCenter >= selectedMin && bucketCenter <= selectedMax;
        const heightPct = (count / maxBucket) * 100;
        const leftPct = ((bucketStart - sliderMin) / sliderSpan) * 100;
        const widthPct = (bucketWidth / sliderSpan) * 100;

        return (
          <div
            key={i}
            className={cn(
              "absolute bottom-0 rounded-sm transition-colors",
              inRange ? "bg-primary/60" : "bg-muted-foreground/20"
            )}
            style={{
              left: `${leftPct}%`,
              width: `calc(${widthPct}% - 1px)`,
              height: `${heightPct}%`,
              minHeight: count > 0 ? 2 : 0,
            }}
          />
        );
      })}
    </div>
  );
}
