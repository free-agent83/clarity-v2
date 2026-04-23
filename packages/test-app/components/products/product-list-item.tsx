import Link from "next/link";

export type ProductListItemTag = {
  key: string;
  label: string;
  title?: string;
};

export type ProductListItemSwatch = {
  key: string;
  hex: string;
  title?: string;
};

export type ProductListItemProps = {
  id: string;
  href: string;
  imageSrc: string;
  imageAlt?: string;
  title: string;
  subtitle: string;
  priceLabel: string;
  formattedPrice: string;
  tags?: ProductListItemTag[];
  maxVisibleTags?: number;
  swatches?: ProductListItemSwatch[];
};

export function ProductListItem({
  id,
  href,
  imageSrc,
  imageAlt,
  title,
  subtitle,
  priceLabel,
  formattedPrice,
  tags,
  maxVisibleTags = 9,
  swatches,
}: ProductListItemProps) {
  const visibleTags = tags?.slice(0, maxVisibleTags);
  const extraTags = tags ? tags.length - maxVisibleTags : 0;

  return (
    <Link key={id} href={href} className="group flex flex-col gap-3">
      {/* Image */}
      <div className="aspect-square overflow-hidden rounded-2xl border border-black/4">
        <img
          src={imageSrc}
          alt={imageAlt ?? title}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2">
        <div>
          <p className="truncate text-base leading-7 text-foreground">
            {title}
          </p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div>
          <p className="text-xs leading-5 tracking-wide text-muted-foreground">
            {priceLabel}
          </p>
          <p className="text-base leading-7 text-foreground">
            {formattedPrice}
          </p>
        </div>
      </div>

      {/* Tags */}
      {visibleTags && visibleTags.length > 0 && (
        <div className="flex items-center gap-1.5">
          {visibleTags.map((t) => (
            <span
              key={t.key}
              className="text-[10px] leading-5 text-muted-foreground"
              title={t.title}
            >
              {t.label}
            </span>
          ))}
          {extraTags > 0 && (
            <span className="text-xs text-foreground">+{extraTags}</span>
          )}
        </div>
      )}

      {/* Swatches */}
      {swatches && swatches.length > 0 && (
        <div className="flex items-center gap-2">
          {swatches.map((s) => (
            <span
              key={s.key}
              className="size-3.5 rounded-full"
              style={{ backgroundColor: s.hex }}
              title={s.title}
            />
          ))}
        </div>
      )}
    </Link>
  );
}
