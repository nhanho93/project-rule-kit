# Two-Axis Review Contract

## Establish the Review Base

Confirm the request/spec source, diff or file scope, and repository standards.
Read the project profile, code conventions, project structure, relevant ADRs,
and domain glossary when semantics are involved. If the requested base is
ambiguous and changes the findings, obtain the missing decision before issuing
a final verdict.

Completion: the exact reviewed scope and evidence sources are named.

## Standards Pass

Inspect every changed behavior for repository-rule violations, security and
data risks, architectural boundary drift, duplicated or scattered logic,
missing error handling, and verification gaps. Tool-enforced formatting noise
is not a review finding. Cite the governing rule and the smallest relevant
file/line range.

Completion: every changed file is accounted for, with findings ordered by
severity or an explicit Standards PASS and residual risk.

## Spec Pass

Trace each requirement and acceptance criterion to the implementation and
tests. Report missing or partial behavior, unintended behavior, scope creep,
wrong defaults, permission/data-scope gaps, and untested negative cases. Cite
the requirement and implementation evidence separately.

Completion: every requirement is mapped to implemented, partial, missing, or
out-of-scope status.

## Isolation and Reporting

When authorized parallel review workers are available, run one axis per worker
from the same immutable base. Otherwise perform two sequential passes and
reset the review lens between them. Do not combine scores or let one PASS hide
the other axis.

Report findings first under `Standards` and `Spec`, followed by open questions,
verification gaps, and a concise release-readiness conclusion.
