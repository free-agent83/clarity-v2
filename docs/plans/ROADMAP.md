# Clarity V2 — Roadmap

*Last updated: 8 April 2026*
*Status: active, 2-week proof window*

This is the master plan for Clarity V2. It sits alongside `STATE.md` (the narrative status) and `TRIAD.md` (the conceptual model). Individual phase plans live under `docs/plans/` as they become active.

---

## The vision

Clarity V2 is a **code-first design system built to be consumed by AI coding agents**. Its purpose is to enable two things in parallel:

1. **Self-service UI delivery.** Designers and product people use Claude Code / Cursor / AI agents to build working frontends directly against Clarity V2 — without waiting for engineering capacity. The design system provides the vocabulary; the governance framework provides the rules; AI agents provide the hands.

2. **Platform consistency at scale.** The same components gradually replace the existing MUI-based design system in the production Nivoda platform, delivered opportunistically as new features are built or existing ones are touched.

Both goals use the same underlying library. Both are enabled by the same technical foundation. The commercial case is compounding: every new use case reinforces the other.

## Why both goals matter

**The self-service goal** removes engineering capacity as the single bottleneck for UI delivery. This is the commercial lever most visible to the CEO. In a world where AI agents can write code reliably, the limiting factor is no longer "can this person code" — it's "does this person know what should be built." Designers and PMs are exactly the people who know that. Giving them a tested, governed, agent-consumable library unlocks a delivery path that didn't exist 18 months ago.

**The platform consistency goal** solves the structural problem with the existing design system: MUI legacy, mobile drift, inconsistent surfaces, accessibility gaps. Migration is incremental — new work builds on Clarity V2, old MUI code gets replaced as features are touched, and the parallel systems converge over time. No big bang.

The two goals share the same enabling work: build the library, document it for agents, prove it works.

---

## Phases

| Phase | Name | Scope | Status |
|---|---|---|---|
| **A** | Foundation | Token pipeline, architecture decisions, platform alignment | ✅ Done |
| **B** | Proof | Core components + working Nivoda screen demo + engineering proposal | 🟡 Active (2-week window) |
| **C** | Distribution | Fumadocs site, self-service documentation, first external use case | ⚪ Pending |
| **D** | Adoption | Design/PM build real features; platform migrates opportunistically | ⚪ Pending |

---

## Phase A — Foundation ✅ Done

**What shipped:**
- Nx monorepo with tokens, components, test-app packages
- Bespoke token build pipeline (OKLCH, shadcn output, React Native output, JSON)
- 20-test suite on the token pipeline
- Four ADRs documenting key decisions (bespoke build, Chromatic removed, Tokens Studio rejected, Fumadocs over Zeroheight)
- Full audit of platform's existing design system (60+ components, 48 component-specific token files)
- 15 token alignment decisions made and applied (platform values for brand/status colors, Clarity V2 naming and structure elsewhere)
- Single production-ready Button component in Storybook

**Evidence:** `CHANGELOG.md`, `docs/architecture/architecture.md`, `docs/design/token-decisions.md`, `packages/tokens/`

---

## Phase B — Proof (active, 2-week window)

**Goal:** Prove that Clarity V2 works end-to-end for both goals. Show the CEO a working Nivoda screen that a designer built themselves. Give engineering a formal proposal they can react to.

### Primary deliverable — the demo

Chris rebuilds a **real Nivoda screen** using Claude Code + Clarity V2 + the in-progress component library. The screen should be:

- Recognisable to the CEO (a screen from customer-facing production, not an abstract prototype)
- Visually close-enough to the current production version that the CEO immediately sees what it is
- Functional — clickable, scrollable, responsive
- Built primarily by Chris prompting an AI agent, not by an engineer

**Screen candidates to choose from** (Chris to pick):
- Buyer product list (e.g., diamond search results)
- Buyer product detail
- Order details / order history
- Account / settings page
- Checkout step

The chosen screen becomes the headline for the CEO demo: *"This is built with Clarity V2. I (Chris) built it in [X hours] using Claude Code. Here's how it compares to the current version."*

### Supporting deliverables

- **Core component set in Storybook** — ~10-15 components covering the demands of the demo screen and most near-term use cases:
  - Button (done)
  - Input, Textarea, Select
  - Checkbox, Radio, Switch
  - Card, Badge, Avatar
  - Dialog, Tooltip
  - Tabs, Alert
  - Separator, Label
- **Storybook runs locally** for the team; deployment deferred to Phase C
- **Engineering proposal document** (`docs/plans/engineering-proposal.md`) — a formal pitch for Abhishek covering what Clarity V2 is, what's built, what we need from engineering, and three migration-strategy options for discussion (strangler fig / surface-by-surface / opportunistic replacement)
- **This ROADMAP, STATE.md, and supporting docs** — ready to share with CEO

### What's explicitly out of scope for Phase B

- Fumadocs documentation site (Phase C)
- React Native component implementations (later)
- Any actual platform migration work (Phase D)
- Component tokens (per-component token files like the platform's 48 files) — not needed yet
- Formal engineering commitment — that's Phase C

### Success criteria

- Chris can demonstrate the rebuilt Nivoda screen to the CEO within the 2-week window
- The engineering proposal is written and ready to send to Abhishek
- Storybook runs locally with 10+ components
- ROADMAP and STATE.md tell a coherent story to a CEO in under 10 minutes

---

## Phase C — Distribution

**Goal:** Make Clarity V2 usable by people beyond Chris. Move from "Chris can build with this" to "any designer or PM can build with this" and "Abhishek knows what to do with this."

### Deliverables

- **Fumadocs documentation site** — deployed to Vercel, covering:
  - Component reference (imported from Storybook or written in MDX)
  - Token reference (colors, spacing, typography, with visual samples)
  - How-to guides for designers and PMs: "how to build a frontend with Clarity V2 and AI"
  - The Experience Framework content (governance, surface rules) pulled from the experience-framework repo
  - A single site, two repos, one browsable face
- **Onboarding material** — a short written guide ("prompt patterns that work well with Clarity V2") plus 2-3 worked examples showing design/PM self-service loops
- **Engineering conversation happens** — Abhishek reviews the proposal, migration strategy is picked (or explicitly deferred), expectations set for what engineering will and won't do
- **First external use case** — either another designer or a PM picks up Clarity V2 + agent and builds something real. This validates that the self-service loop works for people who aren't Chris.

### Open questions to resolve during Phase C

- Migration strategy: strangler fig, surface-by-surface, or opportunistic? Eng and design decide together after reviewing the proposal.
- Component tokens: do we add platform-style per-component token files now, or stay with semantic tokens only until a real need emerges?
- Versioning and publishing: how does Clarity V2 get distributed? `file:` linking during development is fine; at some point we need real package publishing (private npm registry or similar).
- Testing strategy: do we add visual regression testing now (self-hosted, not Chromatic — see ADR-002) or defer?

---

## Phase D — Adoption

**Goal:** Clarity V2 is in active use for real work on both tracks (self-service and platform).

This phase is deliberately light on detail because its shape depends on what Phase C produces. Some of the plausible moves:

- **Self-service track:** designers and PMs pick up Clarity V2 for prototype work, feature mockups, internal tools, simple marketing pages. Feedback loops into component improvements.
- **Platform track:** engineering picks a migration strategy and executes. Could be one surface migrating fully (buyer-web?), could be new features building on Clarity V2 while old MUI code stays until touched.
- **Component library grows** based on real use. Components that hit gaps get added. Components nobody uses get deprecated.
- **Governance kicks in** (Experience Framework) — as more people build, the need for rules becomes concrete. Agents and humans alike operate against the governance layer.

**When is Phase D "done"?** When the design system is the default way UI gets built at Nivoda, for any audience. This is a multi-quarter horizon, not a week or month.

---

## What's explicitly out of scope across all phases

- Rebuilding Figma libraries (design files stay in Figma; Clarity V2 is the code truth)
- Building from scratch anything that shadcn/ui already provides (we import and adapt)
- Maintaining MUI compatibility — platform continues to use MUI until specific components migrate
- Backwards compatibility with old Nivoda design patterns that aren't worth carrying forward
- Building for audiences who don't have AI coding agents available

---

## Open decisions (not yet resolved)

1. **Migration strategy for platform.** Strangler fig / surface-by-surface / opportunistic. Decision needed in Phase C with engineering.
2. **First demo screen for Phase B.** Chris picks from candidates above.
3. **Where Fumadocs lives.** Subdomain of nivoda.com? Separate URL? Internal only or public? Phase C decision.
4. **Engineering commitment level.** What resources can engineering put toward migration? Unknown until Abhishek conversation.
5. **Component tokens — now or later.** Platform has 48 component-specific token files. Clarity V2 has none. Decide during Phase C after real use reveals whether they're needed.
6. **Storybook hosting.** Local only for now. At some point: deployed where? Behind VPN like the platform's current Storybook? Publicly? Inside Fumadocs?

---

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| **Engineering doesn't engage or actively resists** | Platform migration track stalls; self-service track continues unblocked but half the value story is lost | Engineering proposal document written carefully; offer multiple migration options; let eng pick; start with non-blocking asks |
| **Demo screen takes longer than 2 weeks** | CEO window missed; pressure increases | Pick a simpler screen candidate; use shadcn CLI components as-is where possible; accept visual approximation over pixel perfection |
| **Chris is the only person who can build with this** | Self-service goal collapses to "Chris builds everything" | Phase C explicitly includes a second person (designer or PM) building something real, validated as success criterion |
| **Token alignment values don't match Figma libraries** | Visual drift between designs and implemented UI | Figma DS Foundation audit scheduled; Chris or designer cross-references when a conflict is found |
| **Component library quality isn't agent-readable** | Agents hallucinate, produce broken code, self-service loop breaks | Each component must ship with clean TypeScript interface, working Storybook story, and colocated markdown doc explaining intent |
| **Scope creep toward "big bang platform migration"** | Team gets pulled into MUI replacement instead of proving the self-service loop | ROADMAP explicitly frames migration as opportunistic in Phase D; protect Phase B from migration asks |

---

## Relationship to the Experience Framework

Clarity V2 is the **law** — it provides components with clear intent and binding precedent for what exists to build with. The Experience Framework is the **constitution** — it provides the principles, surface rules, and quality standards that govern how the law gets applied. The Design Engine (currently inside experience-framework) is the **government** — it decides what should be worked on based on user signal.

See `TRIAD.md` for the full conceptual model.

A designer or PM building with Clarity V2 + AI is operating at the intersection of all three:
- They pull components from the **design system** (what to build with)
- They follow the rules set by the **framework** (how to build correctly)
- They work on priorities set by the **engine** (what's worth building)

The ROADMAP for each repo is distinct, but they're designed to reinforce each other. Clarity V2's Phase B proof is also the first real test of whether the framework's rules hold up under AI-assisted delivery.

---

## What happens after Phase D

Not planned yet. Deliberately. By the time Phase D is real, the world will have changed enough that planning now is premature. The next-after-D question is probably something like: does Clarity V2 become the foundation for a broader internal tools platform? Does it get open-sourced? Does it merge with Experience Framework into a single delivery system? Those are conversations for 2027.
