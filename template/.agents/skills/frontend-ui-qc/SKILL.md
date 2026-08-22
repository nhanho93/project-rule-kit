---
name: frontend-ui-qc
description: Use when building or reviewing UI, forms, dashboards, tables, navigation, responsive layouts, or visual states.
---

# Frontend UI QC

Core logic: verify real rendered UI, not just component code.

Benefit: catches overlap, contrast, responsive breakage, and unusable workflows.

Why/when apply: user-facing UI, admin tools, forms, tables, modals, themes,
mobile responsiveness, complex state.

How to apply:

1. Follow the project's design system and existing component patterns.
2. Verify loading, empty, error, success, and permission states.
3. Check responsive widths relevant to the product.
4. Inspect text fit, contrast, spacing, keyboard/focus behavior, and overflow.
5. Use screenshots or browser checks for important UI changes.
6. For visual regression work, compare the project-required viewport/theme
   matrix and capture interactive states such as open dropdowns, dialogs,
   validation, overflow, and focus rather than static page load alone.
7. Record evidence and remaining risk.

## Limitations and Stop Conditions

- Source inspection, component tests, and a page-load screenshot do not replace
  real interaction evidence for a user-facing workflow.
- Do not claim full responsive/theme coverage from a subset of the project's
  declared matrix.
- Stop with BLOCKED when authentication, test data, or a healthy browser surface
  is unavailable and the missing path is REQUIRED.

## Example

For a date picker inside a modal, open it at every required viewport and theme,
exercise keyboard focus, range selection, validation, scrolling, and submit.
Capture the picker open so z-index/overflow defects are visible, then verify the
saved dates after reload and record screenshots plus browser trajectory.
