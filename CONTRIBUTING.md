# Contributing to Clarity V2

This is the root rulebook. Every package in this monorepo (`packages/tokens`, `packages/components`, `packages/test-app`) inherits these conventions. Per-package `CONTRIBUTING.md` files cover only what's genuinely package-specific — anything cross-cutting lives here.

---

## How we branch and merge

Clarity V2 follows a simple `dev` → `main` flow with the [Angular Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-angular/) style.

### Trunks

- **`dev`** is the working trunk. All feature work merges here.
- **`main`** is the stable trunk. It only moves when we cut a version.

### Branching

- Branch off `dev` for any non-trivial change. One branch per issue, feature, or milestone — at your discretion.
- **Branch naming:** `<type>/<short-kebab>`, e.g. `feat/contributing-files`, `fix/token-build-precision`, `chore/m0-hygiene`. Bare — no username prefix.
- Allowed types: `feat | fix | chore | docs | refactor | test | perf | build | ci | style`.

### Commits

- **Format:** Angular Conventional Commits — `type(scope): subject`. Example: `feat(tokens): add motion duration scale`. Scope is optional but encouraged.
- **Imperative mood**, lowercase subject, no trailing period.
- Body wraps at ~72 chars and explains *why*, not *what*. The diff already shows what.

### Agent commit cadence

AI agents working in this repo **commit as they go.** One logical unit of work per commit, committed before moving to the next task. Don't batch a session's work into a single end-of-task commit.

This rule exists for three reasons:
1. **Reviewability** — small, focused commits are easier for a human to review than a single sprawling diff.
2. **Cheap rollbacks** — if a task lands wrong, reverting one commit is trivial; reverting a multi-task pile is not.
3. **Crash safety** — agents lose context on resets. Committed work survives. Uncommitted work doesn't.

When in doubt, commit smaller. A 3-line commit is fine.

### Merging

- **Feature branch → `dev`:** merge commit (no squash, no rebase). The branch's commit history is preserved on `dev`.
- **`dev` → `main`:** merge commit, **only on version bumps.** Tag the merge commit with a semver tag (e.g. `v0.0.1`). Between version bumps, `main` does not move.

PRs that target `main` directly will be rejected.

---

## Versioning

### Pre-1.0

Every package and the root `package.json` is pinned at `0.0.1` until we ship v1.0.0. The root version moves to track project-wide milestones; package versions stay frozen at `0.0.1` regardless.

### Post-1.0

At v1.0.0 we cut over to **independent per-package semver.** Each package owns its own version line and bumps independently.

### Semver discipline (post-1.0)

For each package:

- **Patch** — bug fixes, no API or behaviour change visible to consumers.
- **Minor** — additive changes (new component, new token, new prop). Existing consumers unaffected.
- **Major** — breaking change (rename, removal, material visual shift, API break).

Breaking changes require:

- A **deprecation window of at least one minor version** before removal. Deprecated surfaces stay available with an `@deprecated` marker pointing at the replacement.
- An entry in the package's `CHANGELOG.md` under a "Breaking" heading, with a migration note.

The deprecation window exists so downstream consumers can upgrade on their own schedule rather than being forced into a simultaneous cutover.

---

## Changelog

### Scope split

- **Root `CHANGELOG.md`** captures cross-cutting changes: monorepo conventions, tooling, multi-package coordination, repo-wide policy.
- **Per-package `CHANGELOG.md`** captures package-specific changes. Every package has one, kept in sync from day one even pre-1.0 — the muscle memory matters more than the audience does, and the post-1.0 cutover requires per-package CHANGELOGs to already exist.

A change that affects multiple packages goes in **each affected package's** CHANGELOG plus the root if it's also a convention change.

### Format

**Pre-1.0** — subheadings by date:

```markdown
## 2026-04-30

- Terse bullet describing what changed (`a1b2c3d`).
- Another bullet, 1–2 sentences max.

## 2026-04-29

- ...
```

**Post-1.0** — subheadings by release version, newest first:

```markdown
## 0.4.0 — 2026-08-12

- ...
```

### Entry rules

- **One bullet per logical change.** Group commits that serve the same purpose into a single bullet rather than one bullet per commit.
- **Terse.** 1–2 sentences max. Reviewers scan these — no paragraphs, no nested bullets.
- **Reference at least one commit hash** in backticks (e.g. `` `a1b2c3d` ``).
- **Every merge into `dev`** adds at least one bullet under today's date in the appropriate changelog.
- Breaking changes get a `**Breaking:**` prefix on the bullet (post-1.0).

---

## Architectural decisions (ADRs)

### Where ADRs live

- **Project-wide decisions** (token pipeline, build tooling, documentation stack, visual regression policy, anything affecting the wider project) → `docs/architecture/architecture.md` § "Architectural Decisions".
- **Package-scoped decisions** (decisions that only make sense inside one package) → `packages/<pkg>/ADRS.md`.

If a decision only makes sense if you're working *inside* one package, it's package-scoped. Otherwise it's project-wide.

### When to write one

Write an ADR when:

- A feature described in a spec is deliberately *not* being built, and the reason would be non-obvious to a future reader who finds the spec but not the code.
- A consumer-visible pattern is being adopted or rejected that will set precedent for similar future decisions.
- A workaround is being accepted that looks strange without the history.
- A reversible decision is being made whose cost-to-revisit is high (e.g., a prop name or data shape that would be breaking to change).

Don't write an ADR for routine work. Component-level rationale belongs in the component's own doc, not in ADRS.md.

### Format

```markdown
## ADR-NNN: Title (Month Year)

**Context:** What's the situation, what was planned, what triggered the decision.

**Decision:** One or two sentences stating what's being chosen.

**Rationale:**

1. **Reason heading.** Explanation.
2. **Reason heading.** Explanation.

**Trade-offs accepted:**

- Bullet 1
- Bullet 2

**Reversibility:** High / Medium / Low, with a sentence explaining what reversing would require.

**When to reconsider:**

- Specific condition 1.
- Specific condition 2.

**Related:** (optional)
- Links to specs, parent ADRs, related decisions.
```

### Numbering

Append the next sequential number. Never renumber existing entries — ADR numbers are stable references. New entries go at the **bottom** of the file so it reads chronologically. When an ADR supersedes or modifies an earlier decision, the earlier ADR gains a short status note at its top pointing at the new one (don't rewrite history — keep the original content intact).

---

## Pull requests

### Target branch

All PRs target `dev`. PRs against `main` are rejected.

### Before opening a PR

- Rebuild and test locally for any package you touched.
- Update the relevant `CHANGELOG.md` (root, per-package, or both per the scope split above). The CHANGELOG entry is part of the PR, not an afterthought.

### PR body format

```markdown
## Summary

- [1–3 bullets describing what changed and why — mirrors the CHANGELOG entry]

## References

Closes #XX, #YY
```

Rules:

- The Summary bullets mirror the CHANGELOG entry for this PR.
- Keep it short — reviewers scan, they don't read essays.
- Include References when the PR addresses any GitHub issues.

---

## Per-package guidance

Each package has its own `CONTRIBUTING.md` for genuinely package-specific concerns:

- [`packages/tokens/CONTRIBUTING.md`](./packages/tokens/CONTRIBUTING.md) — token authoring rules, build flow, who can edit `src/`.
- [`packages/components/CONTRIBUTING.md`](./packages/components/CONTRIBUTING.md) — component implementation rules, Storybook conventions, COMPONENT.md format, definition of done.
- [`packages/test-app/CONTRIBUTING.md`](./packages/test-app/CONTRIBUTING.md) — Minivoda-specific guidance.

If you're unsure where something belongs, default to the package file. The root file should grow only when something genuinely applies to every package.
