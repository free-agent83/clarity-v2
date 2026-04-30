# Contributing to `@nivoda/tokens`

This package is the source of truth for every atomic visual decision across Nivoda's products. A single wrong value in `src/` ripples across web, React Native, email templates, and backend outputs. The rules below exist to keep that surface safe.

## Who edits what

| Path | Who | Why |
|---|---|---|
| `src/**` | **Humans only** | DTCG token definitions — design's sole territory |
| `CONTRIBUTING.md` (this file) | **Humans only** | Meta: agents shouldn't be able to weaken their own leash |
| `build.mjs` | Agents welcome | Build pipeline — engineering-owned |
| `lib/` (`color.mjs`, `resolve.mjs`) | Agents welcome | Build helpers |
| `tests/` | Agents welcome | Vitest suite |
| `package.json`, `project.json` | Agents welcome | Package + Nx target config |
| `dist/` | Nobody | Generated output — do not edit, gitignored |

## Why `src/` is human-only

Every token in `src/` flows, unchanged or transformed, into:

- Web CSS custom properties
- React Native JS/TS objects (with hex fallbacks for OKLCH)
- Email template inline values
- Backend JSON

A single changed value carries brand, accessibility, and product implications across every Nivoda surface at once. These are decisions only the design function should make. This is the "law / constitution" split from [`VISION.md`](../../VISION.md) — design owns what the tokens *are*; engineering owns how they *build*.

## Three enforcement layers

The human-only boundary is defended in depth:

1. **Claude Code hook** (`.claude/settings.json`) — `PreToolUse` hook blocks `Edit`, `Write`, and `MultiEdit` against `packages/tokens/src/` and this file. Stops the agent locally before a change hits disk.
2. **CODEOWNERS** (`.github/CODEOWNERS`) — the design lead is a required reviewer on any PR touching those paths. Catches anything that slips past the hook.
3. **This document** — explains *why* so humans and agents understand the rule instead of just tripping over it.

If the boundary ever changes, **all three layers must be updated together**. They exist to reinforce each other; drift between them will silently weaken the lock.

## Changing a token (human process)

1. Open a PR with the `src/` change.
2. In the PR description, cover:
   - What visual decision is changing and why
   - Which tokens are affected (semantic and the primitives they reference)
   - Whether this is a breaking change (rename / removal / material value shift)
3. Rebuild and test locally:
   ```sh
   cd packages/tokens
   node build.mjs
   npx vitest run
   ```
4. Request review from the design lead.
5. Merge only after design sign-off.

## Versioning

See the root [`CONTRIBUTING.md`](../../CONTRIBUTING.md#versioning) for the project-wide versioning and breaking-change policy. It applies to this package as written: a token rename, removal, or value shift that materially changes component appearance is a **major** change and triggers the deprecation window.

## What agents can do

- Fix bugs in `build.mjs` and `lib/`
- Add or improve tests in `tests/`
- Add new platform build targets (e.g. a new output format)
- Improve build output quality, performance, or diagnostics
- Reference existing token names in documentation and component code

## What agents cannot do

- Add, remove, rename, or modify any value in `src/**`
- Edit this `CONTRIBUTING.md`
- Weaken any of the three enforcement layers without a human-authored commit
