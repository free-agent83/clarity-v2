# The Nivoda Design Triad

*The conceptual model behind how design operates at Nivoda.*

## The idea in one paragraph

Design at Nivoda runs as a small **republic**: three branches with distinct roles, separation of powers between them, and rule of law binding on all of them. A **component library** provides the building blocks (the law), a **governance framework** establishes the principles for using them (the constitution), and an **intelligence layer** observes users and decides what to work on (the government). The three are distinct in role, cadence, and audience — but together they form one coherent system.

---

## The three parts

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

- **Owned by:** the design team (with AI assistance handling the operational load)
- **Consumed by:** humans making strategic decisions
- **Cadence:** continuous. Every cycle brings new intelligence.
- **Source of truth for:** *"What to build and why."*

---

## How the three relate

The primary flow is top-down. Intelligence becomes governance becomes implementation:

```
Design Engine        →    Experience Framework    →    Design System
(what and why)            (how)                        (with what)

Observes reality          Governs agent behaviour      Provides components
Sets priorities           Enforces quality standards   Enforces precedent
Decides initiatives       Prescribes handoff protocol  Binds implementation
```

The engine decides *"we need to fix checkout."* The framework governs *how* an agent builds it. The design system provides the *pieces*.

A feedback flow runs the other way. When an agent hits a gap during implementation — *"there's no component for this case"* — that gap flows back up: flagged in the framework, escalated to the design system, a new ruling is made.

```
Design System    ←    Experience Framework    ←    Implementation
(new ruling)          (gap escalated)               (gap flagged)
```

Archetypes and journey maps, which are born in the engine, are eventually adopted into the framework once stable — a constitutional amendment incorporating the government's research into the foundational document.

---

## Separation of powers

Three rules hold across the system. They're what make the republic stable:

1. **Law can't contradict the constitution.** A component cannot violate the framework's principles.
2. **Government operates within constitutional bounds.** The engine can set priorities but cannot override how things get built.
3. **New law is made when precedent doesn't exist.** Agents don't invent. They flag, and the design function rules.

No branch dominates the others. The engine can't reach down into implementation. The framework can't legislate components into existence. The design system can't set its own priorities. Each branch is sovereign in its own domain and bound by the rules of the others.

---

## Why this matters

Three connected parts, three different cadences. That's what lets the system scale:

- **The design system can ship releases without rewriting principles.**
- **The framework can amend principles without rebuilding components.**
- **The engine can shift priorities without destabilising either.**

Each layer protects the one below it from the churn of the one above it. And agents — which increasingly do the implementation work — can trust each layer to be stable within its own rhythm.

A republic, not a monarchy. That's what makes design a system the rest of the organisation can plug into, rather than a bottleneck it has to wait for.

---

## Status

| Part | Repo | Maturity |
|---|---|---|
| **Design System** | `clarity-v2` | Foundation complete; 1 component shipped; core component set in active development |
| **Experience Framework** | `experience-framework` | Core principles, surfaces, and quality standards scaffolded; skills pending |
| **Design Engine** | `experience-framework/nivoda-design-engine-main/` *(temporary home)* | Archetypes and core journeys drafted; feedback pipeline prototyped |

The three parts are at different stages of maturity. The design system is the near-term priority and the most commercially visible piece. The framework and engine are emerging alongside it and will come into focus as the library stabilises.
