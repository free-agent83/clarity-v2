import Link from "next/link";
import { getCurrentUser } from "@/lib/api/users";
import { HomeCarousel } from "@/components/home-carousel";

const HOME_CATEGORIES = [
  { label: "Engagement rings", slug: "engagement-rings", badge: "New" },
  { label: "Wedding bands", slug: "wedding-bands", badge: "New" },
  { label: "Natural diamonds", slug: "natural-diamonds", badge: null },
  { label: "Lab grown diamonds", slug: "lab-grown-diamonds", badge: null },
  { label: "Gemstones", slug: "gemstones", badge: null },
  { label: "Natural melee", slug: "natural-melee", badge: null },
  { label: "Lab grown melee", slug: "lab-grown-melee", badge: null },
];

export default async function BuyerHomePage() {
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
