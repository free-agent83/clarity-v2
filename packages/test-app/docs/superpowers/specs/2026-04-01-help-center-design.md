# Help Center Page — Design Spec

**Issue:** #9
**Date:** 2026-04-01
**Branch:** issue-9

---

## Overview

Wire up the Help button in the buyer nav to open a standalone help center page in a new tab. The page lives outside the buyer shell and has its own minimal layout.

---

## 1. Help Button (buyer-nav.tsx)

**Current state:** A `<button>` with `IconHelp`, a label, and `IconChevronDown` — no click handler.

**Changes:**
- Replace `<button>` with a Next.js `<Link href="/help" target="_blank" rel="noopener noreferrer">`.
- Remove `IconChevronDown` entirely (no dropdown planned at this stage).
- Keep all existing visual styles unchanged (`flex w-27.5 items-center gap-2 rounded-lg bg-foreground px-3 py-3 text-sm font-medium text-background`).

---

## 2. Route Structure

```
app/
  (help)/
    layout.tsx     # Minimal standalone layout
    help/
      page.tsx     # Help center content
```

URL: `/help`
Auth: None required — this route group sits outside `/buyer/*` so the Supabase session middleware does not apply. Publicly accessible.

---

## 3. Layout — `app/(help)/layout.tsx`

Minimal standalone layout with no buyer nav, no categories bar, no realtime shell.

**Header:**
- White background, bottom border (`border-b border-border`)
- Left: Minivoda wordmark (same logomark used in `buyer-nav.tsx`)
- Right: "Back to Minivoda" link → `href="/buyer"`, opens in same tab, small muted text style

**Footer:**
- Top border, muted background (`bg-muted`)
- Centered copyright line: `© 2025 Minivoda · All rights reserved`
- Small text, muted foreground colour

**Body:**
- `<main>` fills the space between header and footer
- No padding applied at layout level — the page handles its own spacing

---

## 4. Help Center Page — `app/(help)/help/page.tsx`

Static Server Component (no data fetching — all content is hardcoded mock data).

### Layout wrapper
- `max-w-screen-xl mx-auto px-6 py-10` — constrains content width and centres it on wide screens

### Section 1: Hero
- Centred, muted background block (`bg-muted rounded-xl`)
- Heading: `"How can we help?"`
- Subheading: `"Guides and answers for jewellers on the Minivoda platform"`
- Search bar: styled `<input>` with search icon, placeholder `"Search for articles, guides, and FAQs..."` — **no functionality wired** (Phase 0 is visual only)

### Section 2: Category grid
Label: `"Browse by topic"` (small uppercase muted label)

6 category cards in a `grid-cols-3` grid:

| Icon | Title | Article count |
|---|---|---|
| 📦 | Orders & Shipping | 8 articles |
| 💎 | Browse & Search | 6 articles |
| 💳 | Payments & Invoices | 5 articles |
| 🔁 | Returns & Disputes | 4 articles |
| 🏠 | Account & Settings | 5 articles |
| 📞 | Contact Support | Get in touch |

Each card: border, rounded corners, centred icon + title + article count. **Not clickable in Phase 0** — no article detail pages exist yet.

### Section 3: Popular articles
Label: `"Popular articles"` (same small uppercase muted label style)

5 article rows, each a bordered rounded block with title on the left and a `›` chevron on the right:

1. How do I place an order?
2. Understanding diamond grading reports
3. How are invoices generated?
4. Track my order status
5. Return and refund policy

**Not clickable in Phase 0** — no article detail pages.

---

## 5. Out of scope (Phase 0)

- Search functionality
- Clickable category cards
- Article detail pages
- Contact form
- Dark mode adaptation (can be added later via `next-themes`)

---

## 6. Acceptance criteria

- [ ] Help button in buyer nav opens `/help` in a new tab
- [ ] Help button has no dropdown chevron
- [ ] `/help` renders without the buyer shell (no nav, no categories bar)
- [ ] Page content is constrained to `max-w-screen-xl`
- [ ] All 6 category cards visible
- [ ] 5 popular article rows visible
- [ ] Search bar renders (not wired)
- [ ] "Back to Minivoda" link in header navigates to `/buyer`
