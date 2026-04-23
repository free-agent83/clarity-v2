import type { Metadata } from "next";
import { IconSearch } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "Help Center — Minivoda",
  description: "Guides and answers for jewellers on the Minivoda platform",
};

const CATEGORIES = [
  { icon: "📦", title: "Orders & Shipping", meta: "8 articles" },
  { icon: "💎", title: "Browse & Search", meta: "6 articles" },
  { icon: "💳", title: "Payments & Invoices", meta: "5 articles" },
  { icon: "🔁", title: "Returns & Disputes", meta: "4 articles" },
  { icon: "🏠", title: "Account & Settings", meta: "5 articles" },
  { icon: "📞", title: "Contact Support", meta: "Get in touch" },
];

const POPULAR_ARTICLES = [
  "How do I place an order?",
  "Understanding diamond grading reports",
  "How are invoices generated?",
  "Track my order status",
  "Return and refund policy",
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-screen-xl px-6 py-10">
      {/* Hero */}
      <div className="mb-10 rounded-xl bg-muted px-6 py-12 text-center">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-foreground">
          How can we help?
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Guides and answers for jewellers on the Minivoda platform
        </p>
        <div className="relative mx-auto max-w-md">
          <IconSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            placeholder="Search for articles, guides, and FAQs..."
            aria-label="Search help articles"
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Category grid */}
      <section className="mb-10">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Browse by topic
        </p>
        <div className="grid grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.title}
              className="rounded-xl border border-border bg-background p-5 text-center"
            >
              <div className="mb-2 text-2xl">{cat.icon}</div>
              <div className="text-sm font-semibold text-foreground">
                {cat.title}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {cat.meta}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular articles */}
      <section>
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Popular articles
        </p>
        <div className="flex flex-col gap-2">
          {POPULAR_ARTICLES.map((title) => (
            <div
              key={title}
              className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
            >
              <span className="text-sm text-foreground">{title}</span>
              <span className="text-muted-foreground">›</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
