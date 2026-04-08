# Changelog

All notable progress on Clarity V2 is recorded here. Most recent entries first.

---

## 2026-04-08 — Token alignment with platform

Applied 15 design decisions after auditing the platform design system (MUI + Style Dictionary v3) against Clarity V2. The token foundation now reflects production-vetted color values with Clarity V2's modern naming conventions.

**Palette changes:**
- Renamed `purple` → `violet` (platform convention)
- Violet values updated to match platform production values
- Added violet 950 tier
- Green values updated to match platform production values
- Added missing tiers: red 800-950, amber 200-400 + 800-950, green 800-950
- Added blue palette (50-950) for info states and links

**Kept from Clarity V2:** `stone` naming, Tailwind-standard typography (xs-5xl), 4 font weights, 13-tier spacing scale, `radius sm = 4px`.

**Dropped from platform:** orange, grey, blue_grey palettes (MUI legacy).

See [`docs/design/token-decisions.md`](docs/design/token-decisions.md) for full rationale and [`docs/design/token-alignment.md`](docs/design/token-alignment.md) for the side-by-side comparison that drove the decisions.

---

## 2026-04-07 — Token alignment Phase 1 complete

Phase 1 of the broader token alignment plan. Replaced Style Dictionary with a bespoke build script, converted color tokens to OKLCH, added shadcn-compatible output for frontend consumption, and removed Chromatic.

**Delivered:**
- Bespoke build script (`packages/tokens/build.mjs`) — ~200 lines of plain Node.js, replacing Style Dictionary v5
- OKLCH color format throughout (W3C DTCG v2025.10 structured color objects)
- New output platform: `dist/shadcn/tokens.css` with `:root` + `.dark` scoped CSS for shadcn/ui consumption
- Complete test suite (20 tests passing) — color conversion, reference resolution, integration
- Four Architectural Decision Records (ADRs) documenting why each choice was made

**Architectural decisions recorded** (see [`docs/architecture/architecture.md`](docs/architecture/architecture.md)):
- ADR-001: Bespoke build script over Style Dictionary
- ADR-002: Chromatic removed
- ADR-003: Tokens Studio rejected (retained from original design)
- ADR-004: Fumadocs over Zeroheight

**Verification:** `nx build tokens`, `nx build components`, `nx build test-app` all succeed. 20/20 tests pass.

See [`docs/plans/2026-04-07-token-alignment-phase1.md`](docs/plans/2026-04-07-token-alignment-phase1.md) for the full implementation plan and [`docs/plans/specs/2026-04-07-token-alignment-design.md`](docs/plans/specs/2026-04-07-token-alignment-design.md) for the design spec.

---

## 2026-04 — Initial scaffolding

Initial repo setup: Nx monorepo structure, token source files, single Button component in Storybook, test app. Used Style Dictionary v5 for the token pipeline (later replaced — see above).

**Context documents produced:**
- [`docs/research/ds-diagnosis.md`](docs/research/ds-diagnosis.md) — evidence-based assessment of the current design system and priority recommendations
- [`docs/research/code-first-ds.md`](docs/research/code-first-ds.md) — industry research on code-first design systems, AI tooling, W3C DTCG spec
- [`docs/research/mobile-ds-diagnosis.md`](docs/research/mobile-ds-diagnosis.md) — mobile design system state and alignment roadmap

---

## Roadmap — what's next

**Phase 2 — Minivoda integration** (deferred until a fresh Minivoda checkout is available)
Connect Minivoda to clarity-v2's shadcn token output. Mechanical change: one `@import` added, hand-written token blocks removed.

**Phase 3 — Component library buildout**
Build shadcn/ui components fresh in clarity-v2 using the new tokens. Wire to Storybook. Refactor Minivoda imports to consume `@nivoda/components` instead of local copies.

**Documentation site** (Fumadocs)
Single static site serving both the Experience Framework (governance, strategy) and Clarity V2 (components, tokens). Deployed to Vercel. Non-technical face for stakeholders.

**Platform migration** (long-term)
Gradual migration of existing MUI-based platform components to Clarity V2 equivalents. Enabled by the token alignment — visual consistency preserved during migration.
