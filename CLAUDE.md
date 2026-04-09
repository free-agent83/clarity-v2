# CLAUDE.md

This file orients Claude Code at the start of every session in this repo. It is not for humans — see `README.md`, `ROADMAP.md`, and `VISION.md` for human-facing context.

## What this repo is

Clarity V2 is Nivoda's new design system: W3C DTCG tokens + shadcn/ui components + Tailwind v4, in an Nx monorepo. Owned by the design function (Chris). It replaces an older MUI-based design system that lives in the `platform` repo.

**Core outcome:** Whoever builds UI — engineer, designer, or PM — produces design-correct output automatically. The components ARE the design. This collapses the design → engineering → design-QA iteration loop that currently dominates UI delivery. Both engineers writing code directly and designers/PMs using AI coding agents consume the same library and get the same guarantee.

See `ROADMAP.md` for the full picture.

## Required reading (in this order)

1. `ROADMAP.md` — current status and master phased plan (A done, B active, C/D pending)
2. `VISION.md` — vision, commercial case, and design triad conceptual model
3. `CHANGELOG.md` — phase-by-phase progress log
4. `docs/architecture/architecture.md` — technical architecture + ADRs 001–004

## Related repos on disk

- `../experience-framework/` — governance, principles, agent instructions, personas, surface rules. Owned by design. Clarity V2 is the "law"; this is the "constitution". See VISION.md.
- `../platform/` — the production Nivoda monorepo. Contains the current MUI-based design system at `libs/shared/style-dictionary/`, `libs/shared/components/`, `libs/shared/theme/`. **This is the eventual consumer of Clarity V2.** Reference for token alignment and component APIs. Do not modify platform code — that's engineering-owned.

## Key conventions

- **Bespoke token build, not Style Dictionary.** See ADR-001. Build script is `packages/tokens/build.mjs`, ~200 lines of plain Node.js. Do not reintroduce SD.
- **OKLCH color format** throughout. Tokens stored as DTCG structured color objects (`{ colorSpace: "oklch", components: [L, C, H], hex: "#..." }`) with hex fallbacks for React Native.
- **shadcn-flat naming** for the shadcn output platform (`--background`, `--primary`, etc.). Other platforms use structured naming (`--color-primitive-violet-500`).
- **Brand color is `violet`**, not `purple`. Uses platform production values. See `docs/design/token-decisions.md`.
- **Component library is Tailwind v4 + shadcn/ui + Radix UI**. No MUI, no CSS-in-JS runtimes, no emotion. Components imported via shadcn CLI into `packages/components/src/components/`.
- **Test with vitest.** Test file: `packages/tokens/tests/build.test.mjs`.

## Things to avoid

- Do not modify files in `../platform/` — that's production code owned by engineering.
- Do not commit `dist/`, `storybook-static/`, `node_modules/`, `.DS_Store` — all gitignored.
- Do not add Chromatic back. See ADR-002 (security incident + self-hosted alternative).
- Do not add Zeroheight. See ADR-004 (Fumadocs replaces it).
- Do not add Tokens Studio. See ADR-003 (bidirectional Figma sync rejected).
- Do not create markdown files in the repo root except the top-level ones already there (`README.md`, `CLAUDE.md`, `ROADMAP.md`, `VISION.md`, `CHANGELOG.md`). All other docs live under `docs/`.

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
- `cd packages/tokens && npx vitest run` — run token tests (should be 20 passing)
- `npx nx build tokens` — Nx build for tokens
- `npx nx build components` — Nx build for components
- `cd packages/components && npx storybook dev -p 6006` — run Storybook locally

## When in doubt

Ask Chris. He's the design lead and owns all decisions. Do not improvise design or architectural decisions — flag gaps and wait for a ruling. See VISION.md "Separation of powers" for the operating model.
