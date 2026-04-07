# Code-first design systems are replacing Figma as source of truth

**Code is now the canonical source of truth for mature design systems, with Figma repositioning as a design context provider rather than the definitive spec.** This shift — accelerated by AI coding tools, the W3C Design Tokens specification reaching v1.0 in October 2025, and the rise of "vibe coding" — represents the most significant structural change in design-engineering collaboration since component libraries emerged. Teams at GitHub, Shopify, eBay, and dozens of headless UI projects have already made the transition, while Figma itself is adapting with Code Connect, MCP servers, and native token interop. The implications touch every layer of design system work: token architecture, documentation, cross-platform consistency, and the very definition of a designer's role.

---

## The code-first movement has clear winners and a playbook

The shift from Figma-as-source-of-truth to code-first design systems is no longer theoretical. **GitHub's Primer design system** states it bluntly in their repository: *"The source of truth is the code, documented on Primer.style."* Designers at GitHub write CSS and contribute production code directly. Figma mirrors what exists in code, never the reverse.

**Shopify Polaris** operates the same way. Their contribution guidelines explicitly prohibit adding components to the Figma UI Kit unless they already exist in Polaris React: *"Our goal is to keep Figma in sync with the code base."* Shopify frames Figma as "a playground for design exploration, rather than a prescriptive or constraining guide." Even with this discipline, Builder.io found that **14% of Shopify's admin UI drifted off the Polaris mainline** after one year — demonstrating that code-first governance requires active enforcement, not just good intentions. Polaris is now evolving toward framework-agnostic Web Components and ships a monorepo containing polaris-react, polaris-tokens, polaris-icons, polaris-for-vscode, and a documentation website.

The headless UI movement represents the purest code-first pattern. **Radix UI** provides unstyled, accessible primitives with no Figma dependency whatsoever — **15k+ GitHub stars and 8 million weekly downloads**. **shadcn/ui**, built on Radix primitives plus Tailwind CSS, exploded to **84k+ GitHub stars** by abandoning the component library model entirely: developers copy-paste source code into their repos, owning it completely. **Chakra UI v3** (2024) split into independent code-first projects: Panda CSS for zero-runtime styling, Zag.js for state machine-driven component logic, and Ark UI for headless components.

Steve Sewell of Builder.io captured the sentiment in a September 2025 article: *"Design systems in Figma are a lie. Pretty, collaborative, and full of backdoors and loopholes."* His company built Fusion, a Figma-like editor that operates directly on production code. Meanwhile, Uber runs CI checks that block merges when design system rules break, and GitHub enforces accessibility and token checks on every pull request.

---

## AI tools are reshaping how components get built

Designer-AI collaboration has moved from experiment to standard practice, anchored by a workflow that connects Figma context to AI code generation. The dominant pattern: a designer copies a Figma component URL into **Cursor IDE**, the **Figma MCP server** fetches component appearance, variables, and styles, and the AI generates production-ready React code. Practitioners report results "nearly identical" to designs after a few iterations.

**Brad Frost** outlined six foundational AI use cases for design systems in early 2024: component code generation (**40–90% faster** than manual), cross-framework translation, platform-specific conventions, unit test generation, accessibility review, and documentation authoring. He characterizes AI as "a smart-but-sometimes-unsophisticated junior developer" — all output requires human review.

The tool landscape has stratified by use case:

- **Cursor IDE** dominates as the AI-powered editor for design engineers, surpassing **$500M ARR**. Its Visual Editor (December 2025) enables "point and prompt" UI editing, and Background Agents manage multiple autonomous coding streams
- **Claude Code** operates as a CLI agent for pair-programming, with designers building entire component libraries through conversational prompts. One practitioner built **42+ components** with Claude using atomic design methodology
- **v0 by Vercel** generates production React components from prompts or Figma imports, using shadcn/ui and Tailwind. It now supports custom design system registries and token configuration
- **Figma MCP Server** pipes design context — components, styles, variables, Code Connect mappings — directly into Cursor, Claude Code, VS Code Copilot, and Windsurf. Affirm reported it "speeds up development velocity by orders of magnitude"

The critical insight from practitioners is that **design tokens are the guaranteed point of influence over AI-generated code**. Romina Kavcic's research demonstrates that even when AI skips a component library, every visual property resolves to a token value. Semantic tokens with descriptive intent — `color-feedback-error` rather than `blue-5` — dramatically improve AI output quality. Teams now add `description` fields to token JSON and create companion context files that load alongside token data for AI consumption.

**Context engineering** has emerged as the successor to prompt engineering. Teams build `.cursor/rules/*.mdc` files with project-specific coding conventions, maintain markdown documentation explicitly formatted for AI consumption (component usage guidelines, spacing token rules, accessibility requirements), and create reusable prompt libraries for token validation, accessibility audits, and documentation generation. Anthropic's framework separates context into four layers: Instruction, Knowledge, State, and Task.

Despite the momentum, challenges remain significant. **Security vulnerabilities appear in 40–45% of AI-generated code**. Long chat sessions cause context degradation. Median PR size increased **33%** in 2025, and incidents per PR rose **23.5%**. Trust remains low: nearly half of developers actively distrust AI-generated outputs, up from 31% in 2024. Supernova's 2024 report found **53% of organizations have no immediate plans to integrate AI** into their design systems.

---

## The W3C token spec changes everything for multi-platform systems

The **W3C Design Tokens Community Group released its first stable specification (2025.10) on October 28, 2025** — the single most consequential infrastructure development for code-first design systems. This vendor-neutral format, backed by Adobe, Amazon, Google, Microsoft, Meta, Figma, Shopify, Salesforce, and dozens more, creates genuine interoperability between design tools and code platforms for the first time.

**Style Dictionary remains the dominant token transformation engine**, now at v5.4.0 (March 2026). Originally created by Amazon, it's been co-maintained by Tokens Studio since August 2023. The v4 rewrite introduced ESM-only architecture and first-class DTCG format support; v5 focuses on performance with internal Map-based token structures and native TypeScript file support. Full DTCG 2025.10 compliance is a work-in-progress but functional for most use cases.

The alternatives have carved distinct niches. **Terrazzo** (formerly Cobalt UI) is built ground-up for the DTCG format and serves as one of three official reference implementations. It's lighter-weight than Style Dictionary but less mature, with **364 GitHub stars**. **Tokens Studio** evolved from a Figma plugin into a full platform with a visual Graph Engine for design system logic, CI/CD pipeline integration, and multi-tool export. It now integrates with Figma, Penpot, Framer, and even Microsoft Office applications.

**Tailwind CSS v4** introduced a fundamentally new token approach: the `@theme` directive defines all design decisions in CSS, generating utility classes automatically from CSS custom properties. This is **5x faster for full builds and 100x faster incrementally** versus v3, but tokens are CSS-native and don't directly export to iOS or Android. **Panda CSS** embeds tokens in its configuration with a `{ value: '...' }` object structure forward-compatible with DTCG, but it's web-only and lacks native cross-platform export.

For cross-platform systems spanning React and React Native, the recommended architecture uses a **three-layer token system**: primitive tokens (raw values), semantic tokens (purpose-driven aliases), and component tokens (component-specific bindings). Style Dictionary handles platform transformations — stripping `px` units for React Native, decomposing composite shadow tokens into platform-specific properties, and converting color formats. **NativeWind v5**, aligning with Tailwind v4's `@theme` directive, enables teams to use the same utility class names and token definitions across web and React Native:

```css
/* Shared token definition */
:root { --color-background: 255 255 255; }
```
```jsx
/* Works identically on web and React Native */
<View className="bg-background p-4">...</View>
```

**Design token adoption jumped from 56% to 84% in a single year** (2024 to 2025, per zeroheight's report) — mass adoption is achieved. Figma announced native import/export of variables aligned with the W3C 1.0 spec, available November 2026, which will close the last major interoperability gap.

> **Note:** Nivoda chose a bespoke build script over Style Dictionary for its token pipeline. See architecture.md ADR-001 for rationale.

---

## Designers are learning to code, and the role is splitting

The "design engineer" hybrid role has become the organizational answer to code-first design systems. **Vercel** treats Design Engineer as a first-class position with compensation exceeding **$200K**. **Resend** (22 people) makes no distinction: "Every designer is a design engineer." **Linear's** CEO states plainly: *"I am not interested in preserving a romantic separation between 'design' and 'engineering.'"*

The tools enabling this convergence center on **Cursor IDE**, which designers describe as the bridge into technical work. Felix Lee, a designer with no prior development experience, built a complete portfolio site using Claude Code and Cursor. Hardik Pandya (Atlassian) spent 60+ hours "vibe coding" and identified model-specific strengths: Claude excels at reasoning and aesthetics, GPT at precise execution, and Gemini at creative exploration.

The learning curve is real but documented. Diana Wolosin, a design system designer, identified **10 major pitfalls** from vibe coding with Cursor: AI "people-pleasing" (agreeing but delivering wrong solutions), hard-coded shortcuts creating unmaintainable code, layout fragility from accumulated patches, and dependency overload. She spent $30 in API calls and two weeks parsing 70+ components, at one point generating "nearly 7,000 lines of hard-coded garbage." Her conclusion: *"Developers remain essential partners because they safeguard best practices."*

Builder.io's structured tutorial series recommends three operating modes for designers in Cursor: vibe coding for rapid mockups, repo-based work for shipping production code, and Figma-to-code translation for reducing handoff. Key VS Code/Cursor extensions for design work include **Tailwind CSS IntelliSense** (autocomplete and hover previews), **Story Explorer** (live Storybook previews in-editor), **GitLens** (codebase history), and Shopify's own **polaris-for-vscode**.

Designers contribute to code-first systems through token management (via Tokens Studio), Storybook story authoring, documentation in MDX files, PR reviews for visual fidelity, and increasingly direct commits. Builder.io reports that product designers, product managers, and even support team members at their company ship features through their visual IDE, with developers reviewing PRs requiring "nearly zero code refactoring."

---

## Figma is being enhanced, not deprecated

Figma's response to code-first trends has been strategic repositioning rather than retreat. Three investments define its 2024–2026 trajectory.

**Code Connect** bridges Figma components to production code by surfacing real, maintained code snippets in Dev Mode instead of auto-generated approximations. It supports React, React Native, SwiftUI, Jetpack Compose, HTML, and Web Components. Jake Albaugh (Figma Developer Advocate) explains the philosophy: *"With Code Connect, we can actually move the design and the code a little bit further apart again"* — meaning designs and code can differ structurally while maintaining reliable connections. Teams at **Bumble, GitHub, and HP** are early adopters.

**The Figma MCP Server** (beta 2025) makes Figma a two-way context provider for AI development. It reads components, variables, and layout data from Figma and pipes them into Cursor, Claude Code, VS Code, and other tools. Newer capabilities include writing to canvas (AI agents creating Figma content) and capturing live web UIs as editable design layers. Coinbase uses it for complex user flows.

**Figma Variables** now support composite and array types, expression-based conditional logic (`if(is-dark, #FFF, #111)`), extended multi-brand collections, and code syntax display. At **Schema 2025**, Figma announced Slots (custom layers within component instances), a design linter matching raw values to variables, and the W3C-aligned token import/export.

The practical consensus: Figma serves as exploration and ideation tool, prototyping environment, design context provider via MCP, documentation surface via Code Connect, token authoring interface via Variables, and visual QA platform via linting. zeroheight's 2026 report noted a handful of teams moving from Figma to "non-artefact based tools like Cursor, Claude Code, and Dessign," but full deprecation remains rare. The trend is **Figma as design intelligence layer** feeding code-first systems, not Figma as the system itself.

---

## Documentation lives in code now, with Storybook at the center

**Storybook remains the undisputed standard for component documentation**, now at version 10 (March 2026). Version 9 (June 2025) introduced batteries-included testing via Vitest partnership, while the latest releases add **MCP servers that expose validated component patterns to AI coding agents** — making Storybook a machine-readable design system resource, not just a human one.

The mature code-first documentation stack works in layers. Design tokens defined in JSON flow through Style Dictionary or Terrazzo into CSS custom properties, Tailwind config, and native platform values. Components consume those tokens and are developed in Storybook with interactive stories, auto-generated controls, and MDX-based usage guidelines. Documentation sites — whether custom-built (Shopify Polaris, GitHub Primer) or platform-hosted (**zeroheight**, **Supernova**) — embed live Storybook stories alongside token tables, accessibility guidelines, and code snippets.

zeroheight won Design System Awards 2025 and integrates directly with Figma and Storybook for a unified documentation experience. Supernova excels at automation: its CLI keeps "documentation, code, and Figma always in sync all the time without us doing anything." A case study from Mews showed table components that previously took **3–4 weeks** to implement now require "just a couple of days" with Supernova's pipeline.

> **Note:** Nivoda chose Fumadocs rather than zeroheight or Supernova as its documentation platform. See architecture.md ADR-004 for rationale.

The "no handoff" movement is gaining ground with hard economics behind it. Builder.io's research found **66% of teams waste 25–50% of their time on design-delivery inefficiencies**, with an estimated **$298,000 annual productivity loss per product pod** from handoff friction. Modern alternatives include Figma Dev Mode for native CSS/iOS/Android values, design tokens as the single spec (eliminating manual value copying), Storybook as living specification, and AI-powered code generation from design context.

---

## Conclusion

The design system landscape in 2025–2026 is defined by three converging forces. First, **code as source of truth is now standard practice** at scale, with Figma explicitly repositioned as exploration and context tool rather than canonical specification. Second, **the W3C Design Tokens spec (2025.10) and Style Dictionary v5** provide the infrastructure for truly portable, multi-platform token systems — adoption jumped to 84% in one year. Third, **AI tools (Cursor, Claude Code, Figma MCP) are collapsing the designer-developer handoff** into a single workflow where design intent flows directly into production code.

The teams seeing the most success share common patterns: tokens defined in code and synced to Figma (not the reverse), Storybook as living documentation with MCP exposure for AI agents, three-layer token architecture for cross-platform consistency, and design engineers who move fluidly between visual and code tools. The learning curve for designers is real — vibe coding produces garbage without engineering guardrails — but the trajectory is clear. The question is no longer whether to adopt code-first design systems, but how fast your token pipeline, documentation stack, and team structure can adapt to a world where the component in your IDE is the only artifact that matters.