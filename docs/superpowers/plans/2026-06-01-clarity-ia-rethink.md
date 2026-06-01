# Clarity docs IA rethink — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the Clarity docs site IA: remove homepage principle cards, move the COMPONENTS.md action buttons to the Components index, add a cross-cutting "Working with AI agents" page structure across all sections, delete the Illustration page, and route a new per-section IA page type through the source resolver and sidebar.

**Architecture:** All content lives in `apps/docs/`. MDX content files are in `apps/docs/content/<section>/`. The page renderer at `apps/docs/app/docs/[[...slug]]/page.tsx` decides whether to show the agent spec action buttons. The source resolver at `apps/docs/lib/source.ts` decides which Fumadocs collection handles each URL, and builds the sidebar tree. A new pattern — IA editorial pages colocated alongside COMPONENT.md-sourced pages under `content/components/` — requires a small routing and sidebar change.

**Tech Stack:** Next.js 15 (App Router), Fumadocs, TypeScript, MDX. No new dependencies required.

---

## File map

| File | Action | What changes |
|------|--------|--------------|
| `apps/docs/app/(home)/page.tsx` | Modify | Remove `principles` array and section render |
| `apps/docs/app/docs/[[...slug]]/page.tsx` | Modify | Change button trigger from `get-started/working-with-ai-agents` to `components` (index) |
| `apps/docs/lib/source.ts` | Modify | `resolveSource`: check iaSource first for sub-paths under `components/`; `getCombinedPageTree`: prepend IA pages from `content/components/` to Components folder children |
| `apps/docs/content/brand/illustration.mdx` | Delete | Empty page, creation = Plasma |
| `apps/docs/content/get-started/working-with-ai-agents.mdx` | Rewrite | Broaden to cross-cutting principle; remove component-specific content; link to per-section pages |
| `apps/docs/content/components/working-with-ai-agents.mdx` | Create | Two-tier read model content moved here from get-started page |
| `apps/docs/content/foundations/working-with-ai-agents.mdx` | Create | Stub |
| `apps/docs/content/patterns/working-with-ai-agents.mdx` | Create | Stub |
| `apps/docs/content/content/working-with-ai-agents.mdx` | Create | Stub |
| `apps/docs/content/brand/working-with-ai-agents.mdx` | Create | Stub |

---

## Worktree setup

- [ ] **Create a worktree for this work**

```bash
# From repo root
git worktree add .worktrees/docs-ia-rethink -b feat/docs-ia-rethink
cd .worktrees/docs-ia-rethink
```

---

## Task 1: Remove principle cards from the homepage

**Files:**
- Modify: `apps/docs/app/(home)/page.tsx`

The homepage currently renders three "principle cards" (Code-first, Two delivery paths, Built for agents) in a grid section below the CTAs. Remove them — the landing becomes: wordmark + h1 + lede + two CTAs only.

- [ ] **Step 1: Remove the `principles` array and its render**

In `apps/docs/app/(home)/page.tsx`, delete the `principles` const (lines 5–24) and the entire `<section className="home-grid-3 ...">` block (the second section element in the JSX, rendering the principle cards). Keep everything else: `ThemeWordmark`, `h1`, `p.home-lede`, and the two `<Button>` CTAs.

After the edit, `HomePage` should render only:

```tsx
export default function HomePage() {
  return (
    <main className="home-page min-h-screen flex flex-col items-center px-6 py-24">
      <div className="home-hero max-w-4xl w-full text-center">
        <ThemeWordmark className="h-8 mx-auto mb-10 opacity-90" />
        <h1 className="home-hero-title">
          Clarity is an <em>agentic design system.</em>
        </h1>
        <p className="home-lede w-full mx-auto">
          Code-first and agent-readable. Tokens, components, and docs live in
          one repo, so whoever builds UI ships design-correct output by
          construction.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/docs/get-started">Get started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/docs/components">Browse components</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
```

Also remove the now-unused `const principles` array and the `as const` type cast at the top of the file.

- [ ] **Step 2: Verify — check TypeScript compiles**

```bash
cd apps/docs && npx tsc --noEmit
```

Expected: no errors related to this file.

- [ ] **Step 3: Commit**

```bash
git add apps/docs/app/\(home\)/page.tsx
git commit -m "feat(docs): remove principle cards from homepage"
```

---

## Task 2: Move COMPONENTS.md buttons to the Components index page

**Files:**
- Modify: `apps/docs/app/docs/[[...slug]]/page.tsx`

Currently the agent spec action buttons (Preview / Copy / Open in Claude / Open in Cursor) appear on the `get-started/working-with-ai-agents` page, loaded with the full `COMPONENTS.md` content. The spec moves them to `/docs/components` (the Components section index page), which is an IA page at `slugPath === 'components'`.

- [ ] **Step 1: Update the trigger condition in page.tsx**

In `apps/docs/app/docs/[[...slug]]/page.tsx`, find:

```ts
const isAgentWorkflowPage =
  section === 'ia' && slugPath === 'get-started/working-with-ai-agents';

const agentSpecMarkdown = isAgentWorkflowPage
  ? await readRepoMarkdown('packages/components/COMPONENTS.md')
  : section === 'components'
    ? await data.getText('raw')
    : null;

const agentSpecDownloadFilename = isAgentWorkflowPage
  ? 'COMPONENTS.md'
  : 'COMPONENT.md';
```

Replace with:

```ts
const isComponentsIndexPage =
  section === 'ia' && slugPath === 'components';

const agentSpecMarkdown = isComponentsIndexPage
  ? await readRepoMarkdown('packages/components/COMPONENTS.md')
  : section === 'components'
    ? await data.getText('raw')
    : null;

const agentSpecDownloadFilename = isComponentsIndexPage
  ? 'COMPONENTS.md'
  : 'COMPONENT.md';
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd apps/docs && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/docs/app/docs/\[\[...slug\]\]/page.tsx
git commit -m "feat(docs): move COMPONENTS.md action buttons to components index page"
```

---

## Task 3: Delete the Illustration page

**Files:**
- Delete: `apps/docs/content/brand/illustration.mdx`

The illustration page is empty and belongs in Plasma (creation system), not Clarity.

- [ ] **Step 1: Delete the file**

```bash
rm apps/docs/content/brand/illustration.mdx
```

- [ ] **Step 2: Remove the stale `illustration` entry from `IA_SECTION_CHILD_ORDER`**

In `apps/docs/lib/source.ts`, find the `brand` array in `IA_SECTION_CHILD_ORDER` (around line 240):

```ts
brand: [
  'direction',
  'logo',
  'colour',
  'typography',
  'photography',
  'iconography',
  'application-rules',
  'illustration',
],
```

Remove `'illustration'` from the array:

```ts
brand: [
  'direction',
  'logo',
  'colour',
  'typography',
  'photography',
  'iconography',
  'application-rules',
],
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd apps/docs && npx tsc --noEmit
```

Expected: no errors. Fumadocs will simply stop generating a route for the deleted page.

- [ ] **Step 4: Commit**

```bash
git add apps/docs/content/brand/illustration.mdx apps/docs/lib/source.ts
git commit -m "feat(docs): remove illustration page (creation = Plasma)"
```

---

## Task 4: Update source resolver and sidebar for IA pages under `content/components/`

**Files:**
- Modify: `apps/docs/lib/source.ts`

Currently `resolveSource` sends any URL starting with `/docs/components/` to `componentsSource` (the COMPONENT.md collection). We need a new IA page type: editorial MDX pages under `apps/docs/content/components/` (e.g. `working-with-ai-agents.mdx`). These have slugs like `['components', 'working-with-ai-agents']` in `iaSource` and must be routed to `iaSource`, not `componentsSource`.

Additionally, `getCombinedPageTree` must include these IA pages at the top of the Components sidebar folder (before the functional component groups).

- [ ] **Step 1: Update `resolveSource` to check iaSource first for sub-paths under `components/`**

In `apps/docs/lib/source.ts`, find:

```ts
if (segs[0] === 'components') {
  return { source: componentsSource, slug: segs.slice(1), section: 'components' };
}
```

Replace with:

```ts
if (segs[0] === 'components') {
  // IA editorial pages colocated under content/components/ (e.g. working-with-ai-agents)
  // must be served from iaSource, not componentsSource.
  if (segs.length > 1) {
    const iaPage = iaSource.getPage(segs);
    if (iaPage) {
      return { source: iaSource, slug: segs, section: 'ia' };
    }
  }
  return { source: componentsSource, slug: segs.slice(1), section: 'components' };
}
```

- [ ] **Step 2: Add a helper to build IA editorial pages for a section**

In `apps/docs/lib/source.ts`, add a helper function immediately before `getCombinedPageTree`:

```ts
/**
 * Returns IA pages nested under a given section that are NOT the section index.
 * Used to prepend editorial pages (e.g. "Working with AI agents") to a
 * sidebar folder whose children are otherwise built from a different collection.
 */
function getIaEditorialPages(sectionKey: string): SidebarNode[] {
  return iaSource
    .getPages()
    .filter((p) => p.slugs[0] === sectionKey && p.slugs.length > 1)
    .map((p) => ({
      type: 'page' as const,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name: (p.data as any).title ?? p.slugs[p.slugs.length - 1],
      url: p.url,
    }));
}
```

- [ ] **Step 3: Prepend IA editorial pages to the Components sidebar folder**

In `getCombinedPageTree`, find the block that inserts the Components folder (inside the `if (sectionKey === 'foundations')` branch):

```ts
sections.push({
  type: 'folder',
  name: 'Components',
  root: false,
  ...(componentsIndexPage
    ? {
        index: {
          type: 'page',
          name: componentsIndexPage.data.title,
          url: componentsIndexPage.url,
        },
      }
    : {}),
  children: componentsChildren,
});
```

Replace with:

```ts
const componentsEditorialPages = getIaEditorialPages('components');
sections.push({
  type: 'folder',
  name: 'Components',
  root: false,
  ...(componentsIndexPage
    ? {
        index: {
          type: 'page',
          name: componentsIndexPage.data.title,
          url: componentsIndexPage.url,
        },
      }
    : {}),
  children: [...componentsEditorialPages, ...componentsChildren],
});
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd apps/docs && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/docs/lib/source.ts
git commit -m "feat(docs): route IA editorial pages under components/ to iaSource; include in sidebar"
```

---

## Task 5: Create the Components "Working with AI agents" page

**Files:**
- Create: `apps/docs/content/components/working-with-ai-agents.mdx`

This page receives the two-tier read model content that was previously on the get-started page. It explains how agents should consume the component library: COMPONENTS.md first, then individual COMPONENT.md files.

- [ ] **Step 1: Create the page**

```bash
cat > apps/docs/content/components/working-with-ai-agents.mdx << 'EOF'
---
title: Working with AI agents
description: How to use the Clarity component library with a coding agent — the two-tier read model.
---

Clarity is built for two readers at once. **You** use this site to browse components, read usage guidance, and grab snippets. **Your coding agent** reads markdown directly from the cloned repo — not from this website. That split is intentional.

Use the **Preview / Copy / Open in Claude** actions on the [Components overview](/docs/components) to access the full `COMPONENTS.md` library map — the same file you'd attach in your IDE.

## Two-tier read model

Agents should not open all component specs upfront. The library uses two layers:

1. **`COMPONENTS.md`** — the library map at `packages/components/COMPONENTS.md`. Theme summary, operating principles, and a full index with "for / not for" one-liners for every component. **Read this first.**
2. **`COMPONENT.md`** — one file per component, colocated with source. Props, usage, best practices, and checklists. Read only the specs you need.

Each component page in this section exposes the same header actions for that component's `COMPONENT.md` — for example [Field](/docs/components/atoms/field) when implementing a form field.

## What else lives in the repo

- **`CONTRIBUTING.md`** (`packages/components/`) — rules for changing the library, not for consuming it.
- **Token JSON** (`packages/tokens/src/`) — W3C DTCG source; compiled to CSS for components.
- **Storybook stories** — executable composition examples next to each component.

For the philosophy behind this model, see [Built for agents](/docs/principles/built-for-agents). For the cross-cutting overview of how agents work across all sections of Clarity, see [Working with AI agents](/docs/get-started/working-with-ai-agents).
EOF
```

- [ ] **Step 2: Verify the page is reachable**

Start the dev server if not running:

```bash
cd apps/docs && npx next dev --port 3001
```

Open `http://localhost:3001/docs/components/working-with-ai-agents`. Expected: page renders with title "Working with AI agents" and appears in the sidebar under Components (above the component groups).

- [ ] **Step 3: Commit**

```bash
git add apps/docs/content/components/working-with-ai-agents.mdx
git commit -m "feat(docs): add components/working-with-ai-agents page with two-tier read model"
```

---

## Task 6: Rewrite the Get started "Working with AI agents" page

**Files:**
- Modify: `apps/docs/content/get-started/working-with-ai-agents.mdx`

The existing page is narrowly scoped to the component library. It should become the broad, cross-cutting statement: every section of Clarity has a machine-readable form designed for agent consumption. The component-specific detail now lives at `content/components/working-with-ai-agents.mdx`.

- [ ] **Step 1: Rewrite the page**

Replace the full content of `apps/docs/content/get-started/working-with-ai-agents.mdx` with:

```mdx
---
title: Working with AI agents
description: How Clarity is designed for machine consumption — every section has a repo-native, agent-readable form.
---

Clarity is designed for two readers at once: humans using this site, and coding agents reading files from the cloned repo. That split runs across every section — not just components.

Every section of Clarity has a machine-readable form:

| Section | What agents read |
|---------|-----------------|
| **Components** | `packages/components/COMPONENTS.md` (library map) + per-component `COMPONENT.md` files |
| **Foundations** | Token JSON at `packages/tokens/src/` — W3C DTCG format |
| **Patterns** | Pattern specs colocated with source |
| **Content** | UX copy guidelines consumable as plain text |
| **Brand** | Brand standards in structured form |

Each section has its own "Working with AI agents" page with specifics. Start with the section you are working in:

- [Components → Working with AI agents](/docs/components/working-with-ai-agents)
- [Foundations → Working with AI agents](/docs/foundations/working-with-ai-agents)
- [Patterns → Working with AI agents](/docs/patterns/working-with-ai-agents)
- [Content → Working with AI agents](/docs/content/working-with-ai-agents)
- [Brand → Working with AI agents](/docs/brand/working-with-ai-agents)

## The repo is the interface

Agents do not read this website. They read files from the repo. This site is for humans — it explains the system, shows live demos, and provides context. When you hand a task to a coding agent, point it at the relevant repo files, not at this URL.

For the principles behind this design, see [Built for agents](/docs/principles/built-for-agents).
```

- [ ] **Step 2: Verify the page renders**

Open `http://localhost:3001/docs/get-started/working-with-ai-agents`. Expected: new content renders, all links are valid.

- [ ] **Step 3: Commit**

```bash
git add apps/docs/content/get-started/working-with-ai-agents.mdx
git commit -m "feat(docs): rewrite working-with-ai-agents as cross-cutting principle page"
```

---

## Task 7: Create per-section "Working with AI agents" stubs

**Files:**
- Create: `apps/docs/content/foundations/working-with-ai-agents.mdx`
- Create: `apps/docs/content/patterns/working-with-ai-agents.mdx`
- Create: `apps/docs/content/content/working-with-ai-agents.mdx`
- Create: `apps/docs/content/brand/working-with-ai-agents.mdx`

These are intentional stubs. They establish the page structure and signal what is coming. Each should be honest about being incomplete rather than presenting an empty page without explanation.

- [ ] **Step 1: Create Foundations stub**

Create `apps/docs/content/foundations/working-with-ai-agents.mdx`:

```mdx
---
title: Working with AI agents
description: How agents consume Clarity's design tokens — coming soon.
---

This page documents how to point a coding agent at Clarity's token files: the W3C DTCG JSON structure, where files live in the repo, and what an agent can do with them directly.

*Coming soon.*
```

- [ ] **Step 2: Create Patterns stub**

Create `apps/docs/content/patterns/working-with-ai-agents.mdx`:

```mdx
---
title: Working with AI agents
description: How agents use Clarity's pattern-level specs — coming soon.
---

This page documents how coding agents consume pattern specs. The PLP and PDP kits ship with their own markdown — the same two-tier read model as components, applied at the composition level.

*Coming soon.*
```

- [ ] **Step 3: Create Content stub**

Create `apps/docs/content/content/working-with-ai-agents.mdx`:

```mdx
---
title: Working with AI agents
description: How agents consume Clarity's UX copywriting standards — coming soon.
---

This page documents how coding agents consume Clarity's UX copy guidelines — terminology, writing-for-UI standards, and error message patterns — when building product interfaces.

*Coming soon.*
```

- [ ] **Step 4: Create Brand stub**

Create `apps/docs/content/brand/working-with-ai-agents.mdx`:

```mdx
---
title: Working with AI agents
description: How agents consume Clarity's brand implementation standards — coming soon.
---

This page documents how coding agents consume Clarity's brand standards when implementing brand-correct UI: colour tokens, typography tokens, logo usage rules, and iconography.

*Coming soon.*
```

- [ ] **Step 5: Verify all four pages are reachable**

Open each URL and confirm it renders:
- `http://localhost:3001/docs/foundations/working-with-ai-agents`
- `http://localhost:3001/docs/patterns/working-with-ai-agents`
- `http://localhost:3001/docs/content/working-with-ai-agents`
- `http://localhost:3001/docs/brand/working-with-ai-agents`

Each should appear in the sidebar under its section.

- [ ] **Step 6: Commit**

```bash
git add \
  apps/docs/content/foundations/working-with-ai-agents.mdx \
  apps/docs/content/patterns/working-with-ai-agents.mdx \
  apps/docs/content/content/working-with-ai-agents.mdx \
  apps/docs/content/brand/working-with-ai-agents.mdx
git commit -m "feat(docs): add working-with-ai-agents stubs for foundations, patterns, content, brand"
```

---

## Task 8: Review and update Content section framing

**Files:**
- Modify: `apps/docs/content/content/index.mdx`

The Content section index should clearly state its scope: UX copywriting (button labels, error messages, empty states, in-product terminology). Brand content and marketing copy belong in Plasma, not here.

- [ ] **Step 1: Read the current index**

Read `apps/docs/content/content/index.mdx`. Current content:

```
---
title: Content
description: Voice, terminology, and writing patterns for the marketplace.
---

Content is design. The words in a button, an empty state, or an error message do as much work as the layout around them. This section is the editorial spine of Clarity by Nivoda.
```

- [ ] **Step 2: Update the framing to be explicit about UX copywriting scope**

Replace with:

```mdx
---
title: Content
description: UX copywriting standards for Clarity — button labels, error messages, empty states, and in-product terminology.
---

Content is design. The words in a button, an empty state, or an error message do as much work as the layout around them.

This section covers **UX copywriting** — the writing that lives inside the product interface. Brand content, marketing copy, and campaign writing are part of Plasma, Nivoda's brand creation system.
```

- [ ] **Step 3: Verify the page renders**

Open `http://localhost:3001/docs/content`. Expected: updated description renders correctly.

- [ ] **Step 4: Commit**

```bash
git add apps/docs/content/content/index.mdx
git commit -m "feat(docs): clarify content section scope — UX copywriting only, not brand content"
```

---

## Final verification

- [ ] **Run a full type check**

```bash
cd apps/docs && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Check all nav links work**

Walk through the sidebar manually or with a link checker. Confirm:
- Homepage loads with no principle cards
- Components index shows the action buttons (Preview/Copy/Open in Claude/Open in Cursor)
- Components → Working with AI agents page exists in the sidebar and renders
- All four section stubs exist in their respective sidebars
- Brand section has no Illustration entry
- Content index reads "UX copywriting"

- [ ] **Use superpowers:finishing-a-development-branch to complete the work**
