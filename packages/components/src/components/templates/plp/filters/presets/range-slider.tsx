"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "../../../../atoms/input-group/input-group";
import { Slider } from "../../../../atoms/slider/slider";
import { Typography } from "../../../../atoms/typography/typography";

/** Value shape for `RangeSliderFilter`. `undefined` when the full range is selected. */
export type RangeSliderValue = { min: number; max: number } | undefined;

export interface RangeSliderHistogram {
  /** Equal-width bucket counts across the histogram's `[min, max]` domain. */
  buckets: number[];
  min: number;
  max: number;
}

export interface RangeSliderFilterProps {
  value: RangeSliderValue;
  onChange: (value: RangeSliderValue) => void;
  /** Lower bound of the selectable range. */
  min: number;
  /** Upper bound of the selectable range. */
  max: number;
  /** Increment between slider stops. Defaults to 1. */
  step?: number;
  /**
   * Unit for the numeric inputs. Currency symbols (`$`, `€`, `£`, `¥`)
   * and ISO codes (`USD`, `EUR`, `GBP`, `JPY`) render as a prefix;
   * everything else renders as a suffix.
   */
  unit?: string;
  /** Optional distribution histogram drawn behind the slider track. */
  histogram?: RangeSliderHistogram;
}

/**
 * Range slider filter preset.
 *
 * Renders a two-thumb slider, an optional distribution histogram behind
 * the track, and commit-on-blur numeric inputs for precise min/max entry.
 */
export function RangeSliderFilter({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  histogram,
}: RangeSliderFilterProps) {
  const idBase = useId();
  const currentMin = value?.min ?? min;
  const currentMax = value?.max ?? max;

  const [minInput, setMinInput] = useState(String(currentMin));
  const [maxInput, setMaxInput] = useState(String(currentMax));

  useEffect(() => {
    setMinInput(String(currentMin));
    setMaxInput(String(currentMax));
  }, [currentMin, currentMax]);

  function commit(nextMin: number, nextMax: number) {
    const clampedMin = Math.max(min, Math.min(nextMin, max));
    const clampedMax = Math.max(min, Math.min(nextMax, max));
    const orderedMin = Math.min(clampedMin, clampedMax);
    const orderedMax = Math.max(clampedMin, clampedMax);

    if (orderedMin === min && orderedMax === max) {
      onChange(undefined);
    } else {
      onChange({ min: orderedMin, max: orderedMax });
    }
  }

  function handleSliderChange(values: number[]) {
    commit(values[0], values[1]);
  }

  function commitInputs() {
    const nextMin = Number.parseFloat(minInput);
    const nextMax = Number.parseFloat(maxInput);
    if (Number.isFinite(nextMin) && Number.isFinite(nextMax)) {
      commit(nextMin, nextMax);
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

  const isCurrencyUnit = unit
    ? ["$", "€", "£", "¥"].some((c) => unit.startsWith(c)) ||
      ["USD", "EUR", "GBP", "JPY"].includes(unit)
    : false;

  return (
    <div className="flex flex-col gap-4">
      {histogram && (
        <Histogram
          buckets={histogram.buckets}
          histogramMin={histogram.min}
          histogramMax={histogram.max}
          sliderMin={min}
          sliderMax={max}
          selectedMin={currentMin}
          selectedMax={currentMax}
        />
      )}

      <Slider
        value={[currentMin, currentMax]}
        min={min}
        max={max}
        step={step}
        onValueChange={handleSliderChange}
        className="my-2"
      />

      <div className="flex items-center gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <Typography asChild variant="caption" className="text-muted-foreground">
            <label htmlFor={`${idBase}-min`}>Min</label>
          </Typography>
          <InputGroup>
            {isCurrencyUnit && unit && (
              <InputGroupAddon align="inline-start">
                <InputGroupText>{unit}</InputGroupText>
              </InputGroupAddon>
            )}
            <InputGroupInput
              id={`${idBase}-min`}
              type="number"
              inputMode="decimal"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              onBlur={commitInputs}
              onKeyDown={handleKeyDown}
            />
            {!isCurrencyUnit && unit && (
              <InputGroupAddon align="inline-end">
                <InputGroupText>{unit}</InputGroupText>
              </InputGroupAddon>
            )}
          </InputGroup>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <Typography asChild variant="caption" className="text-muted-foreground">
            <label htmlFor={`${idBase}-max`}>Max</label>
          </Typography>
          <InputGroup>
            {isCurrencyUnit && unit && (
              <InputGroupAddon align="inline-start">
                <InputGroupText>{unit}</InputGroupText>
              </InputGroupAddon>
            )}
            <InputGroupInput
              id={`${idBase}-max`}
              type="number"
              inputMode="decimal"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              onBlur={commitInputs}
              onKeyDown={handleKeyDown}
            />
            {!isCurrencyUnit && unit && (
              <InputGroupAddon align="inline-end">
                <InputGroupText>{unit}</InputGroupText>
              </InputGroupAddon>
            )}
          </InputGroup>
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
