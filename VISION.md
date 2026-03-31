# Nivoda Design Function — Vision

## Read This First

This document is the briefing for Claude Code. Read it in full before doing anything. Confirm understanding by summarising the two repos and their distinction.

---

## Two Repos. Two Distinct Purposes.

### 1. `Clarity V2 Experience Framework`
The single source of truth for how Nivoda products are designed and built. It is the design system, the component library, the governance layer, and the agent toolkit — all in one place.

It serves two audiences:
- **Humans** — designers, engineers, product managers reading principles, guidelines, and component documentation
- **Agents** — consuming markdown recipes and skill instructions to implement experiences correctly

### 2. `Minivoda`
The handoff prototype repo. A functional clone of the core buyer experience platform, decoupled from production infrastructure, with all states and edge cases built out in code. This is the executable spec — the replacement for the Figma spec file.

Do not conflate these two repos. They do different jobs.

---

## Clarity V2 Experience Framework in Detail

### What It Is
A single repo containing:
- A component library built on shadcn/ui and Tailwind CSS
- Storybook as the component development and documentation environment
- Principles, brand guidelines, surface-specific rules
- Agent-ready markdown recipes and skill instructions alongside every section

### What It Is Not
- Not an agent or tool
- Not a scope document for any specific feature
- Not something agents can deviate from or embellish
- Not coupled to any Nivoda application codebase

### Structure
```
clarity-v2/
├── README.md
├── VISION.md
├── principles/
│   ├── ux-heuristics.md          # Human layer
│   └── agents/
│       └── ux-heuristics.md      # Agent layer — recipes and instructions
├── brand/
│   ├── visual-language.md
│   ├── tone-of-voice.md
│   ├── motion-principles.md
│   └── agents/
│       └── brand-recipes.md
├── components/
│   ├── component-library.md
│   ├── composition-patterns.md
│   ├── interaction-patterns.md
│   ├── error-and-edge-cases.md
│   └── agents/
│       └── component-recipes.md
├── surfaces/
│   ├── buyer-experience/
│   │   ├── guidelines.md
│   │   └── agents/
│   │       └── recipes.md
│   ├── supplier-experience/
│   │   ├── guidelines.md
│   │   └── agents/
│   │       └── recipes.md
│   ├── admin-dashboard/
│   │   ├── guidelines.md
│   │   └── agents/
│   │       └── recipes.md
│   └── mobile-app/
│       ├── guidelines.md
│       └── agents/
│           └── recipes.md
├── src/
│   └── components/
│       ├── atoms/
│       ├── composites/
│       └── templates/
├── .storybook/
└── gaps/
    └── flagged-gaps.md
```

### Two Layers Per Section
Every section has a human layer and an agent layer.

**Human layer** — readable documentation for designers, engineers, and product managers

**Agent layer** — markdown recipes and skill instructions an agent can consume and execute against without deviation or invention

### Validation Measure
A section is complete when an agent can consume it and deliver something correctly within that domain — without deviation, without invention, without improvisation.

---

## Component Architecture

Components follow a three-tier taxonomy: **Atoms** (primitives), **Composites** (reusable patterns assembled from atoms), and **Templates** (full-page reference implementations). The technology choices, component lifecycle, and platform-specific implementation details are documented in [architecture.md § Component Libraries](architecture.md#2-component-libraries).

---

## Figma's Role

Figma is a scratchpad. It is used for visual exploration, layout ideation, and early-stage design thinking. It is not a system of record for anything — not tokens, not components, not specs.

The canonical definition of the design system lives in this repo: tokens as DTCG JSON, components as code, documentation as markdown. Figma does not feed the token pipeline, and nothing in Figma is considered authoritative. If it's not in the codebase, it doesn't exist.

## How Designers Maintain the Design System

Designers are contributors to this repo, not consumers of it. The design function owns the experience framework and maintains it through the same workflow as engineering: branches, PRs, and code review.

In practice, this means designers:
- Author and update design tokens by editing DTCG JSON files directly
- Build and refine components using shadcn/ui, Tailwind, and Storybook
- Write and maintain usage guidelines as markdown files alongside the components they document
- Use AI tools (Claude Code, Cursor) as their primary implementation environment
- Use Figma only for thinking — sketching layouts, exploring options, trying ideas before committing them to code

The experience framework is not maintained by syncing from Figma. It is maintained by shipping code.

---

## Surfaces in Scope

| Surface | Primary Users | Design Emphasis |
|---|---|---|
| Buyer Experience | Jewellers browsing and buying diamonds | Trust, simplicity, discovery |
| Supplier Experience | Diamond suppliers managing inventory | Control, transparency, efficiency |
| Admin Dashboard (Nexus) | Internal Nivoda operations team | Density, bulk operations, oversight |
| Mobile App | Core platform users on mobile | Touch-first, contextual, fast |

The SaaS vertical has its own separate design system. It is out of scope for this repo.

---

## Minivoda in Detail

### What It Is
A private digital twin of the core buyer experience platform. The handoff mechanism that replaces the Figma spec file.

- Cloned from Platform G2 into a private Bitbucket repo
- Decoupled from Keycloak via a mocked session
- API calls intercepted by Mock Service Worker seeded with realistic diamond data
- Deployed on Vercel for automatic branch preview URLs
- All states and edge cases built out in code with state controls

### The Handoff Package
For each feature or flow, the handoff consists of:

1. **Minivoda code** — functional prototype with all states covered
2. **Companion markdown file** — translates the product manager's scope document into realised UX for engineer and agent consumption. Covers states and triggers, business logic, edge cases, and connection to experience framework principles.

### What Minivoda Is Not
- Not a QA or staging environment
- Not coupled to the experience framework codebase
- Not where principles or guidelines live

---

## Core Rules for Agents

- Never deviate from the experience framework
- Never embellish or invent patterns
- If a pattern is missing, stop and flag it — do not improvise
- Log all gaps in `/gaps/flagged-gaps.md`
- Resume only once the design function has updated the framework
- Scope documents are provided per initiative by product managers and are not part of the framework

---

## Ownership
The experience framework is owned by the design function. Engineers, product managers, and agents are consumers, not editors. Changes require design review.