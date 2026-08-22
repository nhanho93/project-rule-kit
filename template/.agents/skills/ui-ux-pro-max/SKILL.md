---
name: ui-ux-pro-max
description: Use when a UI needs high-polish UX review, dense operational workflows, accessibility, responsive layout, or visual QA.
---

# Ui Ux Pro Max

Review complex operational UI as a system of decisions, states and repeated
components, then convert findings into observable acceptance criteria.

## When to Use

Use for dense workflows, multi-step forms, dashboards, accessibility, responsive
layout or high-polish visual review. Read project UI conventions, personas,
content scale and actual rendered surfaces first.

Do not replace product research, frontend implementation or `frontend-ui-qc`.
Do not redesign solely from one screenshot or generic style trends.

## Workflow

1. Trace the primary user task, decision points, frequency and error cost.
2. Audit hierarchy, density, progressive disclosure, component parity and action
   consistency across related routes/states.
3. Cover loading, empty, validation, permission, error, success, destructive and
   recovery states with representative data scale.
4. Check keyboard/focus, contrast, semantics, target size, motion, overflow and
   responsive reflow in both themes where supported.
5. Separate usability defects, convention drift and visual preference; rank by
   task impact and recurrence.
6. Attach route/state/persona/viewports and exact expected behavior so browser
   QC can reproduce each accepted change.

## Limitations and Stop Conditions

- Visual inspection cannot prove backend, permission or persistence correctness.
- High polish does not justify breaking familiar operational patterns.
- Stop when user task, project convention, data scale or rendered state is
  unavailable.

## Example

```text
Finding: bulk actions move between table states and disappear on mobile.
Acceptance: same action ownership, visible selection count, keyboard access and
responsive placement across empty/partial/full selection states.
```

Completion requires prioritized evidence-linked findings, system-wide component
mapping and reproducible UI-QC acceptance cases.
