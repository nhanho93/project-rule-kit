---
name: frontend-design
description: Use when designing frontend layout, component systems, interaction flows, responsive behavior, or visual quality standards.
---

# Frontend Design

Translate user goals and project UI conventions into a coherent component and
interaction design before implementation. Design behavior across states, not a
single ideal screenshot.

## When to Use

Use for layout, information hierarchy, component systems, responsive behavior
or interaction flows. Read project UI conventions, existing screens, content,
personas and accessibility requirements first.

Do not replace `frontend-ui-qc`, which validates rendered output. Do not invent
a new design system when an established project pattern covers the need.

## Design Workflow

1. State the user's primary decision/action and remove hierarchy that competes
   with it.
2. Inventory reusable components, tokens and interaction patterns; document any
   justified deviation.
3. Design default, loading, empty, validation, error, disabled, success and
   permission-denied states.
4. Define keyboard/focus behavior, labels, hit targets, contrast and reduced
   motion before visual polish.
5. Specify responsive reflow at content breakpoints; avoid hiding required
   actions or relying on pointer hover.
6. Produce acceptance notes for component parity, viewports/themes and the
   browser evidence required after implementation.

## Limitations and Stop Conditions

- Static mockups cannot prove real content scale, focus order or interaction.
- Visual novelty is not evidence of usability or differentiation.
- Stop when the primary user goal, content ownership or project convention is
  unresolved.

## Example

```text
Form modal: fixed two-column desktop grid, one column on narrow screens.
States: validation summary, field errors, submitting and retryable failure.
QC: keyboard-only completion plus light/dark screenshots at declared viewports.
```

Completion requires a state/interaction contract, reusable component mapping,
responsive/accessibility rules and observable UI acceptance criteria.
