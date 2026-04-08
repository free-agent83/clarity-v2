# Mobile Design System — State of Play Review

Based on conversation: Chris Learey & Arthur Pasqualon | 31 March 2026

## Executive Summary

The mobile application has a set of core UI components in place, but they are not consistently aligned with the current Figma design system. The token build pipeline is used as the token layer but naming conventions, typography definitions, and color tokens diverge from Figma by an estimated 30%. There is no active Storybook instance for mobile (one existed previously), meaning there is no central place to view, test, or document mobile components. Several areas of the app, notably checkout and orders, still rely on legacy JavaScript components that predate the current design system and TypeScript migration.

Mobile does not use a third-party UI library (e.g. Material UI); all components are built in-house using React Native. This provides flexibility but increases the maintenance burden and makes alignment with Figma even more critical.

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

## Recommended Roadmap

Arthur and Chris agreed on a phased approach, starting with the foundational token layer before addressing components or feature screens. The following phases were discussed.

| Phase | Workstream | Description | Est. Effort |
|---|---|---|---|
| **1** | **Token Alignment** | Align color and typography token names in the codebase to match Figma exactly. Ensure the token build pipeline is the single source of truth used by both web and mobile. | ~1 sprint (1 dev) |
| **2** | **Storybook Setup** | Re-establish a Storybook instance for mobile React Native components. Start with one or two core components, then expand incrementally. Investigate any past issues with the team. | TBD |
| **3a** | **Core Component Refactor** | Systematically update core components (buttons, filters, inputs) to match Figma variants. Document each in Storybook. | TBD |
| **3b** | **Feature Screen Refresh** | Revamp legacy screens (checkout, orders, cart) to use updated components and TypeScript. Requires updated Figma layouts for these sections. | TBD |
| **4** | **Packaging & Versioning** | Introduce component packaging and versioning for mobile, aligned with web approach (NX/npm). Coordinate with front-end team on strategy. | TBD |

**Note:** Phases 3a and 3b are parallel paths. The product team will need to decide whether to prioritise core component refactoring or feature-level screen refreshes. Both require design resource for updated Figma layouts.

## Open Dependencies & Decisions

1. Engineering allocation: Dedicated mobile developer time needs to be agreed with Andre and product leadership. Arthur estimates at least one full sprint for Phase 1 alone.
2. Figma completeness: Some screens (checkout, orders) lack updated Figma layouts. Design resource is needed before mobile can refactor those areas.
3. Storybook viability: Arthur will consult with longer-tenured mobile developers about any historical issues with Storybook on React Native before committing to the tooling choice.
4. Documentation platform: Chris is evaluating a documentation app that can embed Storybook components for broader usage guidelines, which would benefit from both web and mobile using Storybook.
5. Phases 3a vs 3b prioritisation needs a product decision on whether to focus on systematic component quality or user-facing screen modernisation first.

## Immediate Next Steps

| Owner | Action | Timeline |
|---|---|---|
| **Chris** | Document architectural proposal for design system across web and mobile, including token alignment and Storybook adoption. | This week |
| **Chris** | Discuss mobile engineering allocation with Andre and leadership. | This week |
| **Chris** | Generate and share a color palette reference from Figma for Arthur's team. | Near-term |
| **Arthur** | Check with mobile team on any past Storybook issues or concerns. | This week |
| **Arthur** | If time allows, explore re-establishing Storybook for one or two mobile components. | Near-term |
| **Arthur** | Sync with front-end team on their component packaging and versioning approach (NX/npm). | Near-term |
