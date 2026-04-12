# Clarity V2 · Phase B + C · Sprint Plan

**Sprint:** 2026-04-14 → 2026-04-25 (2 weeks)
**Branch:** `feat/component-library-phase-b-c`
**Spec:** `docs/superpowers/specs/2026-04-09-component-library-phase-b-c-design.md`

---

## Phase B — Core Proof (week 1, committed)

| ID   | Component      | Category   | Tier      | Deps          | Built by | Design-matched by |
|------|----------------|------------|-----------|---------------|----------|-------------------|
| T001 | Separator      | Display    | trivial   | —             |          |                   |
| T002 | Label          | Forms      | trivial   | —             |          |                   |
| T003 | Skeleton       | Feedback   | trivial   | —             |          |                   |
| T004 | Badge          | Display    | trivial   | —             |          |                   |
| T005 | Input          | Forms      | simple    | Label         |          |                   |
| T006 | Textarea       | Forms      | simple    | —             |          |                   |
| T007 | Switch         | Forms      | simple    | —             |          |                   |
| T008 | Avatar         | Display    | simple    | —             |          |                   |
| T009 | Alert          | Feedback   | simple    | —             |          |                   |
| T010 | Progress       | Feedback   | simple    | —             |          |                   |
| T011 | Chip           | Display    | simple    | —             |          |                   |
| T012 | Checkbox       | Forms      | medium-1  | Label         |          |                   |
| T013 | Radio Group    | Forms      | medium-1  | Label         |          |                   |
| T014 | Slider         | Forms      | medium-1  | —             |          |                   |
| T015 | Popover        | Overlays   | medium-1  | —             |          |                   |
| T016 | Tooltip        | Overlays   | medium-1  | Popover       |          |                   |
| T017 | Toggle Group   | Forms      | medium-1  | —             |          |                   |
| T018 | Dialog         | Overlays   | medium-2  | —             |          |                   |
| T019 | Sheet          | Overlays   | medium-2  | Dialog        |          |                   |
| T020 | Dropdown Menu  | Actions    | medium-2  | Popover       |          |                   |
| T021 | Select         | Forms      | medium-2  | Popover       |          |                   |
| T022 | Tabs           | Navigation | medium-2  | —             |          |                   |
| T023 | Accordion      | Navigation | medium-2  | —             |          |                   |
| T024 | Card           | Display    | finaliser | —             |          |                   |
| T025 | Icon Button    | Actions    | finaliser | Button        |          |                   |
| T026 | Breadcrumbs    | Navigation | finaliser | —             |          |                   |
| T027 | Toast          | Feedback   | finaliser | —             |          |                   |
| T028 | Button ✅       | Actions    | done      | —             | CL 04-09 |                   |

**Non-component tasks:**

| ID   | Task                                    | Phase | Built by | Done |
|------|-----------------------------------------|-------|----------|------|
| T029 | Storybook config: category sidebar, retitle Button, Foundations section | B | | |
| T030 | Send engineering proposal to Abhishek   | B     |          |      |
| T031 | ROADMAP amendment PR (new phase model)  | B     |          |      |

---

## Phase C — Full Library (week 2, candidate — subject to rescope checkpoint)

| ID   | Component          | Category   | Tier     | Deps              | Built by | Design-matched by |
|------|--------------------|------------|----------|--------------------|----------|-------------------|
| T032 | Autocomplete       | Forms      | medium   | Popover, Input     |          |                   |
| T033 | Phone Input        | Forms      | medium   | Input              |          |                   |
| T034 | File Upload        | Forms      | medium   | —                  |          |                   |
| T035 | Table              | Display    | medium   | —                  |          |                   |
| T036 | Banner             | Feedback   | simple   | —                  |          |                   |
| T037 | Link               | Navigation | simple   | —                  |          |                   |
| T038 | Menu               | Actions    | medium   | Popover            |          |                   |
| T039 | Stepper            | Navigation | medium   | —                  |          |                   |
| T040 | Segmented Control  | Navigation | medium   | —                  |          |                   |
| T041 | Pagination         | Navigation | medium   | Button, IconButton |          |                   |
| T042 | App Shell          | Navigation | medium   | —                  |          |                   |
| T043 | Carousel           | Display    | medium   | —                  |          |                   |
| T044 | Date Picker        | Forms      | heavy    | —                  |          |                   |
| T045 | Data Grid          | Display    | heavy    | —                  |          |                   |

**Page templates:**

| ID   | Template       | Built by | Design-matched by |
|------|----------------|----------|-------------------|
| T046 | PLP            |          |                   |
| T047 | PDP            |          |                   |
| T048 | Dashboard      |          |                   |
| T049 | Auth           |          |                   |
| T050 | Checkout step  |          |                   |
| T051 | Settings       |          |                   |

**Non-component tasks:**

| ID   | Task                                           | Phase | Built by | Done |
|------|------------------------------------------------|-------|----------|------|
| T052 | Phase C rescope checkpoint (end of week 1)     | B→C   |          |      |
| T053 | Buyer PLP validation rebuild                   | C     |          |      |
| T054 | Sprint close: merge to main, final ROADMAP update | C  |          |      |

---

## Week 1 schedule (Phase B)

| Day | Date  | Focus | Target |
|-----|-------|-------|--------|
| D1  | 04-14 | Storybook config + Trivials + Simples | T029, T001–T011 (12 tasks) |
| D2  | 04-15 | Mediums batch 1 | T012–T017 (6 components) |
| D3  | 04-16 | Mediums batch 2 | T018–T023 (6 components) |
| D4  | 04-17 | Finalisers | T024–T027 (4 components) |
| D5  | 04-18 | Proposal send + ROADMAP PR + rescope checkpoint | T030, T031, T052 |

## Week 2 schedule (Phase C — candidate, confirmed at rescope)

| Day | Date  | Focus | Target |
|-----|-------|-------|--------|
| D6  | 04-21 | Phase C mediums | T032–T041 |
| D7  | 04-22 | Phase C extras + Date Picker scaffold | T034, T042, T043, T044 |
| D8  | 04-23 | Finish Date Picker + Data Grid scaffold | T044, T045 |
| D9  | 04-24 | Finish Data Grid | T045 |
| D10 | 04-25 | Page templates + PLP validation + sprint close | T046–T051, T053, T054 |

---

## Kanban columns

`Backlog → Todo → In Progress → Ready for Design Review → Design-Matched → Done`

---

## Notes

- Phase C rows are **candidates** — the authoritative list is confirmed at the D5 rescope checkpoint
- "Design-matched by" is filled by JG after Storybook review against Figma
- "Built by" is filled by whoever builds it (CL or JG)
- Button (T028) is already shipped — included for completeness
