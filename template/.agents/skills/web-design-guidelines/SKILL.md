---
name: web-design-guidelines
description: Use when applying reusable web design guidelines, layout rules, visual systems, and frontend polish standards.
---

# Web Design Guidelines

Review web design against user goals, hierarchy, accessibility, responsive
behavior and the project's visual system. Guidelines produce findings, not a
license to restyle unrelated screens.

## When to Use

Use for reusable design review, layout/hierarchy checks, visual-system alignment
or frontend polish criteria. Read project UI conventions and inspect the real
rendered states before recommending changes.

Do not replace product research, frontend implementation or browser QC. Do not
apply generic aesthetic trends over established brand and component contracts.

## Review Workflow

1. Identify the page goal, primary action, user context and content density.
2. Review information hierarchy, grouping, alignment, spacing, typography and
   affordance against existing tokens/components.
3. Check keyboard/focus, contrast, labels, target size, motion and error recovery.
4. Inspect loading, empty, error, disabled, overflow and permission states across
   representative content scales.
5. Review responsive reflow and overlay behavior at declared viewports/themes.
6. Rank findings by user impact and attach route/state/evidence plus a concrete
   acceptance criterion; separate convention defects from preference.

## Limitations and Stop Conditions

- A screenshot cannot prove interaction, focus, network or persistence behavior.
- Generic guidelines may conflict with verified project conventions.
- Stop when route state, persona, content scale or design-system source is
  unavailable.

## Example

```text
Finding: destructive and primary actions have equal visual weight.
Evidence: named modal state at desktop/mobile and keyboard focus order.
Acceptance: primary remains prominent; destructive action requires distinct confirmation.
```

Completion requires evidence-linked findings, severity/rationale, project-rule
mapping and observable acceptance criteria for every recommended change.
