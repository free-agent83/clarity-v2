# Clarity docs site — IA rethink

**Date:** 2026-06-01
**Author:** Chris Learey
**Status:** Approved for implementation

---

## Context

The Clarity docs site was originally structured as a component library reference with an agentic angle. As the project matured, two tensions emerged:

1. The site serves both internal teams and an external audience (design community, stakeholders), but was structured for internal/technical consumption.
2. Brand creation guidance (photography generation, illustration, deck-building) and builder guidance (components, tokens, UX copy) were being mixed into the same IA — forcing go-to-market teams to use two places for what should be one coherent brand system.

This rethink resolves both tensions.

## Architectural decision: Clarity and Plasma

Clarity and a new system — **Plasma** — are formally separated:

**Clarity** is the builder's design system. Public-facing. Components, tokens, patterns, UX copywriting standards, brand implementation guidelines. Primarily consumed by engineers, product designers, and AI coding agents.

**Plasma** is the brand creation system. Internal. Brand content, marketing copy, photography generation, illustration direction, deck-building. Consumed by the go-to-market, comms, and brand team. Plasma is a separate project, out of scope for this spec.

**The public/internal rubric for Clarity:** Content belongs on Clarity if it is about *consuming or implementing a fixed, defined standard*. Content belongs in Plasma if it is about *creating new assets* — including writing, image generation, and illustration.

---

## New information architecture

### Homepage

Remove the three principle cards (Code-first, Two delivery paths, Built for agents). The landing becomes: wordmark + h1 + lede + two CTAs (Get started, Browse components). Clean and minimal. The landing page visual redesign is a separate, later project.

### Get started

- **Overview** (index) — unchanged.
- **Working with AI agents** — rewritten. Currently scoped narrowly to the component library. New scope: the broad cross-cutting principle that every section of Clarity has a machine-readable form for agent consumption. Components, tokens, brand standards, and UX copy guidelines are all designed to be consumed by agents — not just the component library. Links to per-section guidance.

### Principles

Unchanged. Code-first, Two delivery paths, Built for agents. These pages already exist and are well-written. The three principle cards are removed from the homepage but the pages remain, accessible from the sidebar.

### Foundations

- Existing content unchanged.
- Add: **Working with AI agents** (stub) — how agents consume design tokens. The W3C DTCG JSON structure, where token files live in the repo, and what an agent can do with them.

### Components

- **Overview/index** — move the Preview/Copy/Download button set here. Currently these buttons live on the "Working with AI agents" page under Get started; they belong on the component library landing where someone browsing components would actually use them.
- **Working with AI agents** — the existing content from the Get started page (two-tier read model: COMPONENTS.md first, then per-component COMPONENT.md files), refined and scoped to components specifically. This is the most complete "Working with AI agents" page in the system.
- All component pages unchanged.

### Patterns

- Existing content unchanged.
- Add: **Working with AI agents** (stub) — how agents use pattern-level specs. The PLP and PDP kits have their own markdown; the same two-tier model applies at the composition level.

### Content

Scope clarified: **UX copywriting only**. Button labels, error messages, empty states, form copy, in-product terminology. Brand content and marketing copy belong in Plasma.

- Existing content reviewed and rescoped to UX copywriting.
- Add: **Working with AI agents** (stub) — how agents consume UX copy standards when building UI.

### Brand

Scope clarified: **implementation of fixed brand standards only**. Logo usage, colour tokens, typography tokens, photography usage/selection, iconography, application rules. Creation of new brand assets (photography generation, illustration creation) belongs in Plasma.

- **Illustration page removed** from the public site. Illustration is a creation discipline — it belongs in Plasma.
- Existing pages (direction, logo, colour, typography, photography, iconography, application rules) retained as-is — these are usage/implementation guidelines.
- Add: **Working with AI agents** (stub) — how agents consume brand standards correctly. Scoped to implementation: applying brand rules, not generating brand assets.

---

## Summary of changes

| Change | Location | Type |
|--------|----------|------|
| Remove principle cards | Homepage | Content removal |
| Rewrite Working with AI agents | Get started | Content rewrite |
| Move Preview/Copy/Download buttons | Components index | Content move |
| Refine Working with AI agents | Components | Content move + edit |
| Add Working with AI agents stub | Foundations | New stub page |
| Add Working with AI agents stub | Patterns | New stub page |
| Rescope to UX copywriting | Content | Content edit |
| Add Working with AI agents stub | Content | New stub page |
| Remove Illustration page | Brand | Page removal |
| Add Working with AI agents stub | Brand | New stub page |

---

## Out of scope

- Landing page visual redesign (later project).
- Plasma system (separate project).
- Writing the full content for stub pages — stubs are intentional; visible gaps create accountability.
- Any changes to component documentation pages.
- Section reordering (sidebar order unchanged).
