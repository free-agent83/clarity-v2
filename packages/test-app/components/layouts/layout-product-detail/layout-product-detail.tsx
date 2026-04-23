"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem as DsBreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  PlpGridContainer,
} from "@nivoda/components";

import { cn } from "@/lib/utils";
import type { BreadcrumbItem, ProductImage, SpecRow } from "../types";

type LayoutProductDetailProps = {
  breadcrumbs: BreadcrumbItem[];
  images: ProductImage[];
  hasVideo?: boolean;
  title: string;
  priceLabel?: string;
  formattedPrice: string;
  actions?: React.ReactNode;
  configuration?: React.ReactNode;
  includedItems?: React.ReactNode;
  ctaButton?: React.ReactNode;
  shippingInfo?: React.ReactNode;
  specs: SpecRow[];
  description?: string;
  relatedItems?: React.ReactNode;
  relatedTitle?: string;
  className?: string;
};

export function LayoutProductDetail({
  breadcrumbs,
  images,
  hasVideo,
  title,
  priceLabel = "Starting from",
  formattedPrice,
  actions,
  configuration,
  includedItems,
  ctaButton,
  shippingInfo,
  specs,
  description,
  relatedItems,
  relatedTitle = "You may also like",
  className,
}: LayoutProductDetailProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const currentImage = images[activeImageIdx] ?? images[0];

  return (
    <div className={cn("flex flex-col gap-12 pb-32", className)}>
      <Breadcrumb>
        <BreadcrumbList className="gap-3 text-base">
          {breadcrumbs.map((item, i) => (
            <React.Fragment key={item.href}>
              {i > 0 && <BreadcrumbSeparator className="[&>svg]:size-4" />}
              <DsBreadcrumbItem>
                {i < breadcrumbs.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="truncate">
                    {item.label}
                  </BreadcrumbPage>
                )}
              </DsBreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Two-column grid */}
      <div className="grid grid-cols-[1fr_480px] items-start gap-12">
        {/* LEFT: Sticky gallery */}
        <div className="sticky top-5 flex gap-4">
          {/* Thumbnails */}
          <div className="flex flex-col gap-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImageIdx(i)}
                className={cn(
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border transition-colors",
                  activeImageIdx === i
                    ? "border-[#5620e1]"
                    : "border-black/5 hover:border-black/20",
                )}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="size-full rounded-xl object-cover"
                />
              </button>
            ))}
            {hasVideo && images[0] && (
              <button className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-black/5 bg-white transition-colors hover:border-black/20">
                <img
                  src={images[0].src}
                  alt="360° video"
                  className="size-full rounded-xl object-cover opacity-20"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-foreground">
                    360°
                  </span>
                </div>
              </button>
            )}
          </div>

          {/* Main image */}
          {currentImage && (
            <div className="aspect-square min-w-0 flex-1 overflow-hidden rounded-xl border border-black/5">
              <img
                src={currentImage.src}
                alt={currentImage.alt}
                className="size-full rounded-xl object-cover"
              />
            </div>
          )}
        </div>

        {/* RIGHT: Details */}
        <div className="flex flex-col gap-12">
          {/* Title + price + actions */}
          <div className="flex flex-col gap-4">
            <h1 className="text-[34px] font-medium leading-10.5 tracking-[0.25px] text-foreground">
              {title}
            </h1>
            <div>
              <p className="text-base leading-6 text-muted-foreground">
                {priceLabel}
              </p>
              <p className="text-2xl font-medium leading-8 text-foreground">
                {formattedPrice}
              </p>
            </div>
            {actions}
          </div>

          {/* Configuration — slot */}
          {configuration}

          {/* Included items — slot */}
          {includedItems}

          {/* CTA + shipping */}
          <div className="flex flex-col gap-4">
            {ctaButton}
            {shippingInfo}
          </div>

          {/* Specifications + description */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h2 className="text-xl font-medium leading-8 text-foreground">
                Specifications
              </h2>
              <div className="flex flex-col overflow-hidden">
                {specs.map((spec, i) => (
                  <div
                    key={spec.label}
                    className={cn(
                      "flex items-center gap-5 bg-background py-4",
                      i < specs.length - 1 && "border-b border-border",
                    )}
                  >
                    <span className="w-45 shrink-0 text-base text-muted-foreground">
                      {spec.label}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-right text-base font-medium text-foreground">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {description && (
              <p className="text-base leading-6 tracking-[0.15px] text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-border" />

      {/* Related items */}
      {relatedItems ? (
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-foreground">
            {relatedTitle}
          </h2>
          <PlpGridContainer>{relatedItems}</PlpGridContainer>
        </div>
      ) : null}
    </div>
  );
}
