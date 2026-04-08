# Clarity V2 — State of the Design System

*Last updated: 8 April 2026*

## Summary

Clarity V2 is Nivoda's new design system — a rebuild of the component library, design tokens, and documentation that underpin every product surface we ship. It replaces an older Storybook system built on MUI that has accumulated legacy, is not properly mobile responsive, and was not built with AI coding agents in mind.

The rebuild is underway with 1-2 dedicated engineers. The technical foundation and architectural decisions are in place, and components are being refactored onto the new stack using the existing platform design system as a reference implementation.

This document is a factual record of where we are, what we're building, and where it's headed.

## Why we're rebuilding

The previous design system is holding velocity back in three ways:

1. **Legacy drift.** Built on Material UI with years of workarounds and custom overrides. Engineers routinely build around it rather than with it.
2. **Not mobile-ready.** Responsive behaviour was retrofitted rather than designed in. The mobile app maintains parallel components that drift from the web source of truth.
3. **Not agent-ready.** It wasn't built for AI coding agents to consume. Components lack the machine-readable metadata, clean type contracts, and colocated documentation that let an agent implement features reliably without hallucinating patterns.

As the organisation moves to AI-assisted delivery, point three is the commercial lever. An agent-ready design system means features get built faster, more consistently, and with less rework — whether the builder is a human or an agent.

## What we're building

Clarity V2 is built on a deliberately modern, boring stack:

- **React 19** with **shadcn/ui** and **Radix UI** primitives for accessibility and headless behaviour
- **Tailwind CSS v4** for zero-runtime styling — deterministic CSS output, no runtime magic
- **Nx monorepo** for workspace structure and build orchestration
- **W3C DTCG design tokens** as the single source of truth, compiled to CSS variables for web, JavaScript objects for React Native, and JSON for backend/email
- **Storybook** for interactive component documentation
- **Fumadocs** (planned) for a deployed documentation site

Three structural decisions worth calling out:

**Code is the source of truth, Figma is a scratchpad.** This aligns with how GitHub, Shopify and Uber run their design systems. Components are versioned, testable, and directly consumable by agents. Designers still design in Figma, but the authoritative definition of any component lives in the repo.

**Tokens feed every platform.** One set of token definitions outputs to web, mobile, and backend. This ends the drift between platforms.

**Components are built to be agent-consumable.** Each component ships with colocated markdown documentation, clean TypeScript interfaces, and accessible-by-default behaviour. An agent reading the repo has what it needs to use the component correctly without guessing.

## Where we are today

Honest state as of 8 April 2026:

- **Architecture and technical decisions:** Complete. Documented with Architecture Decision Records.
- **Token pipeline:** Working. Outputs to web, React Native, and JSON.
- **Button component:** Complete. Five variants, three intents, three sizes, 16 Storybook stories, fully accessible.
- **Other components:** In active development, refactored from the existing platform design system.
- **Token alignment decisions:** 15 open questions pending design sign-off before full rollout.
- **Storybook:** Runs locally. Not yet deployed.
- **Fumadocs documentation site:** Planned. Not yet deployed.
- **Mobile components:** Token pipeline outputs ready. Component implementation not yet started.

## The next two weeks

Concrete targets:

- **Token alignment decisions closed** so components are built against stable tokens.
- **Core component set in place** — the primitives and composites that cover roughly 80% of product UI (buttons, inputs, selects, checkboxes, radios, switches, cards, dialogs, alerts, toasts, tabs, badges, tooltips).
- **Page templates** — as many as can be completed in the window. Layout patterns product teams can compose from rather than assemble from scratch.
- **Storybook accessible to the team** so engineers and agents have a place to look up components.

What won't be done in two weeks:

- Full Fumadocs documentation site (weeks 3-4)
- Mobile React Native component library (parallel track, later)
- Migration of every legacy surface onto the new system (ongoing)

## The bigger picture

Clarity V2 is the first and most concrete piece of a broader system taking shape to govern how Nivoda designs and ships product. The component library is where the commercial leverage is most visible today — it's what unblocks agent-assisted development across the org — but it sits inside a wider structure.

The broader direction has three connected parts:

1. **The component library** (Clarity V2) — the building blocks. What this document is about.
2. **A governance framework** (in development) — the rules and principles that tell agents and engineers how to build correctly with the library: surface rules, interaction patterns, handoff structure, quality standards. This is what prevents the "thousand similar-but-different buttons" problem as the org scales agent-led delivery.
3. **An intelligence layer** (early exploration) — an operational system that helps the design team collect user signal at scale, keep user models grounded in real data, and surface what the org should be working on. This is how design scales without adding headcount.

These three pieces are distinct but connected. The component library is the near-term priority and the thing that unlocks velocity now. The other two are emerging alongside it and will come into focus as the library stabilises.

The unifying idea: **design becomes a system the rest of the org (and its agents) can plug into**, rather than a bottleneck they have to wait for.

## What this unlocks

When Clarity V2 is in place, three commercial levers change:

- **Velocity.** Agents and engineers build features from a known, tested set of components rather than reinventing UI each time. Fewer bugs, faster reviews, less rework.
- **Consistency.** Nivoda product feels like one product across web, mobile, and admin surfaces.
- **Mobile parity.** The same token system feeds the mobile app, ending the drift between platforms.

The component library on its own is meaningful progress. The governance framework and intelligence layer, as they mature, will turn design from a delivery function into a system that scales with the business.
