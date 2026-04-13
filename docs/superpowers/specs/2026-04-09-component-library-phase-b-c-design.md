# Clarity V2 · Phase B + C · Component library design spec

**Date:** 2026-04-09
**Author:** Chris (CL), with AI assistance
**Status:** Draft — pending review
**Window:** 2 weeks
**Supersedes:** the Phase B definition in `ROADMAP.md` (this spec expands scope and restructures the phase model)

---

## 1. Context and goal

Clarity V2's Phase A shipped a credible foundation: token pipeline, ADRs, platform audit, and a single production Button. The **goal of this sprint** is to turn that foundation into a working library — every component Nivoda needs for most near-term UI, plus the page templates that make them composable — and prove the "design-correct by construction" promise by rebuilding Nivoda's primary revenue surface (the Buyer PLP) using the completed library.

The commercial case and governing model live in `VISION.md`. This spec is the **implementation plan for the build arc that delivers the proof**.

### What "done" looks like at end of sprint

- **42 components** built (28 Phase B + 14 Phase C candidate) and **6 page templates**, each with stories, a colocated README, a Figma link, and a design-match record — 48 items total
- Storybook running locally with a category-based sidebar covering Foundations, seven component categories, Templates, and Docs stubs
- Buyer PLP rebuilt in a demo context using Clarity V2 components, with learnings captured
- All decisions in this spec reflected in `ROADMAP.md` via a small amendment PR

---

## 2. Scope

This spec covers two phases executed in a single 2-week window:

### Phase B — Core Proof (week 1, committed)

Build the **28 core components** that cover forms, actions, overlays, feedback, display, and basic navigation primitives. Core Phase B deliverables are fully specified and non-negotiable.

**No Phase B validation build.** Phase B ends when the 28 components ship. Validation moves to Phase C as a single showpiece rebuild.

### Phase C — Full Library (week 2, candidate + rescope checkpoint)

Build the **14 additional components** and **6 page templates** needed for the full library. This includes two heavy components that live in their own packages (Data Grid, Date Picker). At the **end of week 1** (after Phase B wraps) there is a formal rescope checkpoint: the Phase C component list in this spec is a **candidate**, not a commitment, and will be refined based on what Phase B surfaced.

Phase C ends with the **Buyer PLP rebuild** — Nivoda's primary revenue surface, rebuilt from scratch using the completed Clarity V2 library via Claude Code. This is the proof artefact for the whole sprint.

### Out of scope for this sprint

- Fumadocs documentation site deployment (Phase D)
- Onboarding material for designers/PMs (Phase D)
- Engineering proposal, engineering conversation, migration strategy decision (post-Phase C)
- First non-Chris external builder (Phase D)
- React Native component implementations
- Component-specific token files (stay with semantic tokens only)
- Visual regression testing (deferred, noted as open item for Phase D)
- Any actual platform migration work (Phase E)
- Building anything shadcn/ui already provides — we import and adapt

### Phase model amendment to ROADMAP

Insert a new **Phase C — Full Library** between the current Phase B and Phase C. Rename and shift the existing phases:

| Current ROADMAP | New structure |
|---|---|
| Phase A — Foundation ✅ | Phase A — Foundation ✅ *(unchanged)* |
| Phase B — Proof 🟡 | Phase B — Core Proof 🟡 *(scope reduced to core 28 components + proposal)* |
| — | **Phase C — Full Library (NEW)** — remaining components, heavies, templates, PLP rebuild |
| Phase C — Distribution | Phase D — Distribution *(renamed)* |
| Phase D — Adoption | Phase E — Adoption *(renamed)* |

This amendment lands as a small PR against `ROADMAP.md` alongside this spec.

---

## 3. Component list

### Phase B — 28 core components (committed, dependency-first order)

Ordered so that no component is built before its dependencies. Total: 28 components (1 done, 27 to build).

**Trivials (4)** — Radix primitives or simple Tailwind wrappers, ~3-5 min each:

1. **Separator** — horizontal/vertical rule
2. **Label** — form label with `htmlFor` and accessible contract
3. **Skeleton** — loading placeholder
4. **Badge** — static label chip

**Simples (7)** — single-responsibility components, ~10 min each:

5. **Input** *(depends on Label)* — text input with all HTML types
6. **Textarea** — **distinct shadcn primitive, not a multiline Input variant**
7. **Switch** — binary toggle
8. **Avatar** — image + fallback
9. **Alert** — inline notification with intent
10. **Progress** — linear bar and circular (two variants in one component family)
11. **Chip** — interactive/deletable label

**Mediums — batch 1 (6)** — compound primitives, ~15-25 min each:

12. **Checkbox** *(depends on Label)* — including indeterminate state
13. **Radio Group** *(depends on Label)* — grouped radio buttons
14. **Slider** — single thumb and range
15. **Popover** — foundational overlay primitive (underlies Tooltip, Dropdown Menu, Select's dropdown)
16. **Tooltip** *(depends on Popover)*
17. **Toggle Group** — segmented selection

**Mediums — batch 2 (6)** — overlays and compound inputs:

18. **Dialog** — modal primitive (underlies Sheet)
19. **Sheet** *(depends on Dialog)* — slide-in drawer variant
20. **Dropdown Menu** *(depends on Popover)* — action menu
21. **Select** *(depends on Popover)* — compound combobox
22. **Tabs** — tab navigation
23. **Accordion** — expand/collapse

**Finalisers (4)** — composed-or-special components:

24. **Card** — container surface with header/body/footer slots
25. **Icon Button** *(depends on Button)* — icon-only variant
26. **Breadcrumbs** — hierarchical navigation
27. **Toast** — Sonner-backed notification system

**Already shipped (1):**

28. **Button** *(done — will be retitled in Storybook from `Atoms/Button` to `Actions/Button` as part of the taxonomy switch)*

### Phase C — candidate list (subject to rescope checkpoint at end of week 1)

**14 additional components + 6 page templates.** This list is a working draft; the authoritative version is finalised at the rescope checkpoint based on Phase B learnings.

**Extended form inputs:**
- **Autocomplete / Combobox** *(depends on Popover + Input)*
- **Phone Input** — country code + number (may leverage existing `libphonenumber-js` or similar)
- **File Upload / Dropzone**

**Extended data display:**
- **Table** — semantic HTML primitive with Tailwind styling (non-virtualised)
- **Banner** — page-level alert variant

**Extended navigation:**
- **Link** — styled anchor primitive
- **Menu** — application menu (distinct from Dropdown Menu — likely delete if redundant)
- **Stepper** — multi-step flow indicator
- **Segmented Control** — may collapse into Toggle Group
- **Pagination** — page-number navigation (Button + IconButton composition with logic) — **explicitly included because the PLP validation build depends on it**

**Layout and surfaces:**
- **App Shell** — page chrome template (header + sidebar + content slots)
- **Carousel** — image/content slider

**Heavy components — own packages (2):**

- **Date Picker** — published as `@nivoda/clarity-date-picker`. Single date and range. Depends on `date-fns` or `dayjs`.
- **Data Grid** — published as `@nivoda/clarity-data-grid`. Built on `tanstack-table`. **Scoped for sprint: rendering + sort + selection. Virtualisation and filter deferred to a post-sprint iteration if Data Grid consumes more than 1 day.**

**Page templates (6):**

- **PLP** (Product List Page) — *the Phase C validation target*
- **PDP** (Product Detail Page)
- **Dashboard**
- **Auth** (login / signup / reset)
- **Checkout step**
- **Settings**

Templates live in Storybook under a new **Templates** sidebar section. Empty-states, form layouts, and error-states live **as stories on the components they belong to**, not as a separate category.

### What is explicitly not built (either deferred, duplicated, or obsoleted by Tailwind)

- Data Grid full virtualisation + filter UI (Data Grid itself is in scope, but scoped to render + sort + selection only; virtualisation and filter UI defer to a post-sprint iteration)
- Rich Text Editor
- Charts (future)
- Paper → covered by Card
- Drawer (full-featured) → covered by Sheet
- Divider → covered by Separator
- Banner (as a separate component — may just be an Alert variant depending on Phase C rescope)
- Backdrop → Dialog primitive handles it
- Snackbar → covered by Toast
- Spoiler → Accordion variant
- Typography primitives → Tailwind handles via classes
- Tooltip Icon → Tooltip + Icon composition
- List → semantic HTML with Tailwind
- Status → Badge variant
- Image → `<img>` with utilities
- Icon system → `lucide-react` continues as the icon library
- Box / Stack / Grid / Container / Layout → Tailwind utility classes
- Domain components (Product, Product Media, Price Calculator, Lightbox, Search Filter, Live Chat) — not design system components
- Utility patterns (Infinite Scroll, Overflow Controller) — not primitives
- Country Flags, Zoom Image — domain-specific, deferred

---

## 4. Definition of done (per component)

Every component in both phases must ship with all of the following before it can be marked complete. This matches the current Button's quality bar plus one addition (the colocated README).

1. **Component source file** — `packages/components/src/components/<category>/<name>/<name>.tsx` — clean TypeScript interface, CVA variants where applicable, Radix primitive composition where applicable, accessibility attributes correct.
2. **Stories file** — `packages/components/src/components/<category>/<name>/<name>.stories.tsx` — CSF3, `tags: ["autodocs"]`, one story per variant, one story per state (default / hover / active / focus / disabled / error where applicable), compound variant stories for non-trivial combinations, a Playground story with controls for interactive exploration.
3. **Colocated README** — `packages/components/src/components/<category>/<name>/README.md` — purpose, when to use, when *not* to use, the mental model, a minimal code example, a Figma link, and a design-match record line.
4. **Accessibility verification** — keyboard navigation, ARIA roles, contrast, screen reader behaviour sanity-checked via the Storybook a11y addon. No addon red flags.
5. **Exported from package index** — `packages/components/src/index.ts` includes the new export.
6. **Design-matched** — reviewed by JG in Storybook against the Figma frame, marked with initials and date in the README and plan file.

### README template

```markdown
# Button

Primary interactive surface for user actions. Use for any click that triggers an
action, a navigation, or a form submission.

## When to use
- Primary calls to action on a page (`variant="contained"`)
- Secondary supporting actions (`variant="outlined"`)
- Tertiary or inline actions (`variant="text"`)

## When NOT to use
- For navigation between pages — use `Link` (Phase C)
- For icon-only actions — use `IconButton`

## Mental model
Buttons have two axes: visual style (`variant`) and semantic colour (`intent`).
Most buttons are `primary`. Use `success` / `error` sparingly for high-signal
moments like destructive confirmation.

## Example
​```tsx
import { Button } from "@nivoda/components";

<Button variant="contained" intent="primary" size="md">
  Save changes
</Button>
​```

## Figma
https://figma.com/file/.../Nivoda-Design-System?node-id=...

## Design-match record
- 2026-04-09 · Initial build · CL
- 2026-04-10 · Design-matched · JG
```

---

## 5. Storybook structure

### Sidebar taxonomy

Category-based with Foundations at the top and Templates / Docs slots at the bottom:

```
📐 Foundations
  · Colors
  · Spacing
  · Typography
  · Radius

📝 Forms
  · Input
  · Textarea
  · Select
  · Checkbox
  · Radio Group
  · Switch
  · Slider
  · Label
  · Toggle Group
  · Autocomplete        [Phase C]
  · Phone Input         [Phase C]
  · File Upload         [Phase C]
  · Date Picker         [Phase C — @nivoda/clarity-date-picker]

🔘 Actions
  · Button
  · Icon Button
  · Dropdown Menu
  · Menu                [Phase C]

🪟 Overlays
  · Dialog
  · Sheet
  · Popover
  · Tooltip

💬 Feedback
  · Alert
  · Toast
  · Progress
  · Skeleton
  · Banner              [Phase C]

🖼 Display
  · Card
  · Badge
  · Chip
  · Avatar
  · Separator
  · Table               [Phase C]
  · Data Grid           [Phase C — @nivoda/clarity-data-grid]
  · Carousel            [Phase C]

🧭 Navigation
  · Tabs
  · Accordion
  · Breadcrumbs
  · Link                [Phase C]
  · Stepper             [Phase C]
  · Segmented Control   [Phase C]
  · Pagination          [Phase C]
  · App Shell           [Phase C]

🎨 Templates            [Phase C]
  · Buyer PLP
  · Buyer PDP
  · Dashboard
  · Auth flow
  · Checkout step
  · Settings

📖 Docs                 [Phase D — stubs only in this sprint]
  · Getting started
  · Prompt patterns
  · Migration from MUI
```

### Story pattern

Every component follows the pattern currently used by Button:

- CSF3 format
- `tags: ["autodocs"]`
- `argTypes` mapped to show every variant as a control
- Named exports per meaningful combination — one per variant, one per state, one per compound variant where applicable
- A `Playground` story at the end for interactive exploration

**Minimum story set per component:** Default + every variant + every state (where meaningful) + Playground. Components with compound variants (e.g. Button with intent × variant) also get stories for the most important compounds.

### Package name vs. sidebar

The Storybook sidebar reflects **the consumer view** — organised by function. It does **not** reflect the Nx package structure. Heavy components like Data Grid appear in the Display category alongside lighter components even though they ship from a separate package. The install line in each component's README makes the package boundary explicit when needed.

### Foundations section

Tokens get their own section at the top of the sidebar, populated with:
- Colors (every semantic token rendered as a swatch grid, grouped by palette)
- Spacing (scale steps visualised)
- Typography (every type ramp with live samples)
- Radius (scale values visualised)

These are MDX pages or simple story files pointing at the token outputs in `packages/tokens/dist/web/tokens.css`.

### Templates section

Page templates are stories whose `render` function composes multiple components into a full-page layout. They're not separate components — they're demonstrations of composition. Each template has its own `.stories.tsx` file under `packages/components/src/templates/<name>/<name>.stories.tsx`.

### Docs section

Three MDX stubs in this sprint, content filled in Phase D. The stubs exist so the sidebar structure doesn't look half-built.

---

## 6. Package architecture

### Current state

```
packages/
├── tokens/        → @nivoda/clarity-tokens (CSS + JS + RN + JSON)
├── components/    → @nivoda/components (currently 1 component: Button)
└── test-app/      → private dev sandbox
```

### End-of-sprint state

```
packages/
├── tokens/              → @nivoda/clarity-tokens
├── components/          → @nivoda/components            (40 components: 28 Phase B + 12 Phase C non-heavy + 6 page templates as stories)
├── date-picker/         → @nivoda/clarity-date-picker   (Phase C, heavy, date-fns/dayjs deps)
├── data-grid/           → @nivoda/clarity-data-grid     (Phase C, heavy, tanstack-table deps)
└── test-app/            → private dev sandbox
```

### Rule for "what becomes its own package"

A component gets its own package only when **all three** are true:

1. **Heavy bundle footprint** — adds ≥10-20KB minified or pulls in a large dependency tree
2. **Optional for most consumers** — not needed by the majority of screens
3. **Has deps the core library doesn't already use** — pulls in new libs beyond Radix / CVA / Tailwind / `lucide-react`

Everything else stays as an export from `@nivoda/components`. Tree-shaking handles per-component bundle optimisation for free.

### Consumer import patterns

```tsx
// Core components — one install, many exports
import { Button, Input, Dialog, Checkbox } from "@nivoda/components";

// Heavy components — explicit install, separate import
import { DataGrid } from "@nivoda/clarity-data-grid";
import { DatePicker, DateRangePicker } from "@nivoda/clarity-date-picker";

// Tokens — consumed as CSS variables (already working)
import "@nivoda/clarity-tokens/styles.css";
```

---

## 7. Collaboration model

### Roles

- **Chris (CL)** drives AI construction. Owns the spec, the plan file, and daily AI execution.
- **Joao (JG)** drives visual fidelity. Owns the design-match review pass, direct visual fixes, and token-level adjustments.

### Execution environment

- **Single sprint branch:** `feat/component-library-phase-b-c`
- **Conductor** manages parallel worktrees. CL spins up one worktree per tier or per component batch; multiple subagents build in parallel without stepping on each other. JG has a **persistent Conductor worktree** on the sprint branch for visual fixes — it stays up for the whole sprint, so JG is never blocked by an AI run in progress.
- Every worktree commits to the sprint branch. Conductor handles the underlying `git worktree` mechanics.

### Daily heartbeat

- **End of CL's working day:** push everything the AI built to the sprint branch (matches the review cadence agreement — 10 touchpoints across 2 weeks, one per day).
- **JG's window:** evening or early morning. Pull, open Storybook locally, review the newly-landed components, commit visual fixes, push back.
- **Start of CL's next working day:** pull. Run next AI batch on a clean base that already incorporates JG's overnight fixes.

### Commit rules

| Change type | Handling |
|---|---|
| **Small visual fix** — spacing, hover state, colour nudge, typography weight | JG commits directly to the sprint branch. Commit message format: `style(button): tighten sm padding to match Figma`. No ceremony. |
| **Medium change** — new variant, missed state, prop rename | JG adds a task to the plan file or a GitHub Issue, either JG or CL picks it up. |
| **Structural change** — component restructure, rename, split | Conversation between CL and JG first. Then a decision, then the build. |
| **Token-level fix** — off-by-a-few-percent colour, spacing scale step | JG commits to `packages/tokens/src/...`. The whole library absorbs the fix on the next rebuild. **Highest-leverage move in the system.** |

### Plan file as shared ledger

Every component has a row in the plan file with two status columns:

```
| ID   | Component     | Tier | Deps    | Built by | Design-matched by |
|------|---------------|------|---------|----------|-------------------|
| T001 | Separator     | t1   | —       | CL 04-09 | JG 04-10          |
| T002 | Label         | t1   | —       | CL 04-09 | JG 04-10          |
| T003 | Input         | t1   | Label   | CL 04-09 |                   |
```

CL marks "Built by" when the component ships. JG marks "Design-matched by" after his review pass. Both are visible in every git diff and every PR preview.

### Figma convention

Every component's README ends with:

```markdown
## Figma
https://figma.com/file/.../Nivoda-Design-System?node-id=<frame-id>

## Design-match record
- 2026-04-09 · Initial build · CL
- 2026-04-10 · Design-matched · JG
- 2026-04-12 · Spacing adjustment to match revised Figma frame · JG
```

This creates a bidirectional audit trail between Figma and code. Any future "is this Button right?" question has an auditable answer.

---

## 8. Git hosting and branch strategy

### Dual-push: GitHub + Bitbucket

- **GitHub** is the primary host for the sprint. PRs, Issues, Projects, reviews live here.
- **Bitbucket** stays as a code mirror for continuity and backup.
- Configured via dual-push on a single `origin` remote:

```bash
git remote set-url --add --push origin git@github.com:<your-org>/clarity-v2.git
```

- Every `git push origin <branch>` pushes to both hosts automatically.
- **What mirrors:** commits, branches, tags.
- **What does not mirror:** PR metadata, Issues, Projects, comments, reviews, wikis, webhooks. These live on GitHub only during the sprint.

### Branching

- `main` — stable, matches end-of-previous-sprint
- `feat/component-library-phase-b-c` — the sprint branch, merged to main as a single PR at sprint close
- `feat/comp/<name>` — optional per-component sub-branches, branched off the sprint branch and merged back. Used by Conductor worktrees.

### Post-sprint

At end of the 2-week window:

1. Merge the sprint branch to `main` (single PR review on GitHub)
2. Decide whether to keep dual-push on or remove the GitHub URL and return to Bitbucket-only
3. Update CLAUDE.md, README with the final git host decision
4. Close the GitHub Project board (archive or leave for reference)

---

## 9. Task management

### GitHub Projects + Issues + plan file

**Layers of truth:**

1. **Plan file** (`docs/plans/2026-04-09-component-library-phase-b-c.md`) — authoritative ordering, dependencies, design-match ledger. **Source of truth.** Committed to git.
2. **GitHub Issues** — one issue per component, labelled with tier / phase / status. Generated from the plan file by a bash script (`gh issue create` in a loop).
3. **GitHub Projects board** — kanban view over the issues. Columns: `Todo → In Progress → Ready for Design Review → Design-Matched → Done`. Manual card movement by CL and JG as tasks progress.
4. **Conductor worktrees** — one per component. Branch named `feat/comp/<name>`. Merges close the corresponding issue via `Closes #<n>` in the commit message.

### Task naming

Tasks are numbered `T001..T0NN` in dependency order (see §3). 47 tasks at sprint kickoff — 27 Phase B component builds (Button is already shipped, so 28 Phase B components minus 1 done = 27 new builds) + 14 Phase C candidate components + 6 page templates. The upper bound has headroom for rescope additions. Each task ID maps to:
- A row in the plan file
- A GitHub Issue (title: `T012 · Component · Checkbox`)
- A branch name (`feat/comp/checkbox`)
- A Conductor worktree name

### Automation at sprint kickoff

A one-time bash script creates all GitHub Issues from the plan file, populates the Project board, and labels everything correctly. To be written as part of sprint kickoff, committed as `scripts/sprint-kickoff.sh`.

### Optional: Hamster mirror

If JG wants a dedicated kanban UI, the plan file can be mirrored into Hamster Studio via Hamster's CLI. Git remains source of truth. This is optional and can be decided at sprint kickoff with JG.

---

## 10. Review cadence

**End-of-day review** (matches the decision in the brainstorm).

- 10 touchpoints across the 2-week sprint.
- CL pushes everything built that day.
- JG reviews in Storybook (locally or via a shared deploy if one is up).
- Visual fixes committed directly; larger items added to the plan file or as GitHub Issues.
- Start of next day, CL pulls and continues.

No per-component or per-tier checkpoints. The rhythm is daily, not component-paced.

### What review covers

- **Visual fidelity** — does the rendered component match its Figma frame?
- **Variant coverage** — are all expected variants present? missing anything?
- **State coverage** — are hover, focus, disabled, error states all correct?
- **Accessibility** — Storybook a11y addon red flags
- **API sanity** — does the props interface make sense? is anything missing or oddly named?

---

## 11. Validation build (Phase C)

### The Buyer PLP rebuild

At the end of Phase C (week 2), rebuild Nivoda's **Buyer Product List Page** from scratch using Claude Code + the completed Clarity V2 library. This is the sprint's sole validation build and its showpiece proof artefact.

### Why PLP

- **Primary revenue-driving surface** at Nivoda
- Exercises the **heaviest parts of the library**: Data Grid (or Table), Autocomplete for search, Date Picker for date range filters, Card for grid view, Slider for price range, Checkbox for category filters, Pagination patterns, Skeleton for loading, Breadcrumbs for navigation, Icon Button for toolbar actions
- Stresses **real state management and interaction**, not just static rendering
- If we can rebuild the PLP with Clarity V2, we can rebuild most Nivoda surfaces

### Validation scope

- Pick the exact PLP variant (buyer web, specifically) and get the latest production URL at the start of week 2
- Rebuild **just the page composition, not the data integration** — use realistic mock data, skip the GraphQL wiring
- Goal is design-correct UI, not a shipping feature

### What the validation surfaces

Whatever the rebuild hits — missing components, missing variants, a11y gaps, awkward API contracts, tokens that don't match production values — becomes the direct feedback loop into Phase D scope. Flags go into the plan file as post-sprint TODOs.

### Validation is open-ended

Genuine proof work is inherently unpredictable. If the rebuild reveals the library needs 5 more components, we build 3 and flag 2. If it goes smoothly and takes a day, great. If it takes 3 days, we document the learnings and stop anyway.

---

## 12. Timeline

### Week 1 — Phase B

| Day | Focus | Review |
|---|---|---|
| **D1 AM** | Storybook config refresh: category sidebar, retitle Button `Atoms/Button` → `Actions/Button`, path aliases, globals | Review config |
| **D1 PM** | Trivials (Separator, Label, Skeleton, Badge) + Simples (Input, Textarea, Switch, Avatar, Alert, Progress, Chip) — 11 components | End-of-day review |
| **D2** | Mediums batch 1: Checkbox, Radio Group, Slider, Popover, Tooltip, Toggle Group — 6 components | End-of-day review |
| **D3** | Mediums batch 2: Dialog, Sheet, Dropdown Menu, Select, Tabs, Accordion — 6 components | End-of-day review |
| **D4** | Finalisers: Card, Icon Button, Breadcrumbs, Toast — 4 components. **Phase B components complete (28 total).** | End-of-day review |
| **D5** | ROADMAP amendment PR. **Phase C rescope checkpoint** with JG — refine Phase C component list based on Phase B learnings. | Day of rest from new builds |

### Week 2 — Phase C

| Day | Focus | Review |
|---|---|---|
| **D6** | Phase C mediums: Autocomplete, Phone Input, Table, Banner, Link, Menu, Stepper, Segmented Control, Pagination | End-of-day review |
| **D7** | Phase C extras: File Upload, App Shell, Carousel. Start Date Picker package scaffold | End-of-day review |
| **D8** | Finish Date Picker. Start Data Grid package scaffold. | End-of-day review |
| **D9** | Finish Data Grid (scoped to render + sort + selection; defer filter/virtualisation if squeezed). | End-of-day review |
| **D10** | Page templates: PLP, PDP, Dashboard, Auth, Checkout step, Settings. **Buyer PLP validation rebuild.** Sprint closing review. Final ROADMAP amendment. | Final review + merge |

**D6 ceiling note:** D6 already carries 9 components. If the rescope checkpoint on D5 adds more items, they slot into D7 (reducing the extras budget) or defer to a post-sprint follow-up — D6 is the busiest day and should not be overloaded further.

### Buffer built in

- **Day 5 afternoon** is deliberately empty of new component work. Buffer for slipping Phase B tasks, unexpected a11y issues, or proposal refinement.
- **Data Grid is the biggest scheduling risk** (see §14). If it eats more than 1 day, filter + virtualisation drop to a post-sprint iteration without affecting the sprint close.
- **PLP validation is open-ended** — if it surfaces gaps that need filling, day 10 spills into D11. Not a schedule failure, just an extension.

---

## 13. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **Data Grid eats more than 1 day** | Phase C scope slip or quality drop on other heavies | Scope Data Grid to render + sort + selection for the sprint. Filter and virtualisation become a post-sprint iteration. Scope decision re-confirmed at D8 morning between CL and JG. |
| **Review checkpoints are the human bottleneck** | At AI pace, build waits on JG's review availability | Review cadence is end-of-day specifically to minimise interruption and fit around JG's schedule. If JG can't review one day, it rolls to next morning without blocking the build. |
| **Validation build reveals major gaps** | PLP rebuild hits too many missing components, exercise stops being proof and starts being painful | Accept the learning — a build that surfaces 5 specific gaps is more valuable than no attempt. Feed findings into the rescope checkpoint and Phase D scope. |
| **Token alignment values don't match Figma** | Visual drift between designs and implemented components | JG's token-level fixes propagate to every component immediately. This is the single highest-leverage fix pattern and is explicitly documented in the commit rules. |
| **Joao is unavailable for a stretch** | Design-match column on the plan file falls behind, but build doesn't stop | CL continues building; unreviewed components accumulate in the "Ready for Design Review" column. Catch-up pass when JG returns. Acceptable slack because design-match is orthogonal to build completion. |
| **Agent quality drifts mid-sprint** | A later batch of components is subtly worse than earlier ones — stale conventions, wrong import path, regression on earlier decisions | End-of-day reviews catch this within 1 day. Worst case is half a day of rework. |
| **GitHub Projects setup takes longer than expected** | Task tracker isn't ready on D1 morning | Kickoff script pre-written. If it fails, fall back to plan file checkboxes only. Plan file is always source of truth, so the Project board is optional polish. |
| **Dual-push fails silently** | Bitbucket goes stale without anyone noticing | After initial setup, verify with a test push. Confirm both remotes show the commit. If dual-push breaks mid-sprint, push manually to both and fix the config. |

---

## 14. Rescope checkpoint (end of week 1)

At the end of Phase B (D5 afternoon), CL and JG hold a formal **Phase C rescope checkpoint**. The goal is to refine the Phase C component list based on what Phase B surfaced.

### Inputs to the checkpoint

- The 28 shipped Phase B components in Storybook, design-matched by JG
- Any Phase B learnings (components that were harder than expected, token gaps found, API patterns that didn't feel right)
- The candidate Phase C list from §3

### Decisions to make at the checkpoint

- **Which Phase C components survive?** Some may get dropped, others added based on what the PLP target actually needs.
- **Data Grid scope for the sprint** — render + sort + selection is the committed scope; filter and virtualisation are flexible.
- **Template priorities** — which 6 templates are most valuable? Does PLP stay as the validation target, or does Phase B learnings suggest a different surface?
- **Time allocation** — how much of week 2 is components vs. templates vs. validation rebuild?

### Output of the checkpoint

A short amendment to this spec (checked in as a new commit) that updates §3 with the final Phase C list, adjusts §12 if the day-by-day plan needs changing, and records the rationale.

---

## 15. Open questions (to be resolved during or after sprint)

1. **Which exact buyer PLP variant** do we rebuild in week 2? Decided at start of week 2 with JG input.
2. **`date-fns` or `dayjs`** for Date Picker? Both are viable; pick at D7 start based on bundle size preference and Nivoda platform existing usage.
3. **Banner as distinct component or Alert variant?** Leaning "Alert variant" but confirm at rescope checkpoint.
4. **Menu vs. Dropdown Menu overlap** — do we need both, or does one replace the other? Confirm at rescope checkpoint.
5. **Hamster kanban** — use it or not? JG decides at sprint kickoff.
6. **GitHub Projects custom fields** — what extra metadata on each issue? Tier + Phase + Status minimum. Anything else?
7. **Visual regression testing** — defer to Phase D, but which tool? Playwright vs Lost Pixel vs something else. No sprint decision needed.

---

## 16. Follow-ups and post-sprint TODOs

- **Merge sprint branch to main** via a single GitHub PR with full diff review
- **Remove GitHub push target** (optional) if returning to Bitbucket-only
- **Update CLAUDE.md, README.md** with final git host state
- **Amend ROADMAP.md** to reflect the new phase model (B · Core Proof, C · Full Library, D · Distribution, E · Adoption)
- **Extract generalisable collaboration patterns** into `docs/contributing/collaboration.md` (Figma link convention, plan-file-as-ledger, token-level fix philosophy, daily handoff rhythm). Sprint-specific details stay in this spec as historical record.
- **Pick first non-Chris external builder** for Phase D (designer or PM who wants to try Clarity V2 + AI)
- **Evaluate visual regression tooling** for Phase D
- **Phase D detail planning** — separate spec session

---

## 17. Decision log

All key decisions from the 2026-04-09 brainstorm session, in the order they were made.

1. **Scope expansion** — Phase B list expanded from 15 → 28 components to include load-bearing primitives that the PLP validation would otherwise hit as gaps.
2. **Definition of done** — Button-parity (variants + states + autodocs + TS + a11y) **plus** a colocated README with Figma link and design-match record.
3. **Build ordering** — Dependency-first. No component built before its dependencies.
4. **Task management** — Plan file as source of truth. GitHub Projects + Issues as kanban view. Conductor worktrees for execution. One issue = one component = one worktree = one branch.
5. **Storybook taxonomy** — Category-based sidebar (Forms / Actions / Overlays / Feedback / Display / Navigation) + Foundations at top + Templates and Docs at bottom. Not atomic design, not flat alphabetical, not package-driven.
6. **Phase model amendment** — Insert new Phase C (Full Library) between existing B and C. Shift the previous C and D down one position each.
7. **Package structure** — `@nivoda/components` holds the core library. Heavy components (Data Grid, Date Picker) get their own packages. The rule is: heavy bundle + optional + new deps = own package.
8. **2-week window commitment** — Both Phase B and Phase C delivered in the same 2-week sprint. Phase C scope is a candidate, refined at the D5 rescope checkpoint.
9. **Review cadence** — End-of-day reviews (~10 touchpoints). JG reviews evenings/early mornings. CL pushes at end of working day.
10. **Validation build** — Phase B skipped. Phase C validation = Buyer PLP rebuild with the completed library. Single proof artefact, maximum stakes.
11. **Collaboration model** — CL drives AI construction, JG drives visual fidelity, shared sprint branch, daily handoff rhythm, commit rules by change-size, Figma link + design-match record per component.
12. **Tooling** — Conductor for parallel AI execution via worktrees. Hamster optional for JG kanban preference. Both are additive, not replacements.
13. **Git hosting** — Dual-push to both GitHub and Bitbucket via a single `origin` remote with multiple push URLs. GitHub is primary for PRs/Issues/Projects; Bitbucket is code mirror.
14. **Post-sprint extraction** — Collaboration patterns that survive get extracted into `docs/contributing/collaboration.md` as a follow-up.

---

## 18. References

- `ROADMAP.md` — overall phased roadmap (will be amended by this spec)
- `VISION.md` — commercial case, design triad, governing model
- `CHANGELOG.md` — phase-by-phase progress log
- `docs/architecture/architecture.md` — technical architecture + ADRs 001–004
- `docs/design/token-decisions.md` — 15 token alignment decisions from Phase A
- `packages/tokens/` — token source files and bespoke build script
- `packages/components/src/components/atoms/button/` — the Button component, reference implementation for the per-component definition of done

External:
- https://www.conductor.build — parallel Claude Code worktree manager
- https://tryhamster.com — optional briefs-and-plans collaboration layer
- https://ui.shadcn.com — upstream component implementations
- https://www.radix-ui.com — underlying accessible primitives
