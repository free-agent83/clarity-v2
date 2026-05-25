# Mobile Design System — Clarity V2 Integration

**Original diagnostic:** Chris Learey & Arthur Pasqualon | 31 March 2026  
**Updated for Clarity V2:** 24 April 2026

## Executive Summary

The mobile application has historically managed its own component library separate from web, with three critical gaps: token naming misalignment, no isolated component documentation (Storybook), and legacy code spread across checkout and orders screens. **Clarity V2 eliminates these problems for mobile by introducing a unified, cross-platform token pipeline and a shared component architecture where React Native variants are built alongside web components, not after them.**

This document describes mobile's current state, identifies why those gaps mattered, and explains how Clarity V2's architecture provides the solution.

## Current State Assessment

The table below summarises the maturity of each layer of the mobile design system as discussed in the review conversation.

| Area | Status | Detail |
|---|---|---|
| **Core Components** | Partial | Components exist for views, text, inputs, buttons, etc. but are spread across the app and do not fully match Figma specs. |
| **Token Build Pipeline** | Partial | Installed and in use, but token names differ from Figma. Approximately 70% alignment for colors; weaker for typography. |
| **Color Tokens** | Good | Centrally managed and reasonably well-matched to Figma. Semantic naming (e.g. color.semantic.primary.300) is in place. |
| **Typography** | Weak | Token naming does not match Figma. Developers must manually cross-reference styles, creating friction and inconsistency. |
| **Storybook** | None | No active Storybook instance for mobile. One existed previously but has been inactive since before Arthur joined. |
| **Component Packaging** | None | No npm package structure or versioning for mobile components. Web team uses NX monorepo with packaged, versioned components. |
| **Legacy Code** | High Debt | Checkout, orders, and cart screens use deprecated JavaScript components with no TypeScript. These were not updated during the parity project. |

## Key Findings

### Strengths

- Custom-built component library (no third-party dependency like Material UI) gives the team full control over appearance and behaviour.
- Color tokens are centrally managed and broadly usable, with semantic naming conventions already in place in Figma.
- The token build pipeline is already adopted on both web and mobile, providing a shared bridge between platforms.
- Figma component library exists with typography and color definitions that can serve as the canonical reference.

### Gaps & Risks

- Typography token naming mismatch between Figma and codebase forces developers to manually search and map styles, slowing delivery and introducing inconsistency.
- No Storybook or equivalent for mobile means components cannot be reviewed, tested, or documented in isolation.
- Legacy JavaScript screens (checkout, orders, cart) represent significant technical debt and are disconnected from the current design system.
- No dedicated engineering time has been allocated for design system alignment on mobile; work has been done ad-hoc, feature by feature.
- No component versioning or packaging strategy exists on mobile, unlike the web team which uses NX and npm packages.

## How Clarity V2 Solves Mobile's Gaps

The gaps identified above — token misalignment, no component documentation, legacy code, and packaging inconsistency — were inherent to maintaining mobile as a separate system. Clarity V2 was built to eliminate these problems at the architectural level.

| Gap | What it was | How Clarity V2 solves it |
|---|---|---|
| **Token Naming Mismatch** | Mobile and web tokens had different names for the same colors/typography, forcing manual mapping. ~30% divergence from Figma. | Clarity V2's unified token pipeline (`packages/tokens/`) outputs the same token values to web, React Native, and JSON. A single source of truth in `packages/tokens/src/` feeds all platforms. Token names are Tailwind-standard (`xs/sm/base/lg`) for typography and DTCG primitives for colors — no mapping, no divergence. |
| **No Component Documentation** | Mobile components existed but couldn't be reviewed or tested in isolation. No Storybook. | Clarity V2 components (`packages/components/`) include React Native variants built alongside web components. Each component has a Storybook story + COMPONENT.md documentation. React Native variants consume the same tokens and follow the same prop contracts as web. |
| **Legacy Code Islands** | Checkout, orders, and cart used pre-design-system JavaScript. Not TypeScript, not tokenized. | Clarity V2 components are all TypeScript + token-aware. As these legacy screens are touched for any reason, they can be incrementally replaced with Clarity V2 components. No big migration, just component-by-component replacement as the app evolves. |
| **No Packaging Strategy** | Mobile components weren't versioned or packaged. Web used NX + npm. | Clarity V2 uses Nx monorepo + scoped npm packages (`@nivoda/components`, `@nivoda/tokens`). Mobile teams import components from npm, same as web. Versioning is coordinated across both platforms. |

---

## Mobile Integration Path

Mobile teams adopt Clarity V2 components as new features are built or existing components are touched. This is incremental adoption, not a migration sprint.

### Immediate (when ready)
1. **Import tokens** — `packages/tokens/` outputs React Native-compatible JS/TS objects. Mobile code switches from local token definitions to npm imports.
2. **Start with primitives** — Button, Input, Select, etc. Already have React Native variants in Clarity V2. First few features use these instead of local components.
3. **Document as you go** — Each component used gets added to the mobile team's integration notes. Design team reviews for RN-specific concerns.

### Near-term
1. **Storybook for RN components** — Clarity V2's Storybook includes React Native stories. Mobile team can review component contracts and test scenarios without writing code.
2. **Replace a screen** — Pick a non-critical screen (product listing, search results, etc.) and rebuild it using Clarity V2 components. This becomes the reference implementation showing mobile engineers what "done" looks like.
3. **Sync with web team** — Coordinate on component updates. If web changes a Button variant, mobile's React Native Button changes in lockstep (in the same PR).

### Ongoing
1. **Legacy screens** — Checkout, orders, and cart are replaced component-by-component as they're touched for other reasons (bug fixes, features, performance). Not a dedicated project — just opportunistic when the code is open anyway.
2. **New features** — All new mobile work uses Clarity V2 components. The mobile codebase gradually becomes 100% Clarity V2 without a single "migration sprint."

---

## Alignment with Web Team

Clarity V2 is designed for teams (web and mobile) to move at their own pace while staying synchronized on tokens and component contracts. The web team's adoption plan is in `docs/plans/engineering-proposal.md`; mobile follows the same patterns:
- **Option C (Opportunistic):** New features use Clarity V2. Legacy code stays stable until touched.
- **Incremental replacement:** When a component is modified, use the Clarity V2 equivalent instead.
- **No migration freeze:** No "everyone stop and migrate everything" period.

The React Native integration details are in `docs/architecture/architecture.md` under Layer 2 (Component Libraries).
