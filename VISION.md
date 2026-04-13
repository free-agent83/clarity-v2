# Clarity V2 — Vision & Conceptual Model

The vision behind Clarity V2, the commercial case for it, and the design triad that governs how design operates at Nivoda.

For the phased plan, current status, and what's being built right now, see `ROADMAP.md`. For technical architecture and ADRs, see `docs/architecture/architecture.md`.

---

## The core outcome

Clarity V2 is a **code-first design system built to be consumed by AI coding agents and by engineers writing code directly**. Its purpose is to produce a single structural change:

**Whoever builds UI — an engineer writing code, a designer prompting an AI agent, a product manager prototyping a flow — produces design-correct output automatically.** The components ARE the design. There is no interpretation step where drift can happen, and therefore no iteration loop to catch it.

---

## Two delivery paths, one library

Two paths open up from the same library:

**1. Engineering builds faster and without design gates.** Engineers import from Clarity V2 instead of MUI. Features ship design-correct on the first pass. Design review stops being a bottleneck because the components are pre-approved at the source. The "design → engineering → design QA" loop collapses into "design has already happened, build ships".

**2. Design and product self-service.** Because the library is built to be agent-consumable, designers and PMs with AI coding tools can build directly against it — real working UI, not just mockups — without waiting for engineering capacity.

Both paths use the same underlying library. Both depend on the same enabling work (build it, document it for agents, prove it). The commercial case compounds: every new consumer reinforces the value for the others.

---

## Why this matters commercially

**Today, most Nivoda UI ships through a design → engineering → design-QA loop.** Design specs a screen. Engineering implements it. Design reviews the implementation, catches drift, files corrections, waits for revisions, reviews again. Ship.

That loop exists because the current MUI-based design system doesn't guarantee that "correctly implemented" means "design-correct" — engineers interpret, and design has to catch the drift. The loop is where velocity goes. It's also where design capacity goes — most design hours today are spent reviewing implementations, not designing.

**With Clarity V2, the loop collapses.**

- The components are the design. A feature built with Clarity V2 components is design-correct by construction.
- Engineers ship without waiting for design review. Design doesn't need to catch what the system already prevents.
- The hours design currently burns on QA iterations get redirected to work that actually needs a designer — more components, better documentation, governance, user research.
- Self-service becomes possible as a bonus: because the library is agent-ready for engineers, it's also agent-ready for designers and PMs with the same AI tools.

The commercial case is specific: **we are removing both design QA iteration and engineering capacity as single points of failure for UI delivery.** Multiple delivery paths open up in parallel, and none of them are gated on design review. This is the biggest structural change to product velocity Nivoda can make right now, and it's only possible because AI-assisted code is reliable enough and Clarity V2 is built to take advantage of it.

---

## The Nivoda Design Triad

Design at Nivoda runs as a small **republic**: three branches with distinct roles, separation of powers between them, and rule of law binding on all of them. A **component library** provides the building blocks (the law), a **governance framework** establishes the principles for using them (the constitution), and an **intelligence layer** observes users and decides what to work on (the government). The three are distinct in role, cadence, and audience — but together they form one coherent system.

### Design System — The Law
*This repo: `clarity-v2`*

Each component, token, and pattern is a ruling that sets precedent. Once a Button is defined in the library, every future button follows that ruling. You don't get to invent your own just because your situation feels different.

When a new case arises that existing rulings don't cover, a new ruling is made — and from that point on it binds all future implementation. All rulings must be consistent with the constitution (the framework).

- **Owned by:** the design function
- **Consumed by:** code — agents and engineers importing components
- **Cadence:** releases. Versioned. Changes when a new component is ruled on or an existing one is updated.
- **Source of truth for:** *"What exists to build with."*

### Experience Framework — The Constitution
*Repo: `experience-framework`*

Establishes the fundamental principles and constraints that govern how product gets built. Surface-specific rules, interaction patterns, handoff protocols, agent behaviour, quality standards, accessibility requirements. It doesn't specify which button to use — it specifies how any implementation must behave.

Changes rarely and deliberately. Each amendment is a conscious constitutional act, not a reflex to a new feature.

- **Owned by:** the design function
- **Consumed by:** agents and engineers building product
- **Cadence:** slow and deliberate. Amendments are rare.
- **Source of truth for:** *"How to build correctly."*

### Design Engine — The Government
*Currently lives inside `experience-framework/nivoda-design-engine-main/`. Will eventually separate into its own repo.*

Observes reality. Collects signals from users, stakeholders, analytics, and competitors. Models the world through archetypes and journey maps grounded in real data. Sets priorities. Decides what the design team should work on and why. Communicates outward through briefings and reports.

Operates within the bounds of the constitution. Its decisions may surface gaps in the law, triggering new rulings.

- **Owned by:** the design & product team (with AI assistance handling the operational load)
- **Consumed by:** humans making strategic decisions
- **Cadence:** continuous. Every cycle brings new intelligence.
- **Source of truth for:** *"What to build and why."*

---

## What lives in each branch

The triad is abstract until you know what actually sits in it. A compact view:

**Law — Design System (`clarity-v2`)**
- Design tokens (colour, spacing, typography, radius, elevation) as the source of truth
- Components with their variants, states, and props
- Brand guidelines, brand book, brand assets, marketing collateral *(may live in a separate repo, but conceptually part of the Law)*
- UI page templates — generic PLPs, PDPs, dashboards, empty states, and other composed layouts
- Interaction patterns encoded in component behaviour (loading, empty, error, focus, transitions)
- Storybook stories as executable documentation
- Release versioning and changelog

**Constitution — Experience Framework (`experience-framework`)**
- Golden rules (user-centric, evidence-sourced, pin-to-archetype, no improvisation)
- Methodology principles (JTBD as the journey framework, archetypes as the validation lens)
- Surface-specific rules and interaction patterns
- Quality standards and accessibility requirements
- Document templates and conventions (INITIATIVE, PRFAQ, BRIEFING)
- Governance and amendment process — who changes what, under what authority
- Ratified archetypes and core journey maps (once stable)

**Government — Design Engine**
- Signal collection from Enterpret, PostHog, Mixpanel, Slack, Jira, Confluence, Google Drive, and competitor monitoring — product analytics, session recordings, and qualitative feedback
- Classified user-feedback pipeline (tagged by archetype, journey, severity, source)
- Draft archetypes and journey maps — grounded in real data, evolving
- Initiative lifecycle: creation, tracking, PRFAQs, deliverables, outcomes
- Strategic flagging and prioritisation ("checkout is broken")
- Company-facing briefings and bulletins
- Gaps register — what's undocumented or unsupported
- Two operating modes: strategic advisor (for humans) and design operator (autonomous execution)

---

## How the three relate

The primary flow is top-down. The government sets the agenda, the constitution constrains how it gets executed, and the law provides the enacted rulings that bind all implementation:

```
Government (Design Engine)    →    Constitution (Experience Framework)    →    Law (Design System)
(what and why)                     (how)                                       (with what)

Reads the state                    Establishes principles                      Issues rulings
Sets the agenda                    Constrains all branches                     Sets precedent
Decides what to legislate          Amends rarely, deliberately                 Binds all implementation
```

The government declares *"checkout is broken — fix it."* That mandate flows through the constitutional layer — which constrains how any solution must behave — to the law, which provides the enacted rulings that agents and engineers build with.

A feedback flow runs the other way. When an agent hits a gap during implementation — *"there's no ruling for this case"* — that gap flows back up: escalated through the framework, a new ruling is made by the design function.

```
Law              ←    Constitution            ←    Implementation
(new ruling)          (gap escalated)               (gap flagged)
```

Archetypes and journey maps, which originate in the government, are eventually ratified into the constitution once stable — a constitutional amendment incorporating the government's findings into the foundational document.

---

## Separation of powers

Three rules hold across the system:

1. **Law can't contradict the constitution.** A component cannot violate the framework's principles.
2. **Government operates within constitutional bounds.** The engine can set priorities but cannot override how things get built.
3. **New law is made when precedent doesn't exist.** Agents don't invent. They flag, and the design function rules.

No branch dominates the others. The engine can't reach down into implementation. The framework can't legislate components into existence. The design system can't set its own priorities. Each branch is sovereign in its own domain and bound by the rules of the others.

A designer or PM building with Clarity V2 + AI is operating at the intersection of all three:
- They pull components from the **design system** (what to build with)
- They follow the rules set by the **framework** (how to build correctly)
- They work on priorities set by the **engine** (what's worth building)

### Humans are sovereign

The rules above are principles. The enforcement mechanism is **human-in-the-loop at every boundary** where something enters or changes the system.

- **Agents propose, humans ratify.** Nothing enters the constitution or the law without explicit sign-off. The engine can draft archetypes, flag gaps, and suggest priorities — but humans decide what becomes canonical.
- **Foundational documents require explicit permission to change.** Archetypes, core journeys, surface rules, and golden rules cannot be modified silently. Every change is logged and attributed.
- **New law is ruled on by the design function.** Agents can use components; they cannot legislate new ones into existence. A new component is a human decision.
- **Change logs are the audit trail.** Every amendment and every ruling is recorded with who, when, and why.

LLMs can do enormous operational work inside each branch — observing, drafting, synthesising, implementing. What they cannot do is cross the boundaries between branches without a human on the other side. That's what keeps the republic from drifting into autocracy.

---

## Why separation matters

Three connected parts, three different cadences. That's what lets the system scale:

- **The design system can ship releases without rewriting principles.**
- **The framework can amend principles without rebuilding components.**
- **The engine can shift priorities without destabilising either.**

Each layer protects the one below it from the churn of the one above it. And agents — which increasingly do the implementation work — can trust each layer to be stable within its own rhythm.

A republic, not a monarchy. That's what makes design a system the rest of the organisation can plug into, rather than a bottleneck it has to wait for.

---

## Status of the triad

| Part | Repo | Maturity |
|---|---|---|
| **Design System** | `clarity-v2` | Foundation complete; 1 component shipped; core component set in active development |
| **Experience Framework** | `experience-framework` | Core principles, surfaces, and quality standards scaffolded; skills pending |
| **Design Engine** | `experience-framework/nivoda-design-engine-main/` *(temporary home)* | Archetypes and core journeys drafted; feedback pipeline prototyped |
| **Minivoda Digital Twin** | `minivoda/clarity-digital-twin`  *(delivery venue)* | Deployed to Vercel; buyer-side marketing, auth, home, product browsing (6 categories), orders, share modal, and dark mode all working against real data |

The three parts of the triad are at different stages of maturity. The design system is the near-term priority and the most commercially visible piece. The framework and engine are emerging alongside it and will come into focus as the library stabilises. Minivoda sits outside the triad conceptually — it is not law, constitution, or government — but it is the venue where the self-serve delivery path actually happens, and it is the proof artefact that makes the commercial case tangible.

---

## What comes after Phase D

Not planned yet. Deliberately. By the time Phase D is real, the world will have changed enough that planning now is premature. The next-after-D question is probably something like: does Clarity V2 become the foundation for a broader internal tools platform? Does it get open-sourced? Does it merge with Experience Framework into a single delivery system? Those are conversations for 2027.
