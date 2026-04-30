# packages/components — Claude Code guidance

Orients agents when working inside `packages/components/`. For system-wide conventions, see the root [CLAUDE.md](../../CLAUDE.md).

## What this package is

The Clarity V2 **web component library**. Whoever uses it — engineer, designer, or AI agent — produces design-correct output automatically. The components ARE the design.

Phase B is currently active (see [ROADMAP.md](../../ROADMAP.md)) and the critical path is building out the core component set. Work in this package should be squarely aimed at that goal unless explicitly directed otherwise.

## How agents orient here

Two files cover almost everything you need before touching this package. Read them in this order:

1. **[COMPONENTS.md](./COMPONENTS.md) — the library map.** A thin, high-level index of every component in the package grouped by intent (Forms, Actions, Overlays, Feedback, Display, Data, Navigation, Templates, Filtering, Foundations), plus a summary of the Tailwind v4 `@theme` semantic utilities. Each component entry carries its atomic classification, lifecycle status (stable/unstable/deprecated), a one-line "what it's for", and a one-line "what it's not for" — enough to pick the right component and the right tokens without opening every `COMPONENT.md` in the tree. This is the entry point when *consuming* the library: generating UI, wiring a feature, or picking a token.
2. **[CONTRIBUTING.md](./CONTRIBUTING.md) — the build rules.** The single source of truth for folder structure, implementation conventions, token consumption rules, Storybook requirements, testing strategy, COMPONENT.md format, and the definition of done. This is the entry point when *changing* the library: adding, editing, promoting, or removing a component. Do not rely on memory or pattern-match from other repos — the file is short enough to read each session.

Each component also has its own `COMPONENT.md` covering props, detailed usage, best practices, and known deviations — the index in COMPONENTS.md links to every one.

One behavioural principle overrides anything your instincts might suggest: **agents propose, humans ratify.** New components, new token mappings, changes to the shadcn theme layer, and anything COMPONENTS.md or CONTRIBUTING.md doesn't explicitly cover are human decisions. Flag gaps and wait for a ruling from design leadership — do not improvise, do not invent.
