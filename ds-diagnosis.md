# This design system needs surgery, not a rebuild

> **Status: Point-in-time assessment.** This document is the diagnostic analysis that informed the target architecture defined in [architecture.md](architecture.md). It captures the evidence, industry benchmarks, and reasoning behind the architectural decisions. Refer to architecture.md for the current target state; refer to this document for the "why" behind those decisions.

The current architecture is **fundamentally sound in its monorepo + tokens + Storybook spine**, but three decisions are creating compounding technical debt: the continued coupling to Material UI's styled runtime, the unresolved mobile token fragmentation, and the emerging shadcn/ui greenfield that risks becoming a parallel universe. The good news: the highest-leverage fixes are token-layer and distribution-layer changes — not a full rewrite. Here's what the evidence says about each layer of the stack.

## Nx is the right tool — the question is whether you're using it enough

The monorepo + Nx orchestration approach remains **best practice for design systems in 2025/2026**. Adobe Spectrum uses Nx (v21+), and the tool now has ~5M weekly npm downloads, a Rust-accelerated core, distributed task execution, and an MCP server that gives AI coding assistants deep workspace awareness. The competing option, **Turborepo** (~2M weekly downloads, used by Shopify Polaris), is simpler to configure (~20 lines of config vs ~200 for Nx) but lacks code generators, module boundary enforcement, and distributed CI — all features that matter for a design system with multiple published packages and lifecycle stages.

**The practical decision framework is clear.** If you're already on Nx, stay on Nx — the switching cost is high and the feature set is superior for your use case. Turborepo wins for greenfield projects where simplicity is paramount, but Nx's `nx affected` command (which detects which packages are impacted by a token change and rebuilds only those), its code generators (for scaffolding new components with consistent structure), and its module boundary rules (preventing the kind of business logic coupling that forced you to unpublish the app shell) directly address pain points in the current setup.

One gap worth auditing: **are you actually using Nx's module boundary enforcement?** The fact that the app shell had to be unpublished due to business logic coupling suggests these boundaries weren't enforced at the tooling level. Nx's `@nx/enforce-module-boundaries` rule can prevent this class of problems entirely. GitHub Primer uses a polyrepo approach and ships successfully, but they're the exception — every other major design system (IBM Carbon, Adobe Spectrum, Microsoft Fluent UI, Shopify Polaris) uses a monorepo, and the reasoning is compelling: atomic cross-package changes, shared dependency versions, and coordinated releases.

## Material UI is the single biggest liability in the stack

MUI v7 (released March 2025) remains the most-downloaded React component library at **~6M weekly npm downloads and 93K GitHub stars**, but the industry is actively moving away from it for custom design systems, and for good reason. Three structural problems make MUI a poor foundation for a cross-functional, cross-platform design system:

**First, the Material Design aesthetic fingerprint is extremely difficult to remove.** Building a branded design system on MUI means constantly fighting defaults — overriding deeply nested theme tokens, replacing elevation patterns, and customizing component internals. Multiple engineering teams report that the effort to "de-Material" MUI exceeds the effort of building on headless primitives from scratch.

**Second, MUI's Emotion-based CSS-in-JS runtime is a dead-end architecture.** The industry has decisively shifted toward zero-runtime styling (Tailwind CSS, CSS Modules, CSS custom properties). MUI's own zero-runtime replacement, Pigment CSS, is **on hold as of early 2026** — still in alpha with no timeline. This means every MUI component requires `"use client"` directives in Next.js App Router and carries **100–200KB gzipped** bundle weight. Meanwhile, shadcn/ui components using Tailwind compile to static CSS at build time with zero runtime overhead.

**Third, and most critically for your cross-platform ambitions, MUI is web-only with no React Native story.** There is no path from MUI to a shared mobile design system. Every component built on MUI is a component that cannot be shared or even structurally aligned with a React Native counterpart.

The industry's direction is unmistakable. The **State of React 2025 survey** shows shadcn/ui on the verge of overtaking MUI for the top spot. The winning architectural pattern in 2025/2026 is: **headless primitives (Radix UI, React Aria, or the new Base UI v1.1) + Tailwind CSS + code ownership** (shadcn-style distribution). This pattern is used by OpenAI, Sonos, Vercel, Linear, and Supabase in production.

One important nuance: **MUI X components (Data Grid, Date Pickers) remain best-in-class** for complex data-heavy interfaces. The recommendation is not to abandon MUI wholesale, but to stop building new custom components on MUI's styled foundation. Wrap MUI X components behind your own API where you need their functionality, and build everything else on headless primitives.

A risk worth noting: the **Radix UI team has shifted focus to Base UI** (now under MUI, reached stable v1.1). Since shadcn/ui is built on Radix primitives, this creates a long-term maintenance question. React Aria (Adobe) is the most thoroughly tested alternative headless layer, with strong corporate backing. Teams building for the long term should evaluate React Aria alongside Radix.

## Style Dictionary is correct but the token pipeline is incomplete

Style Dictionary remains the most battle-tested token build tool, now at **v5.4.0** and co-maintained by Tokens Studio. The W3C Design Token Community Group (DTCG) specification reached its **first stable version (2025.10) in October 2025** — this is a landmark that changes the calculus for token management. **Figma announced native DTCG import/export at Schema 2025**, with availability from November 2025. The specification is co-authored by Adobe, Amazon, Google, Microsoft, Meta, Shopify, and Figma, among others. It is now the definitive standard.

The current setup — Style Dictionary outputting plain JSON consumed by web, microfrontends, and legacy monorepo — is **architecturally correct but operationally incomplete** in three ways:

**Mobile's hardcoded token object is the most urgent gap.** React Native requires unitless values (density-independent pixels), which Style Dictionary can generate with platform-specific transforms. The fact that mobile has a localized hardcoded object means every design change requires manual synchronization — a guaranteed source of drift. Style Dictionary v5 can output JS/TS objects formatted specifically for React Native consumption. This is a straightforward pipeline extension, not a redesign.

**Backend email templates hardcoding values is the second gap.** Email templates need inline CSS values, which Style Dictionary can generate as a dedicated platform output. GitHub Primer, for example, generates CSS variables, JS CommonJS modules, and TypeScript typings from the same token source. Adding an email-specific output format (e.g., a JSON map of `token-name → hex-value` for template injection) is minimal effort.

**The token format should migrate to W3C DTCG.** The current plain JSON format works, but the DTCG format (`$value`, `$type`, `$description` notation) is now supported by Style Dictionary v5, Figma natively, and every major design tool. Migrating to DTCG format unlocks better tooling support and future-proofs the token layer. Style Dictionary provides codemods for migration.

The recommended pipeline for 2026: **DTCG JSON in Git (source of truth) → Style Dictionary v5 → CSS custom properties (web), JS/TS objects (React Native), inline values (email), JSON (backend)**. Tokens are authored directly in code — Figma is relegated to a scratchpad for design exploration, not token authoring. Tokens Studio was evaluated and rejected: bidirectional Figma sync adds pipeline complexity for a problem the team doesn't have (no scenario exists where engineers or designers need token changes to flow from Figma into code). Terrazzo is an interesting DTCG-native alternative to Style Dictionary, but its community is much smaller and it's less battle-tested. NativeWind v5 (currently pre-release) is worth monitoring — once stable, it could allow a shared Tailwind `@theme` config to replace Style Dictionary for cross-platform token delivery.

## Storybook stays, but it's not enough for your cross-functional audience

Storybook (now at **v10.x** with Vite-native builds, built-in visual testing, accessibility testing, and MCP server support for AI agents) remains the correct choice for the **engineering audience**. No alternative matches its ecosystem, addon library, and community. Performance concerns from the Webpack era are largely resolved.

However, **Storybook alone is insufficient for a cross-functional design system** serving product managers and designers. The zeroheight Design Systems Report 2025 found that **68% of teams document their design system in multiple places**, and for good reason: Storybook's interface is code-centric and overwhelming for non-technical stakeholders. Product managers need component inventories and usage guidelines, not prop tables. Designers need visual guidelines and Figma-to-code alignment verification, not interactive playgrounds.

The best practice, used by Uber, Decathlon, Shopify, and Atlassian, is a **layered approach**:

- **Storybook** for engineering: component development, interactive testing, visual regression (with Chromatic)
- **Zeroheight or Supernova** for cross-functional documentation: embeds live Storybook stories within a non-technical context, syncs Figma designs, supports no-code editing by designers and PMs, tracks component adoption analytics
- **Chromatic** for visual regression testing and UI review workflows integrated into PRs

Zeroheight (used by Uber, Intuit, The Guardian) is the more focused documentation platform at **~$16–49/editor/month**. Supernova is more ambitious — a full design system operating system with token management, code automation, and AI-powered Portal — but is heavier to adopt. For a team that already has Style Dictionary and Storybook working, **zeroheight is the lower-risk addition** that directly solves the cross-functional visibility gap.

The broader vision described — "design system as one layer within a knowledge framework including business context, UX research, principles, guidelines" — is precisely what zeroheight or Supernova enables. This cannot live in Storybook.

## A unified React + React Native component library is a mirage

This is the most important architectural question, and the evidence is unambiguous: **no large organization ships a single unified component library across React web and React Native.** Not Shopify, not Microsoft, not Meta, not Airbnb, not Salesforce. The styling primitives are fundamentally different (CSS vs ViewStyle/TextStyle), layout models diverge, and platform conventions differ enough that a single codebase produces lowest-common-denominator UX on both platforms.

What successful companies actually do falls into two patterns:

**Pattern B — shared tokens + shared logic + platform-specific components** — is the emerging best practice for teams with a shared codebase. Discord exemplifies this, sharing "nearly all business logic (stores and libraries)" between web (React) and mobile (React Native) while maintaining platform-specific UI. They achieved **40 engineers serving 130M+ users** partly through this strategy. The shared layers are: design tokens, TypeScript types/interfaces, React hooks, API conventions, and testing infrastructure. The platform-specific layers are: component rendering, styling, gestures, navigation, and accessibility implementations.

**Pattern C — shared tokens only, fully independent implementations** — is what most enterprises with dedicated platform teams do. Shopify shares `polaris-tokens` across Polaris (web) and their Restyle-based React Native mobile components. Microsoft shares the Fluent 2 design language and tokens across completely separate `@fluentui/react-components` (web) and `@fluentui/react-native` implementations. Their PRINCIPLES.MD states explicitly: *"Cross-platform consistency is important, but exceptions should be made to account for uniqueness in native platforms — let the platform shine."*

**For your team's size and ambitions, Pattern B is the right target.** Invest in the shared token layer (already underway), align component APIs (naming, props, variants) across platforms, share hooks and business logic, but accept that web and React Native will have separate component implementations. Universal frameworks like Tamagui and NativeWind are viable for smaller teams, and **NativeWind (~403K weekly npm downloads) is now the dominant React Native styling choice** — creating a natural bridge if your web system uses Tailwind. But don't bet on these for enterprise-grade unification.

The separate design system planned for Shopify/showroom surfaces is **architecturally sound**, not fragmentation. Shopify, Microsoft, Google, and Adobe all maintain separate design systems for distinct product surfaces. The critical requirement is that **foundational tokens are shared**. Without shared tokens, separate systems drift apart. With shared tokens, they remain cohesive while serving different interaction paradigms.

## Scoped packages are correct — refine the lifecycle, not the model

Publishing as private scoped npm packages under a namespace remains **industry standard** in 2025/2026, used by `@shopify/polaris`, `@primer/react`, `@carbon/react`, `@atlaskit/*`, and virtually every enterprise design system. The lifecycle stages (stable, under development, experimental, deprecated) are also correct — GitHub Primer uses a nearly identical model (Experimental → Alpha → Beta → Stable → Deprecated).

Three refinements to consider. **First, adopt fixed versioning for the core package set** (components + tokens + icons) and reserve independent versioning for standalone utilities. This eliminates the "which version of @nivoda/button works with @nivoda/tokens?" compatibility problem. IBM Carbon and Storybook both use this approach. **Second, formalize deprecation criteria and timelines** — Procore's model of a two-version deprecation lifecycle with `@deprecated` JSDoc tags and mandatory migration guides is best-in-class. **Third, use Changesets or Nx Release** for automated version management with conventional commits. Both integrate cleanly with Nx.

The `aer-component` staging package for unpublished/experimental components is a reasonable pattern. The key improvement would be making component status visible in both Storybook (status badges) and any cross-functional documentation (zeroheight/Supernova component status tracking).

One emerging signal worth watching: **Shopify deprecated Polaris React in October 2025 and moved to Web Components** for framework-agnostic distribution. This is a long-term consideration, not an immediate action, but it reflects a trend toward framework independence in design system distribution.

## What a VP of Engineering should recommend, in priority order

Given the opportunity to refactor, here is the evidence-based priority stack, ordered by impact-to-effort ratio:

**Priority 1 — Fix the token pipeline (weeks, not months).** Migrate the token format to W3C DTCG. Extend Style Dictionary to output React Native-compatible JS objects and email template values. Eliminate the hardcoded mobile token object and the hardcoded email values. Author tokens directly in DTCG JSON in the repo — code is the source of truth, not Figma. This is the **highest-leverage, lowest-risk change** — it immediately reduces drift across all surfaces and unblocks the cross-platform architecture.

**Priority 2 — Stop building new components on MUI's styled layer.** For any new component work, adopt headless primitives (Radix UI or React Aria) + Tailwind CSS. This aligns the greenfield shadcn/ui work with the platform repo's future direction rather than creating divergence. Existing MUI components don't need immediate migration — wrap them behind your own component API so consumers are insulated from the underlying implementation. Migrate incrementally as components are touched.

**Priority 3 — Add cross-functional documentation.** Deploy zeroheight as the organization-wide design system hub. Embed Storybook stories for interactive demos, sync Figma designs for visual reference, and give product and design teams a no-code editing surface for guidelines, principles, and usage patterns. This directly enables the "knowledge framework" vision.

**Priority 4 — Enforce architectural boundaries in Nx.** Enable `@nx/enforce-module-boundaries` to prevent business logic from leaking into design system packages. Define clear tags for token packages, primitive components, composed components, and application-specific code. This prevents a repeat of the app shell problem.

**Priority 5 — Align the shadcn/ui greenfield with the shared token layer.** The separate codebase is fine architecturally, but it **must consume the same DTCG tokens** via CSS custom properties mapped to Tailwind's theme configuration. This is a configuration exercise, not a redesign. Without this, you're building two visual languages that will inevitably diverge.

**What should stay as-is:** the monorepo structure, Nx orchestration, Storybook for engineering, scoped npm packages with lifecycle stages, and the overall multi-surface strategy. **What should change:** the component foundation (MUI → headless + Tailwind over time), the token format and pipeline coverage, the documentation layer, and the architectural governance enforcement. The existing architecture was well-designed for its era — the task now is evolving it to match where the industry has landed in 2026 without a disruptive rewrite.