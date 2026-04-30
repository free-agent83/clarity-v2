---
name: ds-docs-maintenance-pass
description: Use when documentation files need a health check — stale links, outdated references, cross-doc contradictions, overlaps, or drift from the current codebase state. Covers all Markdown files except DESIGN.md, COMPONENTS.md, and COMPONENT.md files.
---

# Docs Maintenance Pass

## Overview

A systematic pass over all documentation to surface and fix drift: stale links, dead file references, outdated versions, cross-doc contradictions, and redundancy.

**Core principle:** Small fixes happen immediately. Anything that changes meaning gets surfaced to the user first.

**Announce at start:** "I'm running a docs maintenance pass."

## Files in Scope

```bash
find . -name "*.md" \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/.claude/skills/*" \
  -not -name "DESIGN.md" \
  -not -name "COMPONENTS.md" \
  -not -name "COMPONENT.md" \
  | sort
```

**Audience bias — apply when assessing:**
- `CLAUDE.md` and `CONTRIBUTING.md` files → **agent-first lens** (precision for an LLM reader matters more than prose readability)
- All others → human readability and factual accuracy

## Checks to Run

For every file:

| Check | How |
|-------|-----|
| Broken relative links | Resolve each `[text](./path)` against the filesystem |
| Stale file path references | Any path mentioned in prose — does the path exist? |
| Outdated version numbers / dates | Cross-check against `package.json`, git history |
| Stale package or API names | Cross-check against current source exports |
| Internal consistency | Do statements within the file contradict each other? |

After individual files — cross-document:

| Check | How |
|-------|-----|
| Contradictions | Same topic addressed differently in two files |
| Redundancy | Same content duplicated — which copy is canonical? |
| Gaps | A file references docs that don't exist |

**Agent-first lens (CLAUDE.md + CONTRIBUTING.md only):**
- Every instruction must be unambiguous to an LLM reader
- Structured lists preferred over prose paragraphs for procedural instructions
- No vague referents ("it", "this", "they") without clear antecedents
- Edge cases and exceptions explicit, not implied

## Triage

| Category | Examples | Action |
|----------|----------|--------|
| **Small — fix now** | Typos, broken relative links, reformatting, obviously outdated version numbers, references to deleted files | Fix and commit |
| **Sensitive — ask first** | Removing sections, rewriting policy, resolving cross-doc contradictions where the authoritative source is unclear, merging redundant content | Surface in conversation, wait for decision |

**When in doubt: ask.** A false-positive question is cheap; silently changing meaning is not.

**Verification rule:** If you can verify programmatically (file exists, link resolves) — do it. If you cannot (e.g. a prose claim about how the system works), flag as sensitive.

## Workflow

```
1. DISCOVER   → Run find command, build file list
2. READ ALL   → Read every in-scope file (parallelize where possible)
3. CHECK      → Run all per-file checks, log findings with file:line
4. CROSS-DOC  → Check for contradictions and redundancy across files
5. TRIAGE     → Split findings: small vs sensitive
6. FIX SMALL  → Apply small fixes, commit
7. INTERVIEW  → Surface sensitive findings one at a time via AskUserQuestion
8. IMPLEMENT  → For each decision: implement + commit before next question
```

## Interview Loop

Present sensitive findings one at a time. For each:

1. Show the conflict clearly:
   > `CONTRIBUTING.md:42` says X. `README.md:18` says Y. Which is correct?

2. Wait for the user's decision.

3. Implement the decision and commit.

4. Then move to the next sensitive item.

Do not stack questions — one at a time, resolved and committed before the next.

## Commit Protocol

- Small fixes: one commit covers all of them
- Sensitive changes: one commit per decision
- Format: `docs(<scope>): <what changed>`
  - scope = filename without extension or nearest directory (e.g. `contributing`, `architecture`, `readme`)
  - Examples: `docs(contributing): clarify merge-commit-only policy`, `docs(readme): update storybook port`

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Treating all cross-doc repetition as redundancy | Some overlap is intentional (CLAUDE.md often summarises CONTRIBUTING.md) — flag, don't auto-remove |
| Asking the user about obvious typos or dead links | Those are small; fix directly |
| Stacking all interview questions before any commits | Resolve and commit each decision before asking the next |
| Rewriting prose in agent-first files without asking | Rewording is meaning-changing — it is sensitive |
