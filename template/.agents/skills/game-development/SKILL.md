---
name: game-development
description: Use when designing or building gameplay, loops, mechanics, levels, game UI, assets, or player interactions.
---

# Game Development

Build one playable loop whose rules, feedback and performance can be observed
before expanding content or systems.

## When to Use

Use for gameplay mechanics, loops, levels, game UI, assets or player interaction.
Read engine/version, platform constraints, input model, frame budget, save/network
ownership and existing game state architecture first.

Do not start with content volume or visual polish before the core loop is
playable and measurable. Do not tie simulation truth directly to frame rate.

## Workflow

1. Define player goal, action, rule, feedback, failure and progression loop.
2. Separate deterministic simulation/state from rendering, input and effects.
3. Build the smallest playable tracer with placeholder assets and instrumentation.
4. Cover pause/resume, restart, save/load, input loss, frame spikes and platform
   lifecycle branches that apply.
5. Profile CPU/GPU/memory and frame pacing on the target platform; preserve a
   deterministic test seam for rules.
6. Playtest the intended behavior and one abuse/boundary strategy before adding
   content breadth.

## Limitations and Stop Conditions

- A fun hypothesis cannot be proven by unit tests or designer preference alone.
- Editor performance may not represent target hardware.
- Stop when game state authority, platform budget or success metric is unresolved.

## Example

```text
Tracer: move -> collect -> score -> hazard -> restart.
Rules tested deterministically; rendering uses placeholder assets.
Proof: playtest outcome, stable restart state and target frame-time capture.
```

Completion requires a playable loop, explicit state ownership, rule tests,
target performance evidence and prioritized playtest findings.
