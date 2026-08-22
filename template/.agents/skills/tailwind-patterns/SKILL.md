---
name: tailwind-patterns
description: Use when using Tailwind CSS, utility classes, responsive styling, themes, or component styling conventions.
---

# Tailwind Patterns

Apply the installed Tailwind version through project tokens and reusable
component variants without creating unreviewable utility duplication.

## When to Use

Use for Tailwind utilities, themes, responsive rules or component styling.
Inspect installed version/config, CSS entrypoints, token conventions and existing
component variants before adding syntax.

Do not copy configuration or class syntax from another Tailwind major version.
Do not build dynamic class strings that the compiler cannot discover.

## Workflow

1. Map the design requirement to existing tokens, variants and semantic states.
2. Keep layout utilities near the component; extract a shared component/variant
   when semantics repeat, not merely because class strings look long.
3. Define responsive behavior from content constraints and preserve required
   actions/focus order at narrow widths.
4. Cover hover, focus-visible, disabled, error and dark/high-contrast states.
5. Resolve class conflicts deterministically; avoid arbitrary values when a
   stable project token exists.
6. Verify compiled output and rendered viewports/themes; inspect open overlays
   and long/empty content states.

## Limitations and Stop Conditions

- Utility presence does not prove accessibility or design-system consistency.
- Class merge helpers can silently change precedence.
- Stop when installed-version syntax, token ownership or responsive behavior is
  unresolved.

## Example

```text
Button: shared semantic variant for intent/size/state.
Avoid: per-call copied arbitrary colors and dynamic `bg-${value}` strings.
Proof: compiled class, focus/disabled states and light/dark viewport screenshots.
```

Completion requires version-correct utilities, token/variant rationale and
rendered evidence for declared states and breakpoints.
