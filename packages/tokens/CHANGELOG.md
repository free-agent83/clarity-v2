# Changelog — @nivoda/tokens

Package-specific changes for the Clarity V2 design tokens. Newest entries first.

For cross-cutting monorepo changes, see the root [`CHANGELOG.md`](../../CHANGELOG.md). Format and rules: see root [`CONTRIBUTING.md`](../../CONTRIBUTING.md#changelog).

---

## 2026-04-30

- Stripped overlapping versioning/breaking-change policy from `CONTRIBUTING.md`; now points to root for the project-wide policy. Token-specific interpretation (rename / removal / material visual shift = major) preserved as a one-liner (`c8e3143`).
- Scrubbed broken `VISION.md` link and the "law / constitution split" metaphor from `CONTRIBUTING.md` per the self-containment rule. Design-vs-engineering ownership statement stands on its own (`5fcc227`).
- Version bumped from `0.1.0` → `0.0.1` to match the pre-1.0 "0.0.1 everywhere" rule (`a385834`).

## 2026-04-10

- Added `CLAUDE.md` package orientation file (`a4ea950`).
- Added `CONTRIBUTING.md` with the human-only rule for `src/`, three enforcement layers (PreToolUse hook, CODEOWNERS, this doc), and the package's edit policy (`9abdaca`).
- Removed the shadcn-specific layer from the package — surface-specific theme mapping is a consumer concern, not a foundation one. Deleted `src/shadcn/`, `buildShadcnCSS()`, the `./shadcn` subpath export, and the `dist/shadcn/tokens.css` output (`0110020`).

## 2026-04-08

- Token alignment with platform: 15 decisions applied. `purple` → `violet`; palette values updated to production; missing tiers added (red 800–950, amber 200–400 + 800–950, green 800–950, blue 50–950). Dropped MUI legacy palettes (orange, grey, blue_grey) (`b09b3aa`).

## 2026-04-07

- Bespoke build script (`build.mjs`, ~200 lines of plain Node.js) replaces Style Dictionary v5 (ADR-001). All platform outputs migrated: web CSS, JS/TS, React Native (with hex fallbacks for OKLCH), JSON (`6758185`, `a435e0a`, `5c65b88`).
- Color tokens migrated to OKLCH (W3C DTCG v2025.10 structured color objects). New `lib/color.mjs` for OKLCH ↔ hex conversion with full test coverage (`6aec405`).
- `color.tokens.json` split into `primitive.tokens.json` (raw OKLCH values) + `semantic.tokens.json` (role tokens that `$ref` primitives) (`32948bf`).
- shadcn light/dark theme tokens + radius tokens added (later removed — see 2026-04-10) (`2ab64be`).
- 20 tests passing (color conversion, reference resolution, integration).

## 2026-04

- Initial scaffolding as part of the monorepo bootstrap (`6313891`).
