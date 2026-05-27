# Brand / marketing token gaps

Values used on marketing surfaces and the public docs site that are **not yet** in `packages/tokens/src/`. Staging aliases live in `apps/docs/app/styles/docs-brand-extensions.css` until design signs off and the token pipeline absorbs them.

**Process:** design reviews this list → PR to `packages/tokens/src/` → replace staging `--color-docs-*` aliases with `--color-semantic-*` → delete staging values.

**Full chrome audit:** [`marketing-chrome-audit.md`](./marketing-chrome-audit.md) — editorial guidelines vs docs, with per-item IDs for review (`MKT-001` …).

## Pending

| Hex | Used on | Closest Clarity token | Proposed token | Staging variable | Status |
|---|---|---|---|---|---|
| `#f5f0ec` | Marketing website page backgrounds; docs main content (`#nd-page`) | `stone.50` (`#fafaf9`) — cooler, not warm | `color.primitive.warm.50` → `color.semantic.background.warm` | `--color-docs-content-background` | Pending design sign-off |
| _(primitive)_ | Editorial / docs prose body (`p`, lists, etc.) | `foreground.muted` = stone-700 — too dark; not editorial body | `color.semantic.foreground.body` → stone-600 (light) / stone-400 (dark) | `--color-docs-prose-body` | Pending design sign-off |

## Proposed: body vs heading foreground (MKT-011)

Editorial guidelines use **two text tiers** on light surfaces:

| Tier | Editorial | Hex | Current Clarity |
|---|---|---|---|
| **Headings / emphasis** | `stone-950` on `strong` | `#0c0a09` | `--foreground` / `foreground.default` ✓ |
| **Body copy** | `stone-600` on `p` | `#57534e` | Missing — prose was using `--foreground` (950) |

**Do not** change `--foreground` to stone-600. That variable drives product UI (buttons, labels, sidebar, headings) and must stay near-black.

**Proposed token:**

```json
"foreground": {
  "default": { "$value": "{color.primitive.stone.950}" },
  "body": { "$value": "{color.primitive.stone.600}" },
  "muted": { "$value": "{color.primitive.stone.700}" },
  ...
}
```

Dark mode `foreground.body` → `stone.400` (matches editorial `.dark p`).

**Staging (docs now):** `--color-docs-prose-body` in `docs-brand-extensions.css` → replace with `--color-semantic-foreground-body` when signed off.

**Open for design:** whether `foreground.body` belongs in product semantics or a `color.marketing.*` group — editorial/marketing surfaces share this tier; product app copy may differ.

## Notes

- **`#f5f0ec` vs `#fafaf9`:** Brand docs document `#fafaf9` (stone-50) as off-white for logo safe backgrounds. `#f5f0ec` is warmer and used on marketing site fills — likely a distinct primitive, not a rename of stone-50. Confirm with design before tokenizing.
- **Documentation as a light section:** Brand colour rules treat documentation as a dedicated light surface (dark chrome, warm/light content). Content-area tokens may belong in a marketing/brand group rather than product UI semantics.
- **Inventory source:** Extend this table from the live marketing site and retired `brand-system` repo when those values are audited.

## Resolved

_None yet._
