---
name: ds-docs-maintenance-pass
description: Use when documentation files need a health check — stale links, outdated references, cross-doc contradictions, overlaps, or drift from the current codebase state. Covers all Markdown files except docs/, DESIGN.md, COMPONENTS.md, and COMPONENT.md files.
---

# Docs Maintenance Pass

## Overview

A pass over project docs to surface drift while leaving stable files alone. Treat the docs as correct by default — touch only what is demonstrably broken.

**Core bias — code is canonical.** When code and docs disagree, the docs reflect the code, not the other way around. Never edit code to match a doc claim during this pass; if the code looks wrong, flag it for the user. When the right resolution is unclear, ask.

The pass follows a single workflow:

```
DISCOVER → READ → APPLY → INTERVIEW → COMMIT
```

**Announce at start:** "I'm running a docs maintenance pass."

## Files in scope

```bash
find . -name "*.md" \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/.claude/skills/*" \
  -not -path "*/.claude/worktrees/*" \
  -not -path "*/.sketchpad/*" \
  -not -path "*/docs/*" \
  -not -name "DESIGN.md" \
  -not -name "COMPONENTS.md" \
  -not -name "COMPONENT.md" \
  -not -name "*.COMPONENT.md" \
  | sort
```

Audience lens — `CLAUDE.md` and `CONTRIBUTING.md` files are read by agents; precision for an LLM reader matters more than prose flow. All others optimise for human readability and factual accuracy.

## What counts as "broken" (the only bar for touching a file)

- Broken or stale relative links (target file does not exist)
- File/path references in prose that no longer resolve
- Wrong version numbers, dates, or package names against current source of truth
- Wrong runnable commands (cwd missing, npm script absent, nx target absent)
- Direct factual contradictions with the codebase (e.g. doc says "uses X", code does not)
- Direct contradictions between two docs covering the same fact
- Prose directory-layout descriptions that disagree with the filesystem
- Overlapping/duplicated content where one copy is provably stale
- Orphaned files (nothing in scope links to them) — flag, never auto-delete
- Stale markers — `TODO`, `coming soon`, `in progress` for things that have shipped or been cancelled

**Out of scope and never a reason to edit:** style, tone, prose tightness, structural preference, "could be clearer", reordering for taste. If the only argument is aesthetic, drop it.

## Immunities

Never edit even with high-confidence flags:

- All `CHANGELOG.md` files (root and per-package) — historical records.
- `docs/archive/` — historical artefacts.
- ADRs — time-stamped decisions; the snapshot is the point.
- Dated snapshot files — anything with a `YYYY-MM-DD-*.md` filename in `docs/plans/`, `docs/superpowers/`, or similar plan/spec directories. They reflect state at write-time.
- Anything explicitly marked as a snapshot or dated record in its own header.

If a flag falls inside an immune location and the only fix is to edit that location, drop the flag. If the immune file references something that's now wrong externally, the fix lives elsewhere — usually in the active surface (READMEs, root CLAUDE.md/CONTRIBUTING.md, architecture docs).

## Conf / risk matrix

Every flag is assessed with `confidence: high|low` and `risk: high|low`.

- **Confidence high** = deterministic check (link resolves or doesn't, grep hits or doesn't, version string matches or doesn't, two strings literally contradict).
- **Confidence low** = interpretive (overlap, "feels stale", paragraph-level contradiction).
- **Risk low** = mechanical, reversible, preserves meaning (fix path, bump version, drop dead reference).
- **Risk high** = touches prose, deletes content, picks a side, cascades across files.

| Conf | Risk | Outcome |
|---|---|---|
| High | Low | **Auto-apply** |
| High | High | **Flag to user** via interview loop |
| Low | Low | Default **drop** |
| Low | High | **Drop** |

## Workflow

```
1. DISCOVER   → Run find command. Run `git log --oneline --since="14 days ago"`. Read all CHANGELOG.md files.
2. READ       → Read every in-scope Markdown file. Cross-reference claims against code as needed.
3. APPLY      → Apply mechanical fixes (broken paths, wrong version numbers, stale tree diagrams) in one pass. Verify each fix landed. Commit.
4. INTERVIEW  → Surface judgment-call items one at a time (§Caller actions). Wait, implement, commit, repeat.
```

Stay disciplined. The "broken bar" and "code is canonical" rules apply. When in doubt, ask.

## Caller actions

1. **Apply auto-fixes** in one pass. Re-verify each immunity rule yourself before applying. Read each file after editing to confirm the fix landed. Commit as a single `docs: maintenance pass — auto-fixes` commit.
2. **Interview loop** — for each item flagged for user, present it on its own with numbered options and a suggestion:

   > `<file>:<line>` — `<description>`. `<why action is warranted>`.
   >
   > Options:
   > - **A** — `<option A>`
   > - **B** — `<option B>`
   > - *(add more if genuinely distinct)*
   >
   > **Suggested: A** — `<one sentence explaining why>`.

   Wait for the answer. Implement. Commit. Then move to the next. Do not stack questions.

3. **Dropped items** — do not surface unless the user asks for the full report.

## Commit protocol

- Auto-fix batch: one commit, message `docs: maintenance pass — auto-fixes`.
- Sensitive items: one commit per resolved decision, format `docs(<scope>): <what changed>` where scope is the filename without extension or nearest directory (`contributing`, `architecture`, `readme`).

## Common mistakes

| Mistake | Fix |
|---|---|
| Editing code to match a doc claim | The doc reflects the code, not vice versa. If the code looks wrong, flag it for the user. |
| Letting "could be clearer" through the matrix | Style is never a reason to edit. Drop it. |
| Auto-deleting an orphaned file | Orphans always flag, never auto. Deletion is destructive. |
| Editing a `CHANGELOG.md` because the count or claim is now wrong | Changelogs are immune — they record state at write-time. Edit the active surface that mirrors the claim instead. |
| Resolving a contradiction by picking a side without asking | Picking a side is high-risk; always flag. |
| Stacking all interview questions before any commits | One at a time, resolved and committed before the next. |
| Presenting interview items without options | Always give the user numbered options and suggest one. |
