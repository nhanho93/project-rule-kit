# Module Depth Check

Use this check for a new or materially changed module boundary.

## Contract Surface

- List everything a caller must know: operations, parameters, lifecycle,
  invariants, errors, authorization, configuration, and performance limits.
- Remove caller knowledge that can be enforced or derived inside the module.
- Prefer one cohesive contract over several pass-through wrappers.

## Responsibility and Locality

- Name the business behavior owned by the module.
- Confirm related rules, changes, tests, and failure handling remain local.
- If deleting the module would remove almost no behavior, it is probably an
  unnecessary relay rather than an effective boundary.
- Create an abstraction for demonstrated variation or ownership, not a
  hypothetical future implementation.

## Test Seam

- Exercise observable behavior through the same contract used by callers.
- Inject external dependencies at the boundary instead of constructing them
  inside domain logic.
- Keep implementation details replaceable without rewriting caller tests.

Completion: document the chosen contract, rejected placement, dependency
direction, test seam, and any unresolved trade-off.
