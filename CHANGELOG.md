# Changelog

All notable progress on Clarity V2 is recorded here. Most recent entries first.

---

## 2026-04-13 — Button conformance pass and CONTRIBUTING realignment

Promoted Button to `stable` after a conformance pass against `packages/components/CONTRIBUTING.md`, and amended CONTRIBUTING itself where its guidance had drifted from current decisions.

**Button changes:**
- Introduced a named `ButtonProps` interface, exported as a type. Previously the prop type was inlined on the function signature.
- Added a `loading` prop that prepends a `Spinner`, forces the button disabled, and sets `aria-busy`. Uses the existing `atoms/spinner` atom.
- Added JSDoc blocks on `buttonVariants` (naming each variant axis) and on the `Button` export (describing purpose, the `asChild` escape hatch, and a link to the variants object). Matches CONTRIBUTING's "two mandatory JSDoc blocks" rule.
- Fixed indentation on the destructive/success/link variant entries in `buttonVariants`.
- Fixed the Storybook `argTypes.size` options, removing the non-existent `icon-lg` option. Added a `Loading` story and a `loading` control.
- Filled out `COMPONENT.md` (frontmatter, props, usage, best practices, writing, quality checklist). Version `0.0.0` → `0.1.0`, status `unstable` → `stable`.
- Uncommented the Button line in `packages/components/src/index.ts` and added the `ButtonProps` type export alongside it.
- Imported `Spinner` via the `@/components/atoms/spinner/spinner` alias (matching the existing `@/lib/utils` import right above it) rather than a relative path. This choice surfaced a latent `packages/components/vite.config.ts` bug once the barrel went live: the `@/` alias was wired in `tsconfig.json` and `.storybook/main.ts` but not in the library vite config, so rollup couldn't resolve `@/lib/utils` or `@/components/atoms/spinner/spinner` once `button.tsx` entered the build graph. Added the alias to the library vite config as part of the barrel commit.

**CONTRIBUTING.md changes and reasoning:**

- **Dropped the `forwardRef` / `displayName` convention.** Reason: we are following shadcn's React-19 defaults (plain function components, no ref forwarding). The ecosystem is transitioning to treating `ref` as a regular prop, and introducing `forwardRef` today would be premature overhead. This may be revisited if a consumer needs ref access that plain function components can't provide.
- **Relaxed the minimum story set.** Reason: developers can exercise variants, sizes, and boolean states directly through Storybook's `argTypes` controls panel — dedicated stories for each permutation are redundant. The new rule: write a story only when a usage pattern isn't discoverable from the controls (icon children, `asChild` composition, wrapper-dependent behaviour, etc.). Every component still has at least one default story as an anchor for the controls playground.
- **Removed Button-as-reference language and genericized all Button-shaped code examples.** Reason: the previous CONTRIBUTING pointed at Button as "a living reference", but Button didn't actually conform to the conventions it was supposed to exemplify. Examples are now genericized (`Component` / `componentVariants` / `ComponentProps`) so CONTRIBUTING teaches patterns without binding them to a specific real component. A real reference can be re-anchored later if useful.
- **Removed Figma parity from the `COMPONENT.md` quality checklist.** Reason: how Clarity V2 components should be represented in Figma (authored there first, generated from code, hand-maintained in parallel, or something else) is an unresolved programme-level question. Until that decision is made, the component library is the source of truth, not Figma, and gating components on Figma parity would hold them hostage to an undecided process. Figma parity returns as a quality gate only after the Figma strategy lands.
- **Deleted the "Setup: testing infrastructure" section.** Reason: the section claimed `@storybook/addon-a11y`, `@storybook/experimental-addon-test`, `@storybook/test`, and `vitest` still needed to be installed. Verified against `packages/components/package.json`: they are all already installed, and `test:storybook` is already in the package scripts. The section was stale.

**Scope explicitly excluded from this pass** (documented here so future work doesn't assume they were silently considered and rejected):

- **Variant / intent / size taxonomy redesign.** Current taxonomy is single-axis shadcn-flat (`default | outline | secondary | ghost | destructive | success | link`) with a separate `size` axis. CONTRIBUTING's illustrative example shows a two-axis `variant × intent` pattern, but that was always illustrative, not binding. A real taxonomy decision needs design-lead input and a breaking-change plan for any downstream consumers — neither of which belong in a conformance pass.
- **Arbitrary `rounded-[min(var(--radius-md),10px)]` values.** Left in the code. They use CSS variables (not raw literals) so they don't violate the "tokens only" rule strictly, but they're a soft gap under the "no arbitrary value syntax" guidance. Flagged in Button's `COMPONENT.md` under "Known deviations".
- **Slot import source.** `import { Slot } from "radix-ui"` remains. Changing it to `@radix-ui/react-slot` is a micro-cleanup, not a conformance issue.

**Verification:** `tsc --noEmit`, `nx build components`, `vitest run --project=storybook`, and Storybook dev server smoke test all pass for Button. Grep of `button.tsx` confirms no hex values, no arbitrary pixel/colour syntax, and only the known `rounded-[min(...)]` deviation.

See [`docs/superpowers/specs/2026-04-13-button-conformance-design.md`](docs/superpowers/specs/2026-04-13-button-conformance-design.md) for the full spec and [`docs/superpowers/plans/2026-04-13-button-conformance.md`](docs/superpowers/plans/2026-04-13-button-conformance.md) for the implementation plan.

---

## 2026-04-10 — Architectural correction: tokens package is surface-agnostic

Removed the shadcn-specific layer from the tokens package. The tokens package now emits only primitives and the surface-agnostic semantic layer; any mapping to a specific surface theme (shadcn, Tailwind `@theme`, etc.) lives in-loco in the consumer.

**Why:** surface-specific theme mapping is an implementation detail of each consumer, not a concern of the foundation. The previous layout had the tokens package carrying a parallel shadcn semantic layer (`src/shadcn/light.tokens.json`, `dark.tokens.json`, `radius.tokens.json`) and emitting `dist/shadcn/tokens.css` — leaking surface decisions into a layer that should be theme-agnostic.

**Removed:**
- `packages/tokens/src/shadcn/` (all three JSON files)
- `buildShadcnCSS()` in `packages/tokens/build.mjs`
- `./shadcn` subpath export in `packages/tokens/package.json`
- `dist/shadcn/tokens.css` output and its integration test

**Minivoda implication:** Minivoda will consume `@nivoda/components` as a finished product — it imports the components package and gets the shadcn theme mapping baked in via `packages/components/src/styles/globals.css`. Minivoda does not need to maintain any token mapping on its end; that mapping already lives alongside the components that use it.

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

See [`ROADMAP.md`](ROADMAP.md) for the full phased plan.

**Phase B — Proof** (active, 2-week window)
Build the core component set (~10-15 components). Rebuild a real Nivoda screen using Claude Code + Clarity V2 as the headline demo. Storybook runs locally.

**Phase C — Distribution**
Fumadocs documentation site deployed. Onboarding material for self-service UI delivery. First external person (designer or PM) builds something real with Clarity V2 + AI.

**Phase D — Adoption** (conditional, multi-quarter)
Design and PM use Clarity V2 to ship real features. Platform migration proceeds opportunistically as new features replace old MUI code. Governance (Experience Framework) becomes load-bearing as more people build.
