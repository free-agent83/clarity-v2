# Clarity V2 — Roadmap

*Last updated: 8 April 2026*
*Status: active, 2-week proof window*

This is the master plan for Clarity V2. It sits alongside `STATE.md` (the narrative status) and `TRIAD.md` (the conceptual model). Individual phase plans live under `docs/plans/` as they become active.

---

## The vision

Clarity V2 is a **code-first design system built to be consumed by AI coding agents and by engineers writing code directly**. Its purpose is to produce a single structural change:

**Whoever builds UI — an engineer writing code, a designer prompting an AI agent, a product manager prototyping a flow — produces design-correct output automatically.** The components ARE the design. There is no interpretation step where drift can happen, and therefore no iteration loop to catch it.

Two delivery paths open up from the same library:

1. **Engineering builds faster and without design gates.** Engineers import from Clarity V2 instead of MUI. Features ship design-correct on the first pass. Design review stops being a bottleneck because the components are pre-approved at the source. The "design → engineering → design QA" loop collapses into "design has already happened, build ships".

2. **Design and product self-service.** Because the library is built to be agent-consumable, designers and PMs with AI coding tools can build directly against it — real working UI, not just mockups — without waiting for engineering capacity.

Both paths use the same underlying library. Both depend on the same enabling work (build it, document it for agents, prove it). The commercial case compounds: every new consumer reinforces the value for the others.

## Why this matters commercially

**Today, most Nivoda UI ships through a design → engineering → design-QA loop.** Design specs a screen. Engineering implements it. Design reviews the implementation, catches drift, files corrections, waits for revisions, reviews again. Ship. That loop exists because the current MUI-based design system doesn't guarantee that "correctly implemented" means "design-correct" — engineers interpret, and design has to catch the drift.

The loop is where velocity goes. It's also where design capacity goes — most design hours today are spent reviewing implementations, not designing.

**With Clarity V2, the loop collapses.**

- The components are the design. A feature built with Clarity V2 components is design-correct by construction.
- Engineers ship without waiting for design review. Design doesn't need to catch what the system already prevents.
- The hours design currently burns on QA iterations get redirected to work that actually needs a designer — more components, better documentation, governance, user research.
- Self-service becomes possible as a bonus: because the library is agent-ready for engineers, it's also agent-ready for designers and PMs with the same AI tools.

The commercial case is specific: **we are removing both design QA iteration and engineering capacity as single points of failure for UI delivery.** Multiple delivery paths open up in parallel, and none of them are gated on design review. This is the biggest structural change to product velocity Nivoda can make right now, and it's only possible because AI-assisted code is reliable enough and Clarity V2 is built to take advantage of it.

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

**Goal:** Prove that Clarity V2 works end-to-end. Build the core component set. Have the engineering proposal ready for Abhishek. Establish the conditions under which a real-world validation (a working Nivoda screen built with Clarity V2 + AI) becomes viable.

### Primary deliverables

- **Core component set in Storybook** — ~10-15 components covering the primitives and composites needed for most near-term UI:
  - Button (done)
  - Input, Textarea, Select
  - Checkbox, Radio, Switch
  - Card, Badge, Avatar
  - Dialog, Tooltip
  - Tabs, Alert
  - Separator, Label
- **Storybook runs locally** for the team; deployment deferred to Phase C
- **Engineering proposal document** (`docs/plans/engineering-proposal.md`) — a formal pitch for Abhishek covering what Clarity V2 is, what's built, what we need from engineering, and three migration-strategy options for discussion (strangler fig / surface-by-surface / opportunistic replacement)
- **ROADMAP, STATE.md, and supporting docs** — coherent, shareable, telling the story clearly

### Ambition — the validation build

Once the component set is in place, the most powerful thing Clarity V2 can show is a **working Nivoda screen rebuilt with Claude Code + Clarity V2**. The point isn't to produce a polished demo on a deadline — it's to validate that the self-service delivery loop actually works in practice.

Chris picks a candidate screen from customer-facing production (buyer product list, PDP, order detail, account settings, or a checkout step), rebuilds it against the in-progress component library, and observes what happens:
- Which components were missing or insufficient
- What the AI agent got right, what it struggled with
- How long the build actually took
- Whether the output is genuinely "design-correct by construction"

The resulting build — if it works — becomes the proof artefact: *"This is built with Clarity V2. It was built by a designer, not an engineer. The same library is what engineering will import when they want to skip the design review loop."*

**This is an ambition, not a commitment on a fixed schedule.** The component buildout is the gate — once the core set is in place, the validation attempt becomes meaningful. If component buildout takes the full 2 weeks, the validation happens in week 3. If it moves faster, sooner. Either way, the ROADMAP is not a promise that any specific screen will exist on any specific day.

### What's explicitly out of scope for Phase B

- Fumadocs documentation site (Phase C)
- React Native component implementations (later)
- Any actual platform migration work (Phase D)
- Component tokens (per-component token files like the platform's 48 files) — not needed yet
- Formal engineering commitment — that's Phase C
- Polished, pixel-perfect UI — the validation build is a proof of the loop, not a production ship

### Success criteria

- Core component set (10+ components) is in Storybook, runs locally
- Engineering proposal is written and ready to send to Abhishek
- ROADMAP, STATE.md, and supporting docs tell a coherent story
- Validation build attempted — regardless of outcome, the exercise produces learnings about what's missing, what works, and what Phase C needs to focus on

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
| **Validation build reveals major gaps in the component library** | Phase B doesn't produce the "design-correct by construction" proof as cleanly as hoped | Accept the learning — a failed attempt that surfaces specific gaps is more valuable than no attempt. Feed the findings into Phase C component additions. |
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
