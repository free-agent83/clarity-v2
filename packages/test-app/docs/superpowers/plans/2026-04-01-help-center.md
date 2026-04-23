# Help Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the Help button in the buyer nav to open a standalone `/help` page in a new tab, and build the mock help center page.

**Architecture:** Three isolated changes — (1) swap the nav button for a link, (2) create a new `(help)` route group with a minimal layout, (3) build the static help center page inside it. No data fetching, no new dependencies.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS v4, `@tabler/icons-react`, `next/link`

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Modify | `components/shell/buyer-nav.tsx` | Replace `<button>` with `<Link>`, remove chevron icon |
| Create | `app/(help)/layout.tsx` | Minimal standalone layout: wordmark header + copyright footer |
| Create | `app/(help)/help/page.tsx` | Static help center: hero search, category grid, popular articles |

---

## Task 1: Wire the Help button

**Files:**
- Modify: `components/shell/buyer-nav.tsx`

- [ ] **Step 1: Open `components/shell/buyer-nav.tsx` and locate the Help button**

The button is at the bottom of the right actions group (around line 57). It currently looks like:

```tsx
<button className="flex w-27.5 items-center gap-2 rounded-lg bg-foreground px-3 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90">
  <IconHelp size={20} />
  <span className="min-w-0 flex-1 overflow-hidden text-ellipsis text-left">
    Help
  </span>
  <IconChevronDown size={16} />
</button>
```

- [ ] **Step 2: Replace the button with a Link**

Replace the entire `<button>` block with:

```tsx
<Link
  href="/help"
  target="_blank"
  rel="noopener noreferrer"
  className="flex w-27.5 items-center gap-2 rounded-lg bg-foreground px-3 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
>
  <IconHelp size={20} />
  <span className="min-w-0 flex-1 overflow-hidden text-ellipsis text-left">
    Help
  </span>
</Link>
```

Note: `Link` is already imported at the top of the file (`import Link from "next/link"`). Remove `IconChevronDown` from the import list since it is no longer used.

The updated import line should be:

```tsx
import {
  IconHeart,
  IconHelp,
  IconShoppingCart,
  IconSearch,
} from "@tabler/icons-react";
```

- [ ] **Step 3: Verify types**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/shell/buyer-nav.tsx
git commit -m "feat(shell): wire help button to /help in new tab"
```

---

## Task 2: Create the (help) route group layout

**Files:**
- Create: `app/(help)/layout.tsx`

- [ ] **Step 1: Create the layout file**

Create `app/(help)/layout.tsx` with the following content:

```tsx
import Link from "next/link"

const LOGOMARK =
  "https://www.figma.com/api/mcp/asset/aa4f9fea-b8d9-4f1d-ac25-7f94b9b6b788"

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="flex items-center justify-between px-6 py-3.5">
          <Link href="/buyer" aria-label="Minivoda Home">
            <img
              src={LOGOMARK}
              alt="Minivoda"
              className="h-6 w-auto"
              style={{ width: 50.853 }}
            />
          </Link>
          <Link
            href="/buyer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to Minivoda ↗
          </Link>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted">
        <div className="px-6 py-4 text-center text-xs text-muted-foreground">
          © 2025 Minivoda · All rights reserved
        </div>
      </footer>
    </div>
  )
}
```

- [ ] **Step 2: Verify types**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/\(help\)/layout.tsx
git commit -m "feat(help): add standalone (help) route group layout"
```

---

## Task 3: Build the help center page

**Files:**
- Create: `app/(help)/help/page.tsx`

- [ ] **Step 1: Create the page file**

Create `app/(help)/help/page.tsx`:

```tsx
import type { Metadata } from "next"
import { IconSearch } from "@tabler/icons-react"

export const metadata: Metadata = {
  title: "Help Center — Minivoda",
  description: "Guides and answers for jewellers on the Minivoda platform",
}

const CATEGORIES = [
  { icon: "📦", title: "Orders & Shipping", meta: "8 articles" },
  { icon: "💎", title: "Browse & Search", meta: "6 articles" },
  { icon: "💳", title: "Payments & Invoices", meta: "5 articles" },
  { icon: "🔁", title: "Returns & Disputes", meta: "4 articles" },
  { icon: "🏠", title: "Account & Settings", meta: "5 articles" },
  { icon: "📞", title: "Contact Support", meta: "Get in touch" },
]

const POPULAR_ARTICLES = [
  "How do I place an order?",
  "Understanding diamond grading reports",
  "How are invoices generated?",
  "Track my order status",
  "Return and refund policy",
]

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
  )
}
```

- [ ] **Step 2: Verify types and build**

```bash
npm run typecheck
```

Expected: no errors.

```bash
npm run build
```

Expected: build completes with no errors. The output should include a static route entry for `/help`.

- [ ] **Step 3: Smoke test manually**

Start the dev server if not already running:

```bash
npm run dev
```

1. Navigate to `http://localhost:3000/buyer` — confirm the Help button appears (no chevron) and clicking it opens a new tab at `http://localhost:3000/help`.
2. On the help page: confirm the minimal header (wordmark + "Back to Minivoda" link) and footer render without the buyer nav or categories bar.
3. Confirm the hero section, 6 category cards (3×2 grid), and 5 article rows are all visible.
4. Confirm "Back to Minivoda" link navigates to `/buyer` in the same tab.
5. Confirm page content does not stretch beyond `max-w-screen-xl` on a wide viewport.

- [ ] **Step 4: Commit**

```bash
git add app/\(help\)/help/page.tsx
git commit -m "feat(help): build mock help center page"
```
