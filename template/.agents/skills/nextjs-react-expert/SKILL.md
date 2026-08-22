---
name: nextjs-react-expert
description: Use when working with Next.js, React, routing, server/client components, rendering, caching, or app architecture.
---

# Nextjs React Expert

Implement against the repository's installed Next.js/React contracts, not
training-memory defaults. Keep server/client, cache and authorization boundaries
explicit from route input to rendered output.

## When to Use

Use for routing, layouts, Server/Client Components, actions, rendering, caching,
streaming or framework architecture. Read installed framework docs, config,
route tree and existing patterns before editing.

Do not use for visual design alone. Do not move secrets or privileged queries
into Client Components to simplify state handling.

## Workflow

1. Identify route, render mode, runtime, data owner and authenticated actor.
2. Choose the server/client boundary from interactivity and data sensitivity;
   minimize serialized props and client bundles.
3. Trace fetch/action caching, invalidation and stale-state behavior. Treat
   authorization and data scope as server-side responsibilities.
4. Handle loading, empty, error, not-found and unauthorized states without
   leaking resource existence.
5. Check hydration determinism, navigation transitions, race/retry behavior and
   accessibility of interactive components.
6. Verify installed-version types/docs, focused tests, build-critical gates and
   browser behavior when the change is user-visible.

## Limitations and Stop Conditions

- Framework APIs and defaults change between installed versions.
- Client-side hiding is not authorization; cache invalidation is not automatic.
- Stop when route ownership, runtime target, cache semantics or server/client
  data boundary is unresolved.

## Example

```text
Case: mutation updates a list and detail route.
Contract: server action authorizes the actor, writes once, invalidates both views.
Negative: forged ID is denied without revealing the record.
Proof: installed-doc reference, action test, build gate and browser refresh/navigation.
```

Completion requires route/data-flow trace, explicit cache and auth decisions,
all render states and version-correct verification evidence.
