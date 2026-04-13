# Clarity V2 — Roadmap

Current status and phased plan for Clarity V2. For the vision, commercial case, and conceptual model, see `VISION.md`. Individual phase implementation plans live under `docs/plans/` as they become active.

---

## Status

_Last updated: 2026-04-09_

### Phase A — Foundation ✅ Done

▓▓▓▓▓▓▓▓▓▓ 100%

- [x] Token pipeline with OKLCH (20 tests passing)
- [x] Four ADRs decided (bespoke build, Chromatic, Tokens Studio, Fumadocs)
- [x] Platform audit (60+ components inventoried)
- [x] 15 token alignment decisions applied
- [x] One production component (Button) complete

### Phase B — Proof 🟡 Active (2-week window)

▓▓░░░░░░░░ 20%

- [ ] Core component set (**1 / 15** components built)
- [ ] Storybook with 10+ components running locally
- [ ] Validation build attempted (stretch ambition)

**Metrics:** 1/15 components · 20/20 tests · 18 commits

**Critical path:** Build the remaining 14 components. Everything else in Phase B is either done or waiting on components.

### Phase C — Distribution ⚪ Pending

░░░░░░░░░░ 0%

- [ ] Fumadocs documentation site deployed
- [ ] Onboarding material for designers/PMs
- [ ] Engineering conversation + migration strategy decided (post-Phase C)
- [ ] First person other than Chris builds something real

### Phase D — Adoption ⚪ Pending

░░░░░░░░░░ 0%

Scope to be defined based on Phase C outcomes. Expected themes:

- Design/PM self-service for real features (in Minivoda, handed to eng as branches)
- Platform migration (opportunistic)
- Experience Framework governance at scale
- **Mobile as a fast-follow** — React Native component library built on the same tokens and component contracts, so the self-serve path extends to Nivoda's mobile surfaces without a second design system

For the vision, commercial case, and conceptual model of how this repo relates to the Experience Framework and Design Engine, see `VISION.md`.

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

**Goal:** Prove that Clarity V2 works end-to-end. Build the core component set. Establish the conditions under which a real-world validation (a working Nivoda screen built with Clarity V2 + AI) becomes viable.

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
- **ROADMAP and supporting docs** — coherent, shareable, telling the story clearly

### Ambition — the validation build (in Minivoda)

Once the component set is in place, the most powerful thing Clarity V2 can show is a **new flow built into Minivoda with Claude Code + Clarity V2**. The point isn't to produce a polished demo on a deadline — it's to validate that the self-service delivery loop actually works in practice, in the actual venue where that loop lives.

Minivoda — the living digital twin of the Nivoda platform (`minivoda/clarity-digital-twin`) — already has a meaningful portion of the buyer product built and running against real data: marketing, auth, buyer home, six product browse categories, orders, share modal, dark mode. It is the right place to do the validation build, because it is the same venue the self-serve path will use after Phase B. See `VISION.md` → *Where the self-serve path actually happens — Minivoda*.

Chris picks a candidate flow — either an existing Minivoda surface (rebuilt against the new component set) or a new flow that isn't in Minivoda yet (cart, checkout step, an under-construction page) — builds it with Clarity V2 components + AI, and observes:
- Which components were missing or insufficient
- What the AI agent got right, what it struggled with
- How long the build actually took
- Whether the output is genuinely "design-correct by construction"
- Whether the hand-off-as-branch model is recognisable to engineering

The resulting build — if it works — becomes the proof artefact: *"This is a working Nivoda flow, running in Minivoda, built with Clarity V2 by a designer with AI assistance, handed off as a branch. The same library is what engineering will import when they want to skip the design review loop."*

**This is an ambition, not a commitment on a fixed schedule.** The component buildout is the gate — once the core set is in place, the validation attempt becomes meaningful. If component buildout takes the full 2 weeks, the validation happens in week 3. If it moves faster, sooner. Either way, the ROADMAP is not a promise that any specific flow will exist on any specific day.

### What's explicitly out of scope for Phase B

- Fumadocs documentation site (Phase C)
- React Native component implementations (later)
- Any actual platform migration work (Phase D)
- Component tokens (per-component token files like the platform's 48 files) — not needed yet
- Engineering proposal or engineering conversation — deferred until after Phase C
- Polished, pixel-perfect UI — the validation build is a proof of the loop, not a production ship

### Success criteria

- Core component set (10+ components) is in Storybook, runs locally
- ROADMAP and supporting docs tell a coherent story
- Validation build attempted — regardless of outcome, the exercise produces learnings about what's missing, what works, and what Phase C needs to focus on

---

## Phase C — Distribution

**Goal:** Make Clarity V2 usable by people beyond Chris. Move from "Chris can build with this" to "any designer or PM can build with this."

### Deliverables

- **Fumadocs documentation site** — deployed to Vercel, covering:
  - Component reference (imported from Storybook or written in MDX)
  - Token reference (colors, spacing, typography, with visual samples)
  - How-to guides for designers and PMs: "how to build a frontend with Clarity V2 and AI"
  - The Experience Framework content (governance, surface rules) pulled from the experience-framework repo
  - A single site, two repos, one browsable face
- **Onboarding material** — a short written guide ("prompt patterns that work well with Clarity V2") plus 2-3 worked examples showing design/PM self-service loops
- **First external use case** — either another designer or a PM picks up Clarity V2 + agent and builds something real. This validates that the self-service loop works for people who aren't Chris.

### Open questions to resolve during Phase C

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

1. **First demo screen for Phase B.** Chris picks from candidates above.
2. **Where Fumadocs lives.** Subdomain of nivoda.com? Separate URL? Internal only or public? Phase C decision.
3. **Component tokens — now or later.** Platform has 48 component-specific token files. Clarity V2 has none. Decide during Phase C after real use reveals whether they're needed.
4. **Storybook hosting.** Local only for now. At some point: deployed where? Behind VPN like the platform's current Storybook? Publicly? Inside Fumadocs?
5. **Migration strategy for platform.** Strangler fig / surface-by-surface / opportunistic. Deferred until after Phase C — engineering conversation happens only once the library is proven.
6. **Engineering commitment level.** What resources can engineering put toward migration? Deferred until after Phase C.

---

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| **Engineering doesn't engage or actively resists** | Platform migration track stalls; self-service track continues unblocked but half the value story is lost | Build the proof first (Phases B+C), then approach engineering with a working library and validation artefact. Let eng pick migration strategy; start with non-blocking asks |
| **Validation build reveals major gaps in the component library** | Phase B doesn't produce the "design-correct by construction" proof as cleanly as hoped | Accept the learning — a failed attempt that surfaces specific gaps is more valuable than no attempt. Feed the findings into Phase C component additions. |
| **Chris is the only person who can build with this** | Self-service goal collapses to "Chris builds everything" | Phase C explicitly includes a second person (designer or PM) building something real, validated as success criterion |
| **Token alignment values don't match Figma libraries** | Visual drift between designs and implemented UI | Figma DS Foundation audit scheduled; Chris or designer cross-references when a conflict is found |
| **Component library quality isn't agent-readable** | Agents hallucinate, produce broken code, self-service loop breaks | Each component must ship with clean TypeScript interface, working Storybook story, and colocated markdown doc explaining intent |
| **Scope creep toward "big bang platform migration"** | Team gets pulled into MUI replacement instead of proving the self-service loop | ROADMAP explicitly frames migration as opportunistic in Phase D; protect Phase B from migration asks |

