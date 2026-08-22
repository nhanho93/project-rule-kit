---
name: project-ui-conventions
description: Use when applying a project or brand-specific frontend design system, component conventions, and UI quality constraints.
---

# Project UI Conventions

Core logic: apply a project-specific design system without copying company-only wording into the global kit.

Benefit: preserves brand consistency while keeping the kit reusable.

Why/when apply: when a project has its own UI language, component rules, or stakeholder-approved patterns.

How to apply: read the project profile and design docs, then translate local constraints into UI choices.

## Limitations and Stop Conditions

- Do not copy organization-specific names, colors, assets, or private component
  contracts into the reusable kit.
- Do not invent a brand system when the project has not supplied one; separate
  observed facts from decisions requiring the user.
- Stop when local conventions conflict or accessibility would regress, and
  record the decision owner.

## Example

If the project defines a shared select component, spacing tokens, and two theme
palettes, reuse those primitives in the new form and capture responsive,
open-dropdown, focus, validation, and light/dark evidence. Keep the reusable
skill phrased as a lookup process rather than embedding project-specific tokens.

Completion: rendered evidence conforms to the project's canonical components,
tokens, responsive states, themes, and accessibility constraints without leaking
project-specific content into the reusable kit.
