# Clarity V2 — Engineering Proposal

*For: Abhishek (engineering leadership)*
*From: Chris (design function)*
*Date: 8 April 2026*
*Status: Draft — pending conversation*

---

## TL;DR

I've been rebuilding Nivoda's design system from the ground up. It's called Clarity V2. It's designed so that **whatever your engineers build using it ships design-correct on the first pass** — no design QA loop, no drift, no revision cycles. The same library is also agent-consumable, so design and PM can build directly against it when they want to. But the primary structural win is for engineering: your team stops waiting on design review, and design stops burning hours catching MUI drift.

**I'm not asking for a migration commitment yet.** I'm asking for three things:

1. **A review conversation** — 30 minutes to walk you through what's built and why
2. **Permission to land Clarity V2 in the platform monorepo** as a dependency when the time comes — no code changes on your side, just agreement that the package is safe to import
3. **Input on migration strategy** — whenever you're ready. I have three options drafted below that we should pick between together.

Everything else I can continue building without blocking you. I'll come back when there's something concrete to decide on.

---

## Context

The existing platform design system (`libs/shared/components` + `libs/shared/theme` + `libs/shared/style-dictionary`) has accumulated significant legacy:

- **Material UI v7** as the underlying library with years of workarounds, custom theme overrides, and `sx` prop sprawl
- **Not mobile-responsive by default** — retrofitted rather than designed in
- **Not agent-consumable** — components lack the clean type contracts and colocated documentation that AI coding agents need to use components reliably
- **60+ components** with 48 component-specific token files

None of this is anyone's fault. It's normal for a system that's been live for years. But it's reaching the point where engineers routinely build around it rather than with it, and it can't be the foundation we use to take advantage of AI-assisted development.

I've audited the existing system thoroughly (`docs/research/ds-diagnosis.md`) and built Clarity V2 as a replacement — built from first principles for 2026 tooling, agent-consumable by default, and designed to replace platform incrementally.

---

## What Clarity V2 actually is

A standalone design system monorepo (`clarity-v2`) that contains:

### 1. A token pipeline that's already aligned with platform's values

- Nx monorepo, `packages/tokens/`
- W3C DTCG format (the 2025 standard), OKLCH color space
- Bespoke ~200-line build script (not Style Dictionary — I evaluated it and it added more complexity than it saved for our scale; ADR-001 has the detail)
- Outputs: web CSS variables, shadcn-flat CSS (light + dark), JS/TS exports, React Native objects, JSON
- **Token values are aligned with platform production values** — I did a side-by-side audit of every palette and made 15 explicit decisions. The brand violet, status colors, and neutrals all match what's in production today. See `docs/design/token-decisions.md`.
- This means **migration causes zero visual drift** — the colors in Clarity V2 are already the colors engineering's production apps use.

### 2. A component library foundation

- `packages/components/` — shadcn/ui + Radix UI + Tailwind CSS v4
- React 19, zero-runtime CSS, clean TypeScript contracts
- One production component (Button) complete with variants, stories, and full accessibility
- **Core component set being built right now** (Phase B — next 2 weeks): Input, Select, Checkbox, Radio, Switch, Card, Dialog, Tabs, Alert, Badge, Tooltip, etc.

### 3. Documentation and architecture

- Four Architectural Decision Records covering the key technology choices (ADR-001 to ADR-004)
- Full technical architecture document (`docs/architecture/architecture.md`)
- Platform audit and token comparison (`docs/design/token-alignment.md`)
- Testing infrastructure (vitest, 20 tests passing on the token pipeline)

### 4. A clear governance model

See `VISION.md`. Clarity V2 is the "law" — components with clear intent and binding precedent. It sits alongside the Experience Framework (the "constitution" — rules for how to build correctly) and the Design Engine (the "government" — what to build and why). Together they form the system the rest of the org (and its agents) plug into.

---

## Why this matters commercially

### The core outcome: design QA collapses to near zero

Today, Nivoda features ship through a design → engineering → design-QA loop. Design specs the screen, your team implements it, design reviews the implementation, catches drift, files corrections, your team revises, design re-reviews. Ship.

That loop exists because the current MUI-based design system doesn't guarantee that "correctly implemented" means "design-correct". Engineers have to interpret mockups. Design has to catch the drift. MUI's `sx` prop makes it easy to deviate from the theme. Component variants are inconsistent across the library. The token system was built before the component library and the two have drifted. None of this is anyone's fault — it's a decade of normal legacy.

The loop is where design and engineering velocity both go. And it's where most of your engineers' "waiting on design" time comes from.

**With Clarity V2, the loop collapses.** Engineers import components from `@nivoda/components`. Those components ARE the design — they encode the tokens, spacing, typography, accessibility, and variants that design already approved when the component was built. There is no path by which an engineer can build something "correctly" that is also "design-incorrect". The guard-rails are in the component APIs.

Concretely, this means:

- Your team ships features without waiting for design review
- Design doesn't need to review implementations because there's nothing to catch
- The design hours freed from QA go into building more components, better documentation, governance — work that makes the system stronger, which compounds
- Your engineers stop context-switching between "write code" and "wait for feedback"

This is the single biggest structural change to product velocity Nivoda can make right now, and **it's the primary reason I'm bringing this to you first**. Self-service for design/PM is a bonus enabled by the same work. But the main commercial lever is what happens when your team is building with it.

### The secondary benefit: platform modernisation without a rewrite

Because the token values are already aligned with platform production (I did a full audit and made 15 explicit alignment decisions — see `docs/design/token-decisions.md`), Clarity V2 components can be introduced into platform gradually:

- New features built on Clarity V2 components instead of MUI
- When an existing MUI component is touched for any reason, it can optionally be replaced with its Clarity V2 equivalent
- Over time, platform becomes Clarity V2-native without a single "big migration sprint"
- Engineering doesn't have to stop what they're doing to adopt it

The incremental path is explicit. No big bang. No feature freeze. No "migrate Q3 2026 or bust." Legacy MUI stays stable until the code is touched for another reason.

### The tertiary benefit: self-service for design and product

Because the library is built to be consumed by AI coding agents, designers and PMs with tools like Claude Code can also build directly against it. Feature prototypes in hours. Meaningful UI changes without engineering tickets. Pressure relieved from your team for small changes, quick experiments, and one-off internal tools.

**Planned validation (Phase B):** Once the core component set is in place, I intend to rebuild a real Nivoda customer screen with Claude Code + Clarity V2 as a live test of the self-service loop. The goal isn't a polished demo on a deadline — it's to validate that the components hold up under real use and to surface any gaps. If it works as expected, the result is a recognisable screen that shows *"a designer built this in hours; the same library is what engineering will import to ship without waiting for design review."*

---

## What I need from you

Three things, in order of urgency:

### 1. A review conversation (~30 minutes, soon)

Walk through the repo together. I'll show you:
- The token pipeline and how it's aligned with platform
- The architecture and the ADRs
- The Button component and how it's built
- The next 2-week plan and the leadership demo
- This document and the migration options in the next section

The goal of the conversation is **mutual understanding and your technical feedback**, not a commitment.

### 2. Agreement to accept Clarity V2 as a platform dependency when the time comes

When the component library is ready and the first new feature wants to use it, I need your OK to add `@nivoda/tokens` and `@nivoda/components` as dependencies in platform's `package.json`. No refactor. No migration. Just "yes, this package is safe to import."

I can do the integration work myself if you don't have bandwidth, but I need your sign-off that the package is allowed in.

### 3. Input on migration strategy (whenever you're ready)

See the next section for the three options. I have a preferred option but want your input before picking. This is the Phase C decision — it doesn't have to happen this week.

---

## Migration strategy — three options

### Option A — Strangler fig (incremental replacement across all apps)

Clarity V2 components coexist with MUI. Component-by-component, MUI instances in platform get replaced with Clarity V2 equivalents as features are touched. Both systems run in parallel during migration.

**Pros:**
- No feature freeze, no dedicated migration sprint
- Low risk — each replacement is small and reviewable
- Works across all platform apps at the same pace as they're being worked on
- Engineering decides per-component when to swap; design provides the replacements and migration notes

**Cons:**
- Long tail — some MUI components might live for years in rarely-touched code paths
- Visual consistency during the transition requires care (token alignment already solves most of this)
- Bundle size bloat during transition as both libraries ship

**Best if:** Engineering wants to spread the work out and avoid disruption. Most similar to how GitHub did it with Primer.

### Option B — Surface-by-surface (take one app to completion first)

Pick one platform app (customer? admin? supplier?) and migrate it entirely to Clarity V2. Then move to the next. MUI stays untouched in the other apps during.

**Pros:**
- One surface becomes a reference implementation — shows what "done" looks like
- Cleaner visual consistency within a surface
- Clearer ownership — "customer app is Clarity V2, admin is MUI" is an easy status to communicate
- Faster end-to-end proof

**Cons:**
- The first surface bears all the cost of learning
- Picking the wrong first surface could drag on
- Not all surfaces are the same complexity

**Best if:** Engineering wants a clear milestone to point at and is willing to commit dedicated time to one surface. Most similar to how some Airbnb teams have done component library migrations.

### Option C — Opportunistic greenfield (new features only)

Don't migrate existing platform code at all. New features are built on Clarity V2. Old MUI code stays where it is and dies gradually as old features are rewritten or removed for other reasons.

**Pros:**
- Lowest engineering overhead — no migration work at all
- Engineering's time stays on product work
- Old code stays stable; new code gets the new foundation
- Fastest to start — no coordination required

**Cons:**
- Platform stays split between two systems forever (or until the old code naturally dies)
- Visual consistency across old and new features might drift
- Requires discipline — engineers have to remember to reach for Clarity V2 when writing new code

**Best if:** Engineering can't commit dedicated migration time but wants to stop the bleeding and have new work land on the new foundation. The pragmatic choice when migration isn't funded.

### My preference

**Option C to start, with Option A emerging naturally over time.** Build new features on Clarity V2 from day one. Let old MUI code stay stable until it's touched. When a component is touched, replace it with the Clarity V2 equivalent if the swap is trivial (which, thanks to token alignment, it usually will be).

This gets us moving without forcing a migration decision, and it sets up the natural path to Option A once the team is comfortable.

**But this is your call.** You know platform's realities better than I do.

---

## What I'm NOT asking for

I want to be specific about this because I don't want to appear to be asking engineering to drop everything:

- I'm **not asking** you to commit dev time to platform migration in the next 2 weeks
- I'm **not asking** you to pause feature work
- I'm **not asking** you to make a migration strategy decision today
- I'm **not asking** for a review of every component decision — I have a designer's view on those and will escalate when I need an engineering view
- I'm **not proposing** we deprecate the existing MUI system on any timeline
- I'm **not asking** to modify `libs/shared/components`, `libs/shared/theme`, or `libs/shared/style-dictionary` — those stay as they are until we mutually agree otherwise

---

## What I've already done (so you can evaluate the quality of the work)

- **Phase A complete:** token pipeline, architecture, 15 token alignment decisions, one production component, full test suite, 4 ADRs
- **Platform audit done:** full inventory of platform's existing design system is in `docs/research/` and informed the token decisions
- **ROADMAP written:** phased plan is in `ROADMAP.md`
- **Governance model documented:** `VISION.md` explains how this relates to the Experience Framework and Design Engine

All of it is in a clean, reviewable Git history on the `feat/token-alignment-phase1` branch.

---

## Open questions from me to you

Things I want your input on during the review conversation:

1. **Platform build system compatibility.** Clarity V2 uses Nx + Vite + Tailwind v4 + React 19. Platform is also Nx + React 19. Are there any known integration issues I should plan around?
2. **Publishing strategy.** When we're ready, how do you want Clarity V2 delivered? `file:` linking? Private npm registry? Git submodule? Something else?
3. **Versioning.** Semver from day one, or delay until first real consumer?
4. **Storybook hosting.** Platform's Storybook is self-hosted behind VPN (post-Chromatic-incident). Should Clarity V2's Storybook land in the same place? Or a separate subdomain? Or inside Fumadocs?
5. **CI integration.** Does the platform CI need to validate Clarity V2 against platform apps? Or do we rely on Clarity V2's own tests?
6. **Migration incident recovery.** If we adopt Option C (opportunistic) and a new feature built on Clarity V2 breaks in production, what's the rollback story? (This is less a question and more a thing we should agree on before we ship anything.)

---

## Next steps after this document lands in your inbox

1. I send you this document
2. We pick a 30-minute slot in the next week
3. I walk you through the repo live; you ask whatever you want
4. We agree on whether to proceed (and if so, on what terms)
5. You point me at any integration or CI constraints I need to plan for
6. I keep building in parallel, come back when there's something real to integrate

**I don't need you to do anything until step 2.** This document is the homework.
