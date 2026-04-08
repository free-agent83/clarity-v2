# Clarity V2 — State of the Design System

*Last updated: 8 April 2026*

## Summary

Clarity V2 is Nivoda's new design system — a rebuild of the component library, design tokens, and documentation that underpin every product surface we ship. It replaces an older Storybook system built on MUI that has accumulated legacy, is not properly mobile responsive, and was not built with AI coding agents in mind.

It exists to enable two things in parallel:

1. **Self-service UI delivery** — designers and product people build working frontends themselves using AI coding agents (Claude Code, Cursor) against Clarity V2, without waiting for engineering capacity.
2. **Platform consistency** — the same components gradually replace the existing MUI-based design system in the production Nivoda platform as new features are built or old ones are touched.

This document is a factual record of where we are, what we're building, and where it's headed. See `docs/plans/ROADMAP.md` for the full phased plan and `TRIAD.md` for how this repo relates to the governance framework and design engine.

## Why we're rebuilding

The previous design system is holding velocity back in three ways:

1. **Legacy drift.** Built on Material UI with years of workarounds and custom overrides. Engineers routinely build around it rather than with it.
2. **Not mobile-ready.** Responsive behaviour was retrofitted rather than designed in. The mobile app maintains parallel components that drift from the web source of truth.
3. **Not agent-ready.** It wasn't built for AI coding agents to consume. Components lack the machine-readable metadata, clean type contracts, and colocated documentation that let an agent implement features reliably without hallucinating patterns.

Point three is the commercial lever. As the organisation moves to AI-assisted delivery, an agent-ready design system means features get built faster, more consistently, and with less rework — **and it means the people who know what should be built (designers, product managers) can ship it themselves, without engineering as a bottleneck.**

This is the commercial case most visible to leadership: we are removing engineering capacity as the single point of failure for UI delivery.

## What we're building

Clarity V2 is built on a deliberately modern, boring stack:

- **React 19** with **shadcn/ui** and **Radix UI** primitives for accessibility and headless behaviour
- **Tailwind CSS v4** for zero-runtime styling — deterministic CSS output, no runtime magic
- **Nx monorepo** for workspace structure and build orchestration
- **W3C DTCG design tokens** (OKLCH color space) as the single source of truth, compiled to CSS variables for web, JavaScript objects for React Native, and JSON for backend/email
- **Bespoke token build pipeline** (~200 lines of Node.js, no Style Dictionary — see ADR-001)
- **Storybook** for interactive component documentation
- **Fumadocs** (planned) for a deployed documentation site

Three structural decisions worth calling out:

**Code is the source of truth, Figma is a scratchpad.** This aligns with how GitHub, Shopify, and Uber run their design systems. Components are versioned, testable, and directly consumable by agents. Designers still design in Figma, but the authoritative definition of any component lives in the repo.

**Tokens feed every platform.** One set of token definitions outputs to web, mobile, and backend. This ends the drift between platforms. Token values align with the existing platform design system (decisions captured in `docs/design/token-decisions.md`) so migration doesn't cause visual drift.

**Components are built to be agent-consumable AND designer-readable.** Each component ships with colocated markdown documentation, clean TypeScript interfaces, and accessible-by-default behaviour. An agent reading the repo has what it needs to use the component correctly without guessing. A designer prompting that agent doesn't need to know React to describe what they want.

## Where we are today

Honest state as of 8 April 2026:

- **Architecture and technical decisions:** Complete. Documented with Architecture Decision Records.
- **Token pipeline:** Working. Outputs to web, shadcn CSS (light + dark), JS/TS, React Native, and JSON.
- **Token alignment with platform:** 15 decisions made and applied. Violet brand color aligned to platform production values. Decisions documented in `docs/design/token-decisions.md`.
- **Button component:** Complete. Five variants, three intents, three sizes, 16 Storybook stories, fully accessible.
- **Other components:** Not yet started. Phase B buildout begins now.
- **Storybook:** Runs locally. Not yet deployed.
- **Fumadocs documentation site:** Planned. Not yet deployed.
- **Mobile components:** Token pipeline outputs ready. Component implementation not yet started.
- **Platform audit:** Complete. 60+ components inventoried in the existing MUI-based system. Basis for token alignment and migration planning.

## The next two weeks

This is the **Phase B — Proof** window. See `docs/plans/ROADMAP.md` for the full phase breakdown.

Concrete targets:

- **Core component set in place** — ~10-15 components covering the primitives and composites for most near-term UI: Input, Textarea, Select, Checkbox, Radio, Switch, Card, Badge, Dialog, Tooltip, Tabs, Alert, Separator, Label (plus the existing Button)
- **Working Nivoda screen demo** — Chris picks a real customer-facing Nivoda screen and rebuilds it using Claude Code + Clarity V2. This is the headline deliverable for the CEO. The message: *"I (a designer, not an engineer) built this in [X hours] using AI, against Clarity V2. Here's what that unlocks."*
- **Engineering proposal document** (`docs/plans/engineering-proposal.md`) — a formal pitch for Abhishek covering what Clarity V2 is, what's built, what we need from engineering, and the migration strategy options for discussion
- **Storybook accessible to the team** so engineers and agents have a place to look up components (local for now; deployment later)

What won't be done in two weeks:

- Fumadocs documentation site (Phase C, weeks 3-4)
- Mobile React Native component library (parallel track, later)
- Any actual platform migration work (Phase D, conditional on Phase C)
- Formal engineering commitment (Phase C — depends on the Abhishek conversation)

## The bigger picture

Clarity V2 is the first and most concrete piece of a broader system taking shape to govern how Nivoda designs and ships product. The component library is where the commercial leverage is most visible today — it's what unblocks both self-service UI delivery and gradual platform modernisation — but it sits inside a wider structure.

The broader direction has three connected parts (see `TRIAD.md` for detail):

1. **The component library** (Clarity V2, this repo) — the building blocks. The "law".
2. **The Experience Framework** (separate repo) — the rules and principles that tell agents, engineers, designers, and PMs how to build correctly with the library: surface rules, interaction patterns, handoff structure, quality standards. The "constitution".
3. **The Design Engine** (currently inside Experience Framework) — an operational system that helps the design team collect user signal at scale, keep user models grounded in real data, and surface what the org should be working on. The "government".

These three pieces are distinct but connected. The component library is the near-term priority and the thing that unlocks velocity now. The other two are emerging alongside it and will come into focus as the library stabilises.

The unifying idea: **design becomes a system the rest of the org (and its agents) can plug into**, rather than a bottleneck they have to wait for.

## What this unlocks

When Clarity V2 is in place, several commercial levers change:

- **Self-service velocity.** Designers and PMs with AI coding agents can build real, working UI directly. Feature prototypes ship in hours. Meaningful UI changes stop blocking on engineering capacity. Engineering is freed up for infrastructure, performance, and genuinely hard work — not boilerplate.
- **Consistency.** Nivoda product feels like one product across web, mobile, and admin surfaces. The same tokens feed every platform. The same components appear in every screen.
- **Mobile parity.** The same token system feeds the mobile app, ending the drift between platforms.
- **Agent leverage.** Every component is built to be read, reasoned about, and composed by AI agents. The organisation's investment in AI coding tools produces more output per hour.

The component library on its own is meaningful progress. The Experience Framework and Design Engine, as they mature, will turn design from a delivery function into a system that scales with the business without adding headcount.
