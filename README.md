# Clarity V2 — Design System & Component Library

The design system, component library, and technical architecture for Nivoda's product surfaces. Built on shadcn/ui, Tailwind CSS, and Storybook.

For governance, agent instructions, business context, and surface-specific rules, see the [Experience Framework](../experience-framework/) repo.

---

## Start Here

- **[architecture.md](./architecture.md)** — technical architecture: token pipeline, component libraries, Nx monorepo, MCP servers, and documentation layer
- **[ds-diagnosis.md](./ds-diagnosis.md)** — evidence-based assessment of the current design system stack and priority recommendations
- **[mobile-ds-diagnosis.md](./mobile-ds-diagnosis.md)** — mobile design system state of play and alignment roadmap
- **[code-first-ds.md](./code-first-ds.md)** — industry research: code-first design systems, AI tooling, W3C token spec

---

## What This Repo Contains

- Design tokens (W3C DTCG JSON, transformed by a bespoke build pipeline — see architecture.md ADR-001)
- Component library (shadcn/ui + Radix UI + Tailwind CSS)
- Storybook for component development and documentation
- Platform-specific implementations (web and React Native)
- MCP server configuration for AI-assisted implementation

## What This Repo Does Not Contain

- Governance rules or agent instructions → [Experience Framework](../experience-framework/)
- Business context, personas, or surface rules → [Experience Framework](../experience-framework/)
- Feature prototypes or handoff specs → Minivoda repo
- Scope documents for specific initiatives

---

## Ownership

Owned by the design function. Engineers, product managers, and agents are consumers, not editors. Changes require design review.