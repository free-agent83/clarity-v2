# CLAUDE.md

This file orients Claude Code at the start of every session in this repo. It is not for humans — see `README.md` for human-facing context.

## What this repo is

Clarity V2 is Nivoda's new design system: W3C DTCG tokens + shadcn/ui components + Tailwind v4, in an Nx monorepo. Owned by the design function. 

**Core outcome:** Whoever builds UI — engineer, designer, or PM — produces design-correct output automatically. The components ARE the design. This collapses the design → engineering → design-QA iteration loop that currently dominates UI delivery. Both engineers writing code directly and designers/PMs using AI coding agents consume the same library and get the same guarantee.

## Required reading

1. `CONTRIBUTING.md` — branching, commits, merging, versioning, changelog, ADRs, PR etiquette.
2. `CHANGELOG.md` — log of changes by date.
3. `docs/architecture/architecture.md` — technical architecture + ADRs.

## How we branch and merge

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the full ruleset. The shape: branch off `dev` with a `<type>/<short-kebab>` name, write Angular Conventional Commit messages, merge back to `dev` as a merge commit (no squash). `main` only moves on version bumps. **Commit as you go** — one logical unit per commit, committed before moving on. Don't batch a session's work into one end-of-task commit.

## Things to avoid

- Do not create markdown files in the repo root except the top-level ones already there (`README.md`, `CLAUDE.md`, `CONTRIBUTING.md`, `CHANGELOG.md`). All other docs live under `docs/`.

## Docs structure

```
docs/
├── architecture/    technical architecture, ADRs
├── design/          designer-facing (token decisions, comparisons)
├── plans/           implementation plans and specs
├── research/        point-in-time diagnostic research
└── archive/         historical artefacts
```

## How to run things

- `cd packages/tokens && node build.mjs` — rebuild all token outputs
- `cd packages/tokens && npx vitest run` — run token tests (should be 19 passing)
- `npx nx build tokens` — Nx build for tokens
- `npx nx build components` — Nx build for components
- `cd packages/components && npx storybook dev -p 6006` — run Storybook locally

## User sketchpad

If the user ever mentions a "sketchpad", they are referring to an untracked `.sketchpad/` folder sitting on this project's root.

## When in doubt

Ask Chris. He's the design lead and owns all decisions. Do not improvise design or architectural decisions — flag gaps and wait for a ruling.
