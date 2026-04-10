# packages/components — Claude Code guidance

Orients agents when working inside `packages/components/`. For system-wide conventions, see the root [CLAUDE.md](../../CLAUDE.md).

## What this package is

The Clarity V2 **web component library** — the "Law" branch of the Nivoda Design Triad (see [VISION.md](../../VISION.md)). Every component shipped here is a ruling that binds all downstream implementation: whoever uses the library — engineer, designer, or AI agent — should produce design-correct output automatically. The components ARE the design.

Phase B is currently active (see [ROADMAP.md](../../ROADMAP.md)) and the critical path is building out the core component set. Work in this package should be squarely aimed at that goal unless explicitly directed otherwise.

## How agents contribute here

> **Read [CONTRIBUTING.md](./CONTRIBUTING.md) before making any changes.** 

 [CONTRIBUTING.md](./CONTRIBUTING.md) is the single source of truth for folder structure, implementation conventions, token consumption rules, Storybook requirements, testing strategy, COMPONENT.md format, and the definition of done. Do not rely on memory or pattern-match from other repos — the file is short enough to read each session.

One behavioural principle overrides anything your instincts might suggest: **agents propose, humans ratify.** New components, new token mappings, changes to the shadcn theme layer, and anything CONTRIBUTING.md doesn't explicitly cover are human decisions. Flag gaps and wait for a ruling from design leadership — do not improvise, do not invent.
