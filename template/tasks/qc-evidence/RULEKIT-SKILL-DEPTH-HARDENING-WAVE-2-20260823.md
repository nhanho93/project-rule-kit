# Rule Kit Skill Depth Hardening — Wave 2

## Scope

Deepened eight core-engineering skills: database design, Node.js, Next.js/React,
frontend design, PowerShell, server management, performance profiling and
webapp testing. Browser E2E is not required because no runtime/UI code changed.

## Standards x Spec Review

- Database design is separated from migration application and covers ownership,
  constraints, access paths, idempotency and concurrency.
- Node.js owns async/resource lifecycle; Next.js owns installed-version route,
  server/client and cache boundaries.
- Frontend design specifies states and acceptance; rendered UI validation stays
  with frontend UI QC.
- PowerShell owns Windows object/quoting/path semantics; server management routes
  SSH/VM and deploy mutations to their authorized runbooks.
- Performance requires reproducible distributions; webapp testing assigns risk
  to layers and delegates real-browser execution to E2E QC.
- Every entrypoint has when/not-to-use, workflow, limitations, stop conditions,
  capability-specific example and completion evidence; each is 50-53 lines.

## Evidence

- Catalog: PASS, 54 skills, 96 warnings, 18 generic scaffolds, zero errors.
- Semantic drift preview: exactly the eight Wave 2 skills; post-review baseline
  is current with no added or removed skills.
- Installer 8/8; desired-state 4/4; links 4/4; registry/catalog 10/10;
  selection 5/5; drift 3/3; agent-control depth 4/4; knowledge loop 16/16;
  compliance 20 cases/119 assertions; doctor healthy 10/10.
- Source/credential trace and `git diff --check`: PASS.

## Residual

18 generic scaffolds and 96 warnings remain. Next blocking pointer:
`W3-SAFETY-ARCHITECTURE`. Push/publish remain unauthorized.

KNOWLEDGE_IMPACT: NO_CHANGE — reusable skill contracts changed; canonical
installed-project knowledge overlays did not.
