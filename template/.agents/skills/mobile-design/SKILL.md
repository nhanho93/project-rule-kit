---
name: mobile-design
description: Use when designing mobile UI, responsive behavior, touch flows, native app screens, or mobile-first UX.
---

# Mobile Design

Design for touch, constrained attention and platform lifecycle rather than
shrinking a desktop layout.

## When to Use

Use for native/mobile UI, touch flows, responsive mobile states or mobile-first
navigation. Identify platform, device range, safe areas, input methods,
connectivity and accessibility conventions first.

Do not hide required actions behind hover, assume continuous connectivity or
copy desktop density/navigation without testing hand reach and keyboard states.

## Workflow

1. Define the primary one-handed task and minimize competing actions.
2. Use platform/project navigation conventions and preserve predictable back,
   deep-link and interruption behavior.
3. Design touch targets, focus, dynamic type, screen reader labels, safe areas
   and keyboard/IME avoidance.
4. Cover loading, offline, retry, permission denied, background/resume, rotation
   and destructive recovery states.
5. Test real content expansion and small/large devices; avoid fixed viewport
   assumptions and content loss under system UI.
6. Define device evidence and performance/battery implications before handoff.

## Limitations and Stop Conditions

- Responsive browser emulation cannot prove native keyboard, gestures or lifecycle.
- Platform conventions differ and evolve.
- Stop when target platform, navigation ownership or offline/data policy is
  unresolved.

## Example

```text
Create flow: thumb-reachable primary action, keyboard-safe fields, draft recovery.
Boundary: permission denied then settings return; background during submit.
Proof: device/simulator trajectory, screen-reader labels and restored state.
```

Completion requires platform-aware flow/states, accessibility and real-device or
approved simulator evidence at declared device sizes.
