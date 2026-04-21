"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "../../atoms/input-group/input-group";
import { Slider } from "../../atoms/slider/slider";
import { Typography } from "../../atoms/typography/typography";

export interface RangeHistogram {
  /** Equal-width bucket counts across `[min, max]`. */
  buckets: number[];
  min: number;
  max: number;
}

export interface RangeAxis {
  /** Machine-readable key for this axis. Becomes a key in the filter value. */
  id: string;
  /** Human-readable heading. Omit for single-axis use to skip the heading. */
  label?: string;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  histogram?: RangeHistogram;
}

export type RangeValue =
  | Record<string, { min: number; max: number }>
  | undefined;

export interface RangeFilterProps {
  value: RangeValue;
  onChange: (value: RangeValue) => void;
  axes: RangeAxis[];
}

/**
 * Range filter with one or more axes. Each axis is an independent
 * `[min, max]` slider + numeric input pair, with an optional
 * distribution histogram behind the slider track.
 *
 * Value is always `Record<string, { min; max }>` keyed by axis id, or
 * `undefined` when no axis is engaged. Axes at their full range are
 * omitted from the value object.
 *
 * For single-axis use, pass a one-element `axes` array with no `label`
 * so the component skips the heading and reads cleanly.
 */
export function RangeFilter({ value, onChange, axes }: RangeFilterProps) {
  const axisValues = value ?? {};

  function commitAxis(axisId: string, nextMin: number, nextMax: number) {
    const axis = axes.find((a) => a.id === axisId);
    if (!axis) return;

    const clampedMin = Math.max(axis.min, Math.min(nextMin, axis.max));
    const clampedMax = Math.max(axis.min, Math.min(nextMax, axis.max));
    const orderedMin = Math.min(clampedMin, clampedMax);
    const orderedMax = Math.max(clampedMin, clampedMax);

    const isFullRange = orderedMin === axis.min && orderedMax === axis.max;
    const next = { ...axisValues };

    if (isFullRange) {
      delete next[axisId];
    } else {
      next[axisId] = { min: orderedMin, max: orderedMax };
    }

    onChange(Object.keys(next).length > 0 ? next : undefined);
  }

  return (
    <div className={axes.length > 1 ? "flex flex-col gap-6" : "flex flex-col gap-4"}>
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

function AxisRow({
  axis,
  currentMin,
  currentMax,
  onCommit,
}: {
  axis: RangeAxis;
  currentMin: number;
  currentMax: number;
  onCommit: (min: number, max: number) => void;
}) {
  const idBase = useId();
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

  const isCurrencyUnit = axis.unit
    ? ["$", "€", "£", "¥"].some((c) => axis.unit!.startsWith(c)) ||
      ["USD", "EUR", "GBP", "JPY"].includes(axis.unit)
    : false;

  return (
    <div className="flex flex-col gap-2">
      {axis.label && (
        <Typography as="h4" variant="body-2" emphasis>{axis.label}</Typography>
      )}

      {axis.histogram && (
        <Histogram
          buckets={axis.histogram.buckets}
          histogramMin={axis.histogram.min}
          histogramMax={axis.histogram.max}
          sliderMin={axis.min}
          sliderMax={axis.max}
          selectedMin={currentMin}
          selectedMax={currentMax}
        />
      )}

      <Slider
        value={[currentMin, currentMax]}
        min={axis.min}
        max={axis.max}
        step={step}
        onValueChange={(values) => onCommit(values[0], values[1])}
        className="my-2"
      />

      <div className="flex items-center gap-2">
        <div className="flex flex-1 flex-col gap-1">
          {axis.label === undefined && (
            <Typography asChild variant="caption" className="text-muted-foreground">
              <label htmlFor={`${idBase}-min`}>Min</label>
            </Typography>
          )}
          <InputGroup>
            {isCurrencyUnit && axis.unit && (
              <InputGroupAddon align="inline-start">
                <InputGroupText>{axis.unit}</InputGroupText>
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
              aria-label={axis.label ? `${axis.label} min` : "Min"}
            />
            {!isCurrencyUnit && axis.unit && (
              <InputGroupAddon align="inline-end">
                <InputGroupText>{axis.unit}</InputGroupText>
              </InputGroupAddon>
            )}
          </InputGroup>
        </div>
        {axis.label && (
          <Typography as="span" variant="body-2" className="text-muted-foreground">
            –
          </Typography>
        )}
        <div className="flex flex-1 flex-col gap-1">
          {axis.label === undefined && (
            <Typography asChild variant="caption" className="text-muted-foreground">
              <label htmlFor={`${idBase}-max`}>Max</label>
            </Typography>
          )}
          <InputGroup>
            {isCurrencyUnit && axis.unit && (
              <InputGroupAddon align="inline-start">
                <InputGroupText>{axis.unit}</InputGroupText>
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
              aria-label={axis.label ? `${axis.label} max` : "Max"}
            />
            {!isCurrencyUnit && axis.unit && (
              <InputGroupAddon align="inline-end">
                <InputGroupText>{axis.unit}</InputGroupText>
              </InputGroupAddon>
            )}
          </InputGroup>
        </div>
      </div>
    </div>
  );
}

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
    <div aria-hidden="true" className="relative flex h-12 items-end gap-px">
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
