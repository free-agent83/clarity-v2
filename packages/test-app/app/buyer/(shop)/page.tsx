import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/api/users";
import { HomeCarousel } from "@/components/home-carousel";
import { checkSimulateError } from "@/lib/api/_simulate";

const HOME_CATEGORIES = [
  { label: "Engagement rings", slug: "jewelry/engagement-rings", badge: "New", image: "/images/products/engagement-rings/ring.jpg" },
  { label: "Wedding bands", slug: "wedding-bands", badge: "New", image: "/images/products/wedding-bands/wedding-bands-001-hero.jpg" },
  { label: "Chains", slug: "chains", badge: null, image: "/images/products/chains/chains-002-hero.jpg" },
  { label: "Pendants", slug: "pendants", badge: null, image: "/images/products/pendants/pendants-002-hero.jpg" },
  { label: "Studs", slug: "studs", badge: null, image: "/images/products/studs/studs-001-hero.jpg" },
  { label: "Tennis bracelets", slug: "tennis-bracelets", badge: null, image: "/images/products/tennis-bracelets/tennis-bracelets-001-hero.jpg" },
  { label: "Natural diamonds", slug: "natural-diamonds", badge: null, image: "/images/products/diamonds/diamond.png" },
  { label: "Lab grown diamonds", slug: "lab-grown-diamonds", badge: null, image: "/images/products/diamonds/diamond.png" },
  { label: "Gemstones", slug: "gemstones", badge: null, image: "/images/products/gemstones/gemstone.png" },
];

export default async function BuyerHomePage({
  searchParams,
}: {
  searchParams: Promise<{ simulate?: string; [k: string]: unknown }>;
}) {
  const sp = await searchParams;
  checkSimulateError(sp);
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-8 pb-16 pt-1">
      <h2 className="text-center text-2xl font-semibold leading-9">
        Nice to see you again, {user.name}!
      </h2>

      <HomeCarousel />

      <h3 className="text-4xl font-medium leading-10 text-foreground">
        All product categories
      </h3>
      <div className="grid grid-cols-4 gap-8">
        {HOME_CATEGORIES.map((cat) => (
          <Link
            key={cat.label}
            href={`/buyer/browse/${cat.slug}`}
            className="flex flex-col gap-3"
          >
            <div className="relative aspect-square overflow-hidden rounded-xl bg-stone-300">
              {cat.image && (
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              )}
              {cat.badge && (
                <span className="absolute right-3 top-3 rounded-full bg-stone-100 px-1.5 py-0.5 text-xs text-violet-700">
                  {cat.badge}
                </span>
              )}
            </div>
            <p className="text-xl font-medium leading-8 text-foreground">
              {cat.label}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
