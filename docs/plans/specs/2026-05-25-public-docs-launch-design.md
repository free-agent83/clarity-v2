# Clarity by Nivoda — public docs launch

**Date:** 2026-05-25
**Status:** Design — pending implementation plan
**Owner:** Chris Learey

## Outcome

Publish the Clarity design system as a public-facing site at `clarity.nivoda.com`, with the component library running as a publicly accessible Storybook at `storybook.clarity.nivoda.com`. Single unified surface covering principles, foundations, brand, content, components, and patterns. Gaps ship visible with placeholder copy rather than hidden.

The site serves two purposes simultaneously:

1. **Working documentation** — the live reference engineers, designers, and PMs use to build Nivoda product.
2. **Case study in AI-first design systems** — a public demonstration of how a design system can be built code-first, agent-consumable, and structured to collapse the traditional design → engineering → design-QA loop. The positioning is explicit: Clarity is an *agentic design system*, and the site itself is the proof.

## Public name

The design system is published as **Clarity by Nivoda**. The internal codebase name (`clarity-v2`, `@nivoda/components`, `@nivoda/tokens`) does not change. The "by Nivoda" suffix sidesteps the SEO collision with VMware's `clarity.design` and anchors the brand to Nivoda.

## URLs

| Surface | URL |
|---|---|
| Documentation site | `clarity.nivoda.com` |
| Component library | `storybook.clarity.nivoda.com` |

Both deploy as separate Vercel projects from the same monorepo.

## Information architecture

```
Get started
Principles     the case study — what makes Clarity an agentic design system
Foundations    color, typography, spacing, elevation, motion, tokens
Brand          direction, colour, logo, typography, photography, iconography,
               application-rules, illustration
Content        voice & tone, writing for UI, terminology
Components     62 individual pages, each with Storybook embed
Patterns       product-listing-page, empty-states, filter-composition,
               loading-states
```

The Resources section in the existing Fumadocs scaffold (`architecture.mdx`, `adrs.mdx`, `changelog.mdx`, `contributing.mdx`, `roadmap.mdx`, `vision.mdx`) is removed entirely. Those are internal artefacts and do not belong in a public surface.

### Principles section content

The Principles section is the explicit case study. Four pages:

- **`principles/index.mdx`** — the elevator pitch: Clarity is a code-first design system built to be consumed by AI agents and engineers writing code directly. The components are the design. There is no interpretation step where drift can happen.
- **`principles/code-first.mdx`** — design lives in code. Tokens are W3C DTCG JSON. Components are real React. Documentation is markdown next to the component. There is no separate "design source of truth" that has to be kept in sync with code.
- **`principles/two-delivery-paths.mdx`** — engineering builds faster without design gates. Design and product self-serve via AI tools, building real working UI against the same library. Both paths use the same components. Both paths produce design-correct output by construction.
- **`principles/built-for-agents.mdx`** — every component ships with a `COMPONENT.md` next to its source. The repo IS the interface for AI agents: no MCP server, no sync, no drift. Storybook stories are executable documentation. The Nx project graph exposes the full system to any agent that asks.

Source material for these pages is plundered from `docs/architecture/architecture.md` (Guiding Principles section, AI Agent Consumption section) and the existing `vision.mdx` content that is being removed from the public site. Content is rewritten for a public, forward-facing audience — no internal-only language (no "Phase D", no "the Design Triad", no references to the experience framework or design engine, no commercial-case framing).

### Landing page

The home page (`app/(home)/page.tsx`) leads with the agentic positioning:

- Hook: "Clarity is an agentic design system."
- Sub-hook: "Code-first. Built to be consumed by AI agents and engineers writing code directly. The components are the design."
- Three pillars (matching the Principles section pages): Code-first / Two delivery paths / Built for agents
- Clear entries into the site (Get started, Components, Principles)

The existing landing page is functional but does not lead with agentic positioning. It is rewritten as part of this work.

## Component pages

Every one of the 62 components in `@nivoda/components` gets a dedicated page under Components. Pages are auto-generated rather than hand-authored.

Each page contains:
- Title (component name)
- Status badge (Stable / Unstable)
- Description (one-line)
- "When to use" section
- Live Storybook embed (iframe pointing at the matching story in `storybook.clarity.nivoda.com`)

A generator script reads existing component sources and `COMPONENT.md` files in `packages/components/src/components/` and produces an MDX page per component. Where a `COMPONENT.md` has real content (description, when-to-use), that content is used. Where it doesn't, the fields launch as placeholder copy ("Placeholder — guidance coming.").

The placeholder approach is deliberate: gaps stay visible so they can be filled in over time as a normal authoring task, rather than disappearing behind a "coming soon" landing.

## Storybook embedding

A small MDX component `<StorybookEmbed story="..." />` iframes a specific Storybook story. The iframe loads `storybook.clarity.nivoda.com/iframe.html?id=<story>` so visitors see the real, live component, not a screenshot.

Storybook is the single source of component truth. Stories never need to be duplicated as inline MDX. New stories appear in the docs automatically the next time the docs site builds.

## Gaps policy

These pages launch with placeholder copy and a visible "gap" treatment:
- `brand/illustration.mdx`
- `content/voice-and-tone.mdx`
- `content/writing-for-ui.mdx`
- `content/terminology.mdx`
- `foundations/motion.mdx`
- `patterns/empty-states.mdx`
- `patterns/filter-composition.mdx`
- `patterns/loading-states.mdx`
- Plus any component pages whose `COMPONENT.md` lacks the relevant section

Each gap renders a clear visual marker so visitors understand the section exists, the system is in active development, and content is forthcoming. No hidden pages, no "404", no "coming soon" — the placeholder *is* the page.

## Brand content authoring

Brand content (colour application rules, logo usage, photography direction, etc.) lives in the existing `brand/` MDX files under `apps/docs/content/brand/`. These were originally synced from `~/Documents/PROJECTS/nivoda/Repos/brand-system/docs/design.md`. Going forward, the Fumadocs MDX files are the source for the public site.

The `brand-system` repo and its `guidelines/editorial-guidelines.html` Vercel deployment were a short-term solution and are being retired. They do not need to be linked from or coexist with the public Clarity site.

## Branch strategy

1. Update `feat/docs-fumadocs` with the latest `dev` (megamenu landing, Tailwind source fix, test-app image changes). 19 commits ahead of dev at merge-base `037dcee`.
2. Implement all docs and Storybook work on `feat/docs-fumadocs`.
3. Strip the Resources section content and nav.
4. Build and run the component page generator.
5. Wire `<StorybookEmbed>` and ensure Storybook is deployable as a standalone Vercel project.
6. Merge `feat/docs-fumadocs` → `dev` once everything builds and deploys cleanly.
7. Promote `dev` → `staging` → `main` per the standard release flow when ready to cut a public release.

## Deployment topology

Two Vercel projects sharing the same Bitbucket repo:

**Project A — `clarity-docs`**
- Source: `apps/docs/`
- Framework: Next.js (Fumadocs)
- Domain: `clarity.nivoda.com`
- Build: `nx build docs` (or equivalent)

**Project B — `clarity-storybook`**
- Source: `packages/components/`
- Framework: Static (Storybook output)
- Domain: `storybook.clarity.nivoda.com`
- Build: `nx storybook-build components`

Both projects build on push to `main`. Preview deployments on PRs.

## What is explicitly out of scope

- Renaming any package, file, or internal identifier from "Clarity V2" to anything else
- Splitting `@nivoda/components` into product and marketing libraries (deferred — to be revisited when there's a real GTM library to publish)
- Filling in the actual content for stub pages (separate, ongoing authoring work — not a launch blocker)
- Migrating any content from `brand-system/guidelines/editorial-guidelines.html` to Fumadocs (the brand MDX files are sufficient for v1)
- Authentication, access control, IP allowlists (everything is public)
- Search indexing optimisation beyond Fumadocs defaults
- Analytics beyond Vercel's built-in

## Success criteria

- `clarity.nivoda.com` resolves and serves the docs site over HTTPS
- `storybook.clarity.nivoda.com` resolves and serves Storybook over HTTPS
- Every component in `@nivoda/components` has a dedicated page under Components
- Every component page renders a working Storybook embed
- Gap pages render with a clear placeholder treatment
- No Resources section visible in nav or accessible by URL
- Build pipeline runs cleanly on push to `dev` and produces a preview deployment
