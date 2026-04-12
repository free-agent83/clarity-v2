#!/usr/bin/env bash
# Sprint kickoff script — creates GitHub Issues + Project board for Phase B+C
# Repo: free-agent83/clarity-v2
# Run once at sprint start. Idempotent: re-running will create duplicates, so only run once.

set -euo pipefail

REPO="free-agent83/clarity-v2"

echo "=== Clarity V2 · Phase B+C Sprint Kickoff ==="
echo ""

# ------------------------------------------------------------------
# 1. Create labels (idempotent — gh ignores if they already exist)
# ------------------------------------------------------------------
echo "Creating labels..."

gh label create "phase-b"        --repo "$REPO" --color "0E8A16" --description "Phase B — Core Proof (week 1)" --force
gh label create "phase-c"        --repo "$REPO" --color "1D76DB" --description "Phase C — Full Library (week 2, candidate)" --force
gh label create "component"      --repo "$REPO" --color "D4C5F9" --description "Component build task" --force
gh label create "template"       --repo "$REPO" --color "C5DEF5" --description "Page template task" --force
gh label create "infra"          --repo "$REPO" --color "F9D0C4" --description "Infrastructure / config task" --force
gh label create "docs"           --repo "$REPO" --color "0075CA" --description "Documentation task" --force
gh label create "trivial"        --repo "$REPO" --color "EDEDED" --description "Tier: trivial (~3-5 min)" --force
gh label create "simple"         --repo "$REPO" --color "D4E4BC" --description "Tier: simple (~10 min)" --force
gh label create "medium"         --repo "$REPO" --color "FEF2C0" --description "Tier: medium (~15-25 min)" --force
gh label create "finaliser"      --repo "$REPO" --color "FBCA04" --description "Tier: finaliser (composed/special)" --force
gh label create "heavy"          --repo "$REPO" --color "E4E669" --description "Tier: heavy (own package)" --force
gh label create "validation"     --repo "$REPO" --color "FF7A59" --description "Validation build task" --force

echo "Labels created."
echo ""

# ------------------------------------------------------------------
# 2. Issue body template
# ------------------------------------------------------------------
component_body() {
  local name="$1"
  local category="$2"
  local tier="$3"
  local deps="$4"
  local task_id="$5"
  local name_lower category_lower
  name_lower=$(echo "$name" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
  category_lower=$(echo "$category" | tr '[:upper:]' '[:lower:]')

  cat <<EOF
## ${task_id} · ${name}

**Category:** ${category}
**Tier:** ${tier}
**Dependencies:** ${deps}

## Acceptance criteria

- [ ] Component exists at \`packages/components/src/components/${category_lower}/${name_lower}/\`
- [ ] Storybook story with all variants (CSF3, \`tags: ["autodocs"]\`)
- [ ] TypeScript props interface exported
- [ ] Uses Radix UI primitive (if applicable)
- [ ] Styled with Tailwind v4 + CVA, consumes Clarity V2 tokens
- [ ] Colocated README with Figma link and design-match record placeholder
- [ ] Exported from \`packages/components/src/index.ts\`
- [ ] Builds cleanly (\`npx nx build components\`)
- [ ] Accessibility: keyboard nav, ARIA roles, no Storybook a11y addon red flags

## Definition of done

See spec §4: \`docs/superpowers/specs/2026-04-09-component-library-phase-b-c-design.md\`

## Branch

\`feat/comp/${name_lower}\` off \`feat/component-library-phase-b-c\`
EOF
}

# ------------------------------------------------------------------
# 3. Create Phase B component issues (T001–T027)
# ------------------------------------------------------------------
echo "Creating Phase B component issues..."

create_issue() {
  local task_id="$1"
  local name="$2"
  local category="$3"
  local tier="$4"
  local deps="$5"
  local labels="$6"

  local body
  body=$(component_body "$name" "$category" "$tier" "$deps" "$task_id")

  gh issue create \
    --repo "$REPO" \
    --title "${task_id} · ${name}" \
    --body "$body" \
    --label "$labels"

  echo "  ✓ ${task_id} · ${name}"
}

# Trivials
create_issue "T001" "Separator"     "Display"    "trivial"   "None"    "phase-b,component,trivial"
create_issue "T002" "Label"         "Forms"      "trivial"   "None"    "phase-b,component,trivial"
create_issue "T003" "Skeleton"      "Feedback"   "trivial"   "None"    "phase-b,component,trivial"
create_issue "T004" "Badge"         "Display"    "trivial"   "None"    "phase-b,component,trivial"

# Simples
create_issue "T005" "Input"         "Forms"      "simple"    "Label"   "phase-b,component,simple"
create_issue "T006" "Textarea"      "Forms"      "simple"    "None"    "phase-b,component,simple"
create_issue "T007" "Switch"        "Forms"      "simple"    "None"    "phase-b,component,simple"
create_issue "T008" "Avatar"        "Display"    "simple"    "None"    "phase-b,component,simple"
create_issue "T009" "Alert"         "Feedback"   "simple"    "None"    "phase-b,component,simple"
create_issue "T010" "Progress"      "Feedback"   "simple"    "None"    "phase-b,component,simple"
create_issue "T011" "Chip"          "Display"    "simple"    "None"    "phase-b,component,simple"

# Mediums batch 1
create_issue "T012" "Checkbox"      "Forms"      "medium"    "Label"   "phase-b,component,medium"
create_issue "T013" "Radio Group"   "Forms"      "medium"    "Label"   "phase-b,component,medium"
create_issue "T014" "Slider"        "Forms"      "medium"    "None"    "phase-b,component,medium"
create_issue "T015" "Popover"       "Overlays"   "medium"    "None"    "phase-b,component,medium"
create_issue "T016" "Tooltip"       "Overlays"   "medium"    "Popover" "phase-b,component,medium"
create_issue "T017" "Toggle Group"  "Forms"      "medium"    "None"    "phase-b,component,medium"

# Mediums batch 2
create_issue "T018" "Dialog"        "Overlays"   "medium"    "None"    "phase-b,component,medium"
create_issue "T019" "Sheet"         "Overlays"   "medium"    "Dialog"  "phase-b,component,medium"
create_issue "T020" "Dropdown Menu" "Actions"    "medium"    "Popover" "phase-b,component,medium"
create_issue "T021" "Select"        "Forms"      "medium"    "Popover" "phase-b,component,medium"
create_issue "T022" "Tabs"          "Navigation" "medium"    "None"    "phase-b,component,medium"
create_issue "T023" "Accordion"     "Navigation" "medium"    "None"    "phase-b,component,medium"

# Finalisers
create_issue "T024" "Card"          "Display"    "finaliser" "None"    "phase-b,component,finaliser"
create_issue "T025" "Icon Button"   "Actions"    "finaliser" "Button"  "phase-b,component,finaliser"
create_issue "T026" "Breadcrumbs"   "Navigation" "finaliser" "None"    "phase-b,component,finaliser"
create_issue "T027" "Toast"         "Feedback"   "finaliser" "None"    "phase-b,component,finaliser"

echo ""

# ------------------------------------------------------------------
# 4. Create Phase B non-component issues (T029–T031)
# ------------------------------------------------------------------
echo "Creating Phase B non-component issues..."

gh issue create \
  --repo "$REPO" \
  --title "T029 · Storybook config: category sidebar, retitle Button, Foundations section" \
  --body "$(cat <<'EOF'
## T029 · Storybook configuration

Set up the category-based sidebar taxonomy, retitle Button from `Atoms/Button` to `Actions/Button`, add Foundations section (Colors, Spacing, Typography, Radius), configure path aliases and globals.

See spec §5 for the full sidebar structure.

## Acceptance criteria

- [ ] Sidebar uses category-based taxonomy (Forms / Actions / Overlays / Feedback / Display / Navigation)
- [ ] Button appears under `Actions/Button`
- [ ] Foundations section has token visualization pages (Colors, Spacing, Typography, Radius)
- [ ] All new components will slot into the correct category automatically via story title convention
EOF
)" \
  --label "phase-b,infra"
echo "  ✓ T029 · Storybook config"

gh issue create \
  --repo "$REPO" \
  --title "T030 · Send engineering proposal to Abhishek" \
  --body "$(cat <<'EOF'
## T030 · Engineering proposal

Polish and send `docs/plans/engineering-proposal.md` to Abhishek. Scheduled for D5 (2026-04-18).

## Acceptance criteria

- [ ] Proposal reviewed and polished
- [ ] Sent to Abhishek (email or Slack — confirm delivery method)
- [ ] Any feedback captured in the plan file
EOF
)" \
  --label "phase-b,docs"
echo "  ✓ T030 · Engineering proposal"

gh issue create \
  --repo "$REPO" \
  --title "T031 · ROADMAP amendment PR (new phase model)" \
  --body "$(cat <<'EOF'
## T031 · ROADMAP amendment

Update ROADMAP.md to reflect the new phase model:
- Phase B → Core Proof
- Phase C → Full Library (NEW)
- Phase D → Distribution (was C)
- Phase E → Adoption (was D)

See spec §2 for the mapping.

## Acceptance criteria

- [ ] ROADMAP.md updated with new phase structure
- [ ] PR merged to sprint branch
EOF
)" \
  --label "phase-b,docs"
echo "  ✓ T031 · ROADMAP amendment"

echo ""

# ------------------------------------------------------------------
# 5. Create Phase C component issues (T032–T045) — marked as candidates
# ------------------------------------------------------------------
echo "Creating Phase C component issues (candidates — subject to rescope)..."

create_issue "T032" "Autocomplete"      "Forms"      "medium"  "Popover, Input"      "phase-c,component,medium"
create_issue "T033" "Phone Input"       "Forms"      "medium"  "Input"               "phase-c,component,medium"
create_issue "T034" "File Upload"       "Forms"      "medium"  "None"                "phase-c,component,medium"
create_issue "T035" "Table"             "Display"    "medium"  "None"                "phase-c,component,medium"
create_issue "T036" "Banner"            "Feedback"   "simple"  "None"                "phase-c,component,simple"
create_issue "T037" "Link"              "Navigation" "simple"  "None"                "phase-c,component,simple"
create_issue "T038" "Menu"              "Actions"    "medium"  "Popover"             "phase-c,component,medium"
create_issue "T039" "Stepper"           "Navigation" "medium"  "None"                "phase-c,component,medium"
create_issue "T040" "Segmented Control" "Navigation" "medium"  "None"                "phase-c,component,medium"
create_issue "T041" "Pagination"        "Navigation" "medium"  "Button, IconButton"  "phase-c,component,medium"
create_issue "T042" "App Shell"         "Navigation" "medium"  "None"                "phase-c,component,medium"
create_issue "T043" "Carousel"          "Display"    "medium"  "None"                "phase-c,component,medium"
create_issue "T044" "Date Picker"       "Forms"      "heavy"   "None"                "phase-c,component,heavy"
create_issue "T045" "Data Grid"         "Display"    "heavy"   "None"                "phase-c,component,heavy"

echo ""

# ------------------------------------------------------------------
# 6. Create Phase C template + validation issues (T046–T054)
# ------------------------------------------------------------------
echo "Creating Phase C template and validation issues..."

for template in "T046:PLP" "T047:PDP" "T048:Dashboard" "T049:Auth" "T050:Checkout step" "T051:Settings"; do
  id="${template%%:*}"
  name="${template#*:}"
  name_lower=$(echo "$name" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
  gh issue create \
    --repo "$REPO" \
    --title "${id} · Template · ${name}" \
    --body "$(cat <<EOF
## ${id} · Page Template · ${name}

Compose a full-page layout in Storybook using Clarity V2 components.

**Location:** \`packages/components/src/templates/${name_lower}/\`

## Acceptance criteria

- [ ] Story file at \`packages/components/src/templates/${name_lower}/${name_lower}.stories.tsx\`
- [ ] Uses only Clarity V2 components (no raw HTML except structural wrappers)
- [ ] Appears in Storybook under the Templates sidebar section
- [ ] Realistic mock data
- [ ] Responsive (desktop + mobile viewport stories)
EOF
)" \
    --label "phase-c,template"
  echo "  ✓ ${id} · Template · ${name}"
done

gh issue create \
  --repo "$REPO" \
  --title "T052 · Phase C rescope checkpoint" \
  --body "$(cat <<'EOF'
## T052 · Rescope checkpoint

End of week 1 (D5 afternoon, 2026-04-18). CL + JG review Phase B output and refine the Phase C candidate list.

## Decisions to make

- [ ] Which Phase C components survive? Any additions?
- [ ] Data Grid scope confirmation (render + sort + selection)
- [ ] Template priorities — which 6 are most valuable?
- [ ] Does PLP stay as the validation target?
- [ ] Time allocation for week 2
EOF
)" \
  --label "phase-b,infra"
echo "  ✓ T052 · Rescope checkpoint"

gh issue create \
  --repo "$REPO" \
  --title "T053 · Buyer PLP validation rebuild" \
  --body "$(cat <<'EOF'
## T053 · Validation build — Buyer PLP

Rebuild Nivoda's Buyer Product List Page from scratch using Claude Code + the completed Clarity V2 library. This is the sprint's proof artefact.

See spec §11 for full details.

## Acceptance criteria

- [ ] PLP variant selected (buyer web)
- [ ] Page composition rebuilt with Clarity V2 components
- [ ] Realistic mock data (no GraphQL wiring)
- [ ] Learnings captured: missing components, gaps, API issues
- [ ] Findings added to plan file as post-sprint TODOs
EOF
)" \
  --label "phase-c,validation"
echo "  ✓ T053 · PLP validation"

gh issue create \
  --repo "$REPO" \
  --title "T054 · Sprint close: merge to main, final ROADMAP update" \
  --body "$(cat <<'EOF'
## T054 · Sprint close

End of sprint (D10, 2026-04-25).

## Acceptance criteria

- [ ] Sprint branch merged to main via single PR with full diff review
- [ ] ROADMAP.md final update with actual status
- [ ] CHANGELOG.md updated with sprint deliverables
- [ ] Decide: keep dual-push GitHub + Bitbucket or revert to Bitbucket-only
- [ ] Close GitHub Project board (archive or leave for reference)
EOF
)" \
  --label "phase-c,infra"
echo "  ✓ T054 · Sprint close"

echo ""
echo "=== Done ==="
echo ""
echo "Total issues created: 54 (T001-T054, minus T028 Button which is already done)"
echo ""
echo "Next steps:"
echo "  1. Create the GitHub Projects board manually (gh project create is org-level only)"
echo "     → Go to https://github.com/free-agent83/clarity-v2/projects → New project → Board"
echo "     → Columns: Backlog | Todo | In Progress | Ready for Design Review | Design-Matched | Done"
echo "     → Add all issues to the board"
echo "  2. Create the sprint branch: git checkout -b feat/component-library-phase-b-c"
echo "  3. Share the board URL with Joao"
echo ""
