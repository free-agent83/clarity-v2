# Marketing chrome audit — editorial guidelines vs Clarity docs

Side-by-side audit of **marketing/editorial chrome** (backgrounds, typography fabric, tables, radius, links, layout shell) — **not** Clarity UI components (`Button`, etc.).

**Reference:** [`brand-system/guidelines/editorial-guidelines.html`](../../../brand-system/guidelines/editorial-guidelines.html)  
**Compared to:** `apps/docs/` (Fumadocs + docs CSS overrides)  
**Related:** [`brand-token-gaps.md`](./brand-token-gaps.md) for hex values pending tokenization.

---

## How to use this document

1. **Jump to an item** — use the table of contents links below, or search for an ID (e.g. `MKT-014`).
2. **Discuss in chat** — cite the ID: *"On MKT-014, should first-column colour apply in dark mode too?"*
3. **Comment inline** — add notes under **Discussion** or tick **Decision** on any item block.
4. **Scope a PR** — group IDs into a change set (e.g. "table fabric: MKT-014–MKT-021").

**Status key:** `aligned` · `partial` · `gap` · `structural` (different model, not a tweak)

---

## Table of contents

### 1. Page canvas & theme
- [MKT-001 — Default theme mode](#mkt-001--default-theme-mode)
- [MKT-002 — Warm page background](#mkt-002--warm-page-background)
- [MKT-003 — Dark sections vs global dark](#mkt-003--dark-sections-vs-global-dark)
- [MKT-004 — Content max width](#mkt-004--content-max-width)
- [MKT-005 — Section rhythm & dividers](#mkt-005--section-rhythm--dividers)

### 2. Chrome (navigation shell)
- [MKT-006 — Nav model (top bar vs sidebar)](#mkt-006--nav-model-top-bar-vs-sidebar)
- [MKT-007 — Nav typography](#mkt-007--nav-typography)
- [MKT-008 — Nav link colours](#mkt-008--nav-link-colours)
- [MKT-009 — Brand mark in chrome](#mkt-009--brand-mark-in-chrome)
- [MKT-010 — Chrome vs content contrast](#mkt-010--chrome-vs-content-contrast)

### 3. Typography fabric
- [MKT-011 — Paragraph body colour](#mkt-011--paragraph-body-colour)
- [MKT-012 — Heading colour (light)](#mkt-012--heading-colour-light)
- [MKT-013 — Section h2 scale](#mkt-013--section-h2-scale)
- [MKT-014 — Page / hero title scale](#mkt-014--page--hero-title-scale)
- [MKT-015 — Lede / intro paragraph](#mkt-015--lede--intro-paragraph)
- [MKT-016 — Mono labels (eyebrow, kickers, TOC)](#mkt-016--mono-labels-eyebrow-kickers-toc)
- [MKT-017 — Strong / emphasis hierarchy](#mkt-017--strong--emphasis-hierarchy)

### 4. Tables
- [MKT-018 — Table surface (white on warm)](#mkt-018--table-surface-white-on-warm)
- [MKT-019 — Table outer radius](#mkt-019--table-outer-radius)
- [MKT-020 — Table border](#mkt-020--table-border)
- [MKT-021 — Table header cells](#mkt-021--table-header-cells)
- [MKT-022 — Table body cell colour](#mkt-022--table-body-cell-colour)
- [MKT-023 — Table first-column emphasis](#mkt-023--table-first-column-emphasis)
- [MKT-024 — Table cell padding & row dividers](#mkt-024--table-cell-padding--row-dividers)
- [MKT-025 — Dark-mode tables](#mkt-025--dark-mode-tables)

### 5. Corner radius
- [MKT-026 — Cards & content blocks (2px)](#mkt-026--cards--content-blocks-2px)
- [MKT-027 — Content tables (4px)](#mkt-027--content-tables-4px)
- [MKT-028 — Inline code radius](#mkt-028--inline-code-radius)
- [MKT-029 — Code blocks](#mkt-029--code-blocks)
- [MKT-030 — Product radius scale vs editorial](#mkt-030--product-radius-scale-vs-editorial)

### 6. Surfaces & elevation
- [MKT-031 — White cards on warm canvas](#mkt-031--white-cards-on-warm-canvas)
- [MKT-032 — Do / Don't blocks](#mkt-032--do--dont-blocks)
- [MKT-033 — Interactive demo wells](#mkt-033--interactive-demo-wells)
- [MKT-034 — Footer prev/next cards](#mkt-034--footer-prevnext-cards)

### 7. Inline code
- [MKT-035 — Inline code background](#mkt-035--inline-code-background)
- [MKT-036 — Inline code text colour](#mkt-036--inline-code-text-colour)
- [MKT-037 — Inline code font size](#mkt-037--inline-code-font-size)

### 8. Links in prose
- [MKT-038 — Link resting colour](#mkt-038--link-resting-colour)
- [MKT-039 — Link hover colour](#mkt-039--link-hover-colour)
- [MKT-040 — Link underline treatment](#mkt-040--link-underline-treatment)

### 9. Editorial-only fabric
- [MKT-041 — Eyebrow violet hairlines](#mkt-041--eyebrow-violet-hairlines)
- [MKT-042 — Card kicker hairlines](#mkt-042--card-kicker-hairlines)
- [MKT-043 — Section border-bottom dividers](#mkt-043--section-border-bottom-dividers)

### 10. Already aligned
- [MKT-044 — Warm background (light mode)](#mkt-044--warm-background-light-mode)
- [MKT-045 — Font stack](#mkt-045--font-stack)
- [MKT-046 — Violet accent](#mkt-046--violet-accent)
- [MKT-047 — Mono uppercase label intent](#mkt-047--mono-uppercase-label-intent)
- [MKT-048 — Dark palette family](#mkt-048--dark-palette-family)

### 11. Token backlog (summary)
- [MKT-Tokens — Proposed marketing tokens](#mkt-tokens--proposed-marketing-tokens)

---

## 1. Page canvas & theme

### MKT-001 — Default theme mode

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Behaviour** | Always light (`body` on warm canvas) | Dark by default (`RootProvider` in `layout.tsx`) |
| **Status** | `structural` | |

**Gap:** Different baseline experience before any content styling.

**Discussion:**

**Decision:** ☐ Align docs to light default ☐ Keep dark default ☐ Defer

---

### MKT-002 — Warm page background

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | `#f5f0ec` on `body` | `#f5f0ec` on `#nd-docs-layout` (light only) |
| **Staging** | — | `--color-docs-content-background` |
| **Status** | `partial` | |

**Gap:** Hex matches in light mode; not tokenized. Dark mode uses `--background` (stone-950), not warm.

**Token candidate:** `color.semantic.background.warm` — see [brand-token-gaps.md](./brand-token-gaps.md).

**Discussion:**

**Decision:** ☐ Tokenize ☐ Docs-only staging OK ☐ Defer

---

### MKT-003 — Dark sections vs global dark

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Behaviour** | Full-bleed `.dark` bands inside one light page | Global `.dark` on entire app via theme toggle |
| **Status** | `structural` | |

**Gap:** Editorial mixes light page + dark sections; docs switch the whole shell.

**Discussion:**

**Decision:** ☐ Add section dark bands to docs ☐ Global toggle only ☐ N/A

---

### MKT-004 — Content max width

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | `.page` max **1200px**, horizontal pad **64px** | Article prose ~**900px** (Fumadocs default) |
| **Status** | `gap` | |

**Gap:** Docs content column is narrower than editorial page grid.

**Discussion:**

**Decision:** ☐ Widen to 1200px ☐ Keep 900px ☐ Defer

---

### MKT-005 — Section rhythm & dividers

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | **128px** vertical section padding; **1px stone-200** section dividers | Fumadocs prose spacing; no editorial section cadence |
| **Status** | `gap` | |

**Gap:** No equivalent vertical rhythm or inter-section hairlines on docs pages.

**Discussion:**

**Decision:** ☐ Match editorial rhythm ☐ Keep Fumadocs rhythm ☐ Defer

---

## 2. Chrome (navigation shell)

### MKT-006 — Nav model (top bar vs sidebar)

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Pattern** | Sticky **top bar**, stone-950 | **Left sidebar** + right **TOC** (Fumadocs) |
| **Status** | `structural` | |

**Gap:** Editorial spec is dark chrome + warm content; Fumadocs is app shell layout.

**Discussion:**

**Decision:** ☐ Redesign docs chrome ☐ Accept Fumadocs shell ☐ Hybrid

---

### MKT-007 — Nav typography

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | JetBrains Mono **12px**, uppercase, **0.1em** tracking | Sidebar: Fumadocs/Inter defaults; TOC title: mono **12px**, **0.05em** |
| **Status** | `gap` | |

**Discussion:**

**Decision:** ☐ Match 0.1em / 12px ☐ Keep current ☐ Defer

---

### MKT-008 — Nav link colours

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | stone-400 → stone-50 on hover | Sidebar hover: violet text, no fill (`docs-layout.css`) |
| **Status** | `gap` | |

**Discussion:**

**Decision:** ☐ Editorial stone hover ☐ Violet hover ☐ Defer

---

### MKT-009 — Brand mark in chrome

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | Serif “Nivoda” wordmark in dark nav | Custom sidebar brand components |
| **Status** | `partial` | |

**Discussion:**

**Decision:** ☐ Align wordmark treatment ☐ Keep docs brand ☐ Defer

---

### MKT-010 — Chrome vs content contrast

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Pattern** | Dark bar on warm page | Sidebar/TOC use `--card` / fd surfaces |
| **Status** | `structural` | |

**Discussion:**

**Decision:** ☐ Dark chrome on warm content ☐ Current card shell ☐ Defer

---

## 3. Typography fabric

### MKT-011 — Paragraph body colour

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | **stone-600** `#57534e` on `p` | **`--foreground`** ≈ stone-950 on `.prose` |
| **Status** | `gap` | |

**Gap:** Docs body reads noticeably darker than editorial. High-impact readability difference.

**Token candidate:** `color.semantic.foreground.body` or editorial `text.body` → stone-600.

**Discussion:**

**Decision:** ☐ Use stone-600 for prose paragraphs ☐ Keep foreground ☐ Defer

---

### MKT-012 — Heading colour (light)

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | stone-950 | `--foreground` (stone-950) |
| **Status** | `aligned` | |

**Discussion:**

**Decision:** ☐ No change

---

### MKT-013 — Section h2 scale

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | Nanum **56px**, −0.02em tracking | Nanum **`--font-size-4xl` (36px)** — editorial h3 scale |
| **Status** | `gap` | |

**Discussion:**

**Decision:** ☐ Match 56px ☐ Keep 36px ☐ Defer

---

### MKT-014 — Page / hero title scale

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | `.hero-title` **96px** | `DocsTitle` inline **64px** |
| **Status** | `partial` | |

**Discussion:**

**Decision:** ☐ Match 96px ☐ Keep 64px ☐ Defer

---

### MKT-015 — Lede / intro paragraph

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | **22px**, stone-600, max-width 800px (`.lede`) | `DocsDescription` — Fumadocs default |
| **Status** | `gap` | |

**Discussion:**

**Decision:** ☐ Add lede styling ☐ Keep description default ☐ Defer

---

### MKT-016 — Mono labels (eyebrow, kickers, TOC)

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | **14px**, **0.12em** tracking, stone-500 | TOC + table headers: **12px**, **0.05em**, `--muted-foreground` |
| **Status** | `gap` | |

**Discussion:**

**Decision:** ☐ Match 14px / 0.12em ☐ Keep 12px / 0.05em ☐ Defer

---

### MKT-017 — Strong / emphasis hierarchy

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | `strong` → stone-950, weight 500 | Prose defaults |
| **Status** | `partial` | |

**Discussion:**

**Decision:** ☐ Match editorial strong ☐ Keep prose default ☐ Defer

---

## 4. Tables

### MKT-018 — Table surface (white on warm)

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | **`#ffffff`** table bg on warm canvas | No white surface — inherits warm page / Fumadocs prose |
| **Status** | `gap` | |

**Token candidate:** `surface.elevated` or `surface.table`.

**Discussion:**

**Decision:** ☐ White table cards ☐ Transparent on warm ☐ Defer

---

### MKT-019 — Table outer radius

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | **4px** + `overflow: hidden` | No override (~0) |
| **Status** | `gap` | |

**Token candidate:** `radius.table` → 4px.

**Discussion:**

**Decision:** ☐ Apply 4px ☐ Keep square ☐ Defer

---

### MKT-020 — Table border

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | **1px stone-200** | Fumadocs/neutral prose borders |
| **Status** | `gap` | |

**Discussion:**

**Decision:** ☐ stone-200 border ☐ Keep Fumadocs ☐ Defer

---

### MKT-021 — Table header cells

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | Mono 12px, **0.12em**, stone-500, semi-white header bg | Mono 12px, **0.05em**, `--muted-foreground` (th only) |
| **Status** | `gap` | |

**Discussion:**

**Decision:** ☐ Match editorial headers ☐ Keep current th styling ☐ Defer

---

### MKT-022 — Table body cell colour

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | **stone-600** | **`--foreground`** (stone-950) |
| **Status** | `gap` | |

**Discussion:**

**Decision:** ☐ stone-600 cells ☐ Keep foreground ☐ Defer

---

### MKT-023 — Table first-column emphasis

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | First `td`: **stone-700** | No first-column rule |
| **Status** | `gap` | |

**Discussion:**

**Decision:** ☐ Add first-col rule ☐ Skip ☐ Defer

---

### MKT-024 — Table cell padding & row dividers

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | th 12×16, td 14×16; row borders rgba black **6%** | Fumadocs defaults |
| **Status** | `gap` | |

**Discussion:**

**Decision:** ☐ Match padding/dividers ☐ Keep defaults ☐ Defer

---

### MKT-025 — Dark-mode tables

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | rgba white **6%** surface; stone-400 body; stone-300 first col | Dark prose / Fumadocs defaults |
| **Status** | `gap` | |

**Discussion:**

**Decision:** ☐ Match editorial dark tables ☐ Keep dark prose ☐ Defer

---

## 5. Corner radius

### MKT-026 — Cards & content blocks (2px)

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | **2px** (`.card`, demos, swatches) | Product `--radius` **10px**; cards use product scale |
| **Status** | `gap` | |

**Token candidate:** `radius.content` → 2px.

**Discussion:**

**Decision:** ☐ Editorial 2px on docs content ☐ Product radius ☐ Defer

---

### MKT-027 — Content tables (4px)

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | **4px** on `table:not(.compact-table)` | Not applied — see [MKT-019](#mkt-019--table-outer-radius) |
| **Status** | `gap` | |

**Discussion:**

**Decision:** _(see MKT-019)_

---

### MKT-028 — Inline code radius

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | **2px** | `calc(var(--radius) - 4px)` ≈ **6px** |
| **Status** | `gap` | |

**Discussion:**

**Decision:** ☐ 2px ☐ Keep ~6px ☐ Defer

---

### MKT-029 — Code blocks

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | N/A in editorial CSS | Fumadocs `rounded-xl` (~12px) |
| **Status** | `partial` | |

**Discussion:**

**Decision:** ☐ Editorial radius on code blocks ☐ Keep xl ☐ Defer

---

### MKT-030 — Product radius scale vs editorial

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | 2px content / 4px tables / 999px editorial mock buttons | `radius.tokens.json` starts at **4px (`sm`)**; base `--radius` **10px** |
| **Status** | `gap` | |

**Gap:** Editorial **2px** is below current product radius scale.

**Discussion:**

**Decision:** ☐ Extend token scale for marketing ☐ Map editorial to nearest product token ☐ Defer

---

## 6. Surfaces & elevation

### MKT-031 — White cards on warm canvas

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Pattern** | White `#ffffff` + stone-200 border + 2px radius + 40px pad | Article text sits **directly on warm bg** |
| **Status** | `gap` | |

**Discussion:**

**Decision:** ☐ Wrap prose in white card ☐ Warm field only ☐ Defer

---

### MKT-032 — Do / Don't blocks

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Pattern** | Tinted fills, 2px radius, coloured top border | Not present |
| **Status** | `gap` | |

**Discussion:**

**Decision:** ☐ Add MDX/component pattern ☐ N/A ☐ Defer

---

### MKT-033 — Interactive demo wells

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Pattern** | rgba white 70% or stone-950 wells, 2px radius | Not present |
| **Status** | `gap` | |

**Discussion:**

**Decision:** ☐ Add demo wells ☐ N/A ☐ Defer

---

### MKT-034 — Footer prev/next cards

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Pattern** | N/A | Uses `--card` surface (`docs-layout.css`) |
| **Status** | `partial` | |

**Discussion:**

**Decision:** ☐ Match editorial elevation ☐ Keep card footer ☐ Defer

---

## 7. Inline code

### MKT-035 — Inline code background

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | stone-100 | `--muted` (≈ stone-100) |
| **Status** | `aligned` | |

**Discussion:**

**Decision:** ☐ No change

---

### MKT-036 — Inline code text colour

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | **stone-700** | **`--muted-foreground`** (runtime ≈ stone-500) |
| **Status** | `gap` | |

**Discussion:**

**Decision:** ☐ stone-700 ☐ Keep muted-foreground ☐ Defer

---

### MKT-037 — Inline code font size

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | **14px** fixed | **0.875em** of body |
| **Status** | `partial` | |

**Discussion:**

**Decision:** ☐ 14px fixed ☐ Keep em-based ☐ Defer

---

## 8. Links in prose

### MKT-038 — Link resting colour

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | **stone-600** (light) / stone-300 (dark) — text colour | Foreground text; **violet underline** at rest |
| **Status** | `gap` | |

**Discussion:**

**Decision:** ☐ Neutral link text ☐ Violet underline (current) ☐ Defer

---

### MKT-039 — Link hover colour

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | **violet-600** / violet-400 | Product / Fumadocs hover |
| **Status** | `partial` | |

**Discussion:**

**Decision:** ☐ Match editorial hover ☐ Keep current ☐ Defer

---

### MKT-040 — Link underline treatment

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Value** | 1px underline, 3px offset | 1px underline, violet `--color-fd-primary` |
| **Status** | `gap` | |

**Discussion:**

**Decision:** ☐ stone underline at rest ☐ Violet underline ☐ Defer

---

## 9. Editorial-only fabric

### MKT-041 — Eyebrow violet hairlines

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Pattern** | 96px violet line after `.eyebrow` | Not present |
| **Status** | `gap` | |

**Discussion:**

**Decision:** ☐ Add to docs section headers ☐ N/A ☐ Defer

---

### MKT-042 — Card kicker hairlines

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Pattern** | 32px violet line after card kickers | Not present |
| **Status** | `gap` | |

**Discussion:**

**Decision:** ☐ Add ☐ N/A ☐ Defer

---

### MKT-043 — Section border-bottom dividers

| | Editorial guidelines | Clarity docs |
|---|---|---|
| **Pattern** | stone-200 / stone-800 between sections | Not present |
| **Status** | `gap` | |

**Discussion:**

**Decision:** ☐ Add ☐ N/A ☐ Defer

---

## 10. Already aligned

### MKT-044 — Warm background (light mode)

Light-mode `#nd-docs-layout` uses `#f5f0ec` — matches editorial `body`. Pending formal token.

**Discussion:**

**Decision:** ☐ Tokenize only

---

### MKT-045 — Font stack

Inter + JetBrains Mono + Nanum Myeongjo on both surfaces.

**Discussion:**

**Decision:** ☐ No change

---

### MKT-046 — Violet accent

Editorial violet-600/400; docs via `--color-fd-primary`.

**Discussion:**

**Decision:** ☐ No change

---

### MKT-047 — Mono uppercase label intent

TOC title and table headers follow mono uppercase label pattern (scale/tracking differ — see MKT-016).

**Discussion:**

**Decision:** ☐ Scale only (MKT-016)

---

### MKT-048 — Dark palette family

Dark mode uses stone-950 family via Clarity dark theme.

**Discussion:**

**Decision:** ☐ No change

---

## MKT-Tokens — Proposed marketing tokens

Consolidated backlog from this audit. Cross-ref [brand-token-gaps.md](./brand-token-gaps.md).

| ID | Proposed token | Editorial value | Notes |
|---|---|---|---|
| T-01 | `color.semantic.background.warm` | `#f5f0ec` | [MKT-002](./brand-token-gaps.md) — staged |
| T-02 | `color.semantic.foreground.body` | stone-600 | [MKT-011](#mkt-011--paragraph-body-colour) |
| T-03 | `typography.lede` | 22px / stone-600 | [MKT-015](#mkt-015--lede--intro-paragraph) |
| T-04 | `typography.label.mono` | 14px / 0.12em / stone-500 | [MKT-016](#mkt-016--mono-labels-eyebrow-kickers-toc) |
| T-05 | `color.semantic.surface.elevated` | `#ffffff` on warm | [MKT-018](#mkt-018--table-surface-white-on-warm) · [MKT-031](#mkt-031--white-cards-on-warm-canvas) |
| T-06 | `radius.content` | 2px | [MKT-026](#mkt-026--cards--content-blocks-2px) |
| T-07 | `radius.table` | 4px | [MKT-019](#mkt-019--table-outer-radius) |
| T-08 | `color.semantic.table.header` | semi-white + stone-500 labels | [MKT-021](#mkt-021--table-header-cells) |
| T-09 | `color.semantic.table.cell` | stone-600 | [MKT-022](#mkt-022--table-body-cell-colour) |
| T-10 | `color.semantic.table.cell.emphasis` | stone-700 (first col) | [MKT-023](#mkt-023--table-first-column-emphasis) |
| T-11 | `layout.section.padding` | 128px | [MKT-005](#mkt-005--section-rhythm--dividers) |
| T-12 | `color.semantic.chrome.nav` | stone-950 bar spec | [MKT-006](#mkt-006--nav-model-top-bar-vs-sidebar) |
| T-13 | `accent.hairline.violet` | eyebrow / kicker rules | [MKT-041](#mkt-041--eyebrow-violet-hairlines) · [MKT-042](#mkt-042--card-kicker-hairlines) |

**Discussion:**

**Decision:** ☐ Review with design ☐ Prioritize subset for docs ☐ Defer all

---

## Suggested implementation batches

Use these groupings when scoping work — edit or reject inline.

| Batch | IDs | Rationale |
|---|---|---|
| **Quick wins (CSS only)** | MKT-011, MKT-018–MKT-023, MKT-028, MKT-036 | High visual impact; no chrome restructure |
| **Typography scale** | MKT-013–MKT-016 | Needs design sign-off on docs heading hierarchy |
| **Structural** | MKT-001, MKT-003, MKT-006, MKT-010 | Layout/theme model — larger effort |
| **Token pipeline** | T-01–T-13 | Formalize before spreading literals |

**Discussion:**
