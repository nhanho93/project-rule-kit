---
name: red-team-tactics
description: Use when assessing adversarial behavior, abuse cases, prompt injection, security testing, or defensive red-team scenarios.
---

# Red Team Tactics

## Authorization Gate

Remain read-only until the user names the exact target, confirms written
authorization and defines the permitted techniques and time boundary. Before
every probing, exploitation, persistence, credential-access or data-extraction
command, show the exact command and expected effect and obtain explicit current
conversation approval. Without it, provide defensive guidance or use a
disposable lab only.

## When to Use

Use for defensive abuse-case design, disposable lab exercises or explicitly
authorized adversarial assessment with a named target and technique boundary.
Prefer read-only threat reasoning until a specific probe is approved.

Do not infer authorization from ownership claims, a broad security request or
previous approval for a different command, target or session.

## Workflow

1. Record target, authorization source, permitted techniques, time window,
   prohibited effects, data handling and emergency stop contact.
2. Model assets, trust boundaries, attacker goals and observable defenses.
3. Select the least invasive probe that can falsify the control; show exact
   command/effect and obtain current approval before active execution.
4. Use synthetic accounts/data where possible. Bound rate, concurrency, payload,
   storage and network destinations.
5. Stop immediately on scope drift, real credential/data exposure, service
   instability or unexpected third-party impact.
6. Preserve sanitized evidence, remove lab artifacts and provide defensive
   remediation plus detection opportunities.

## Limitations

Do not treat a general request to test security as authorization for a real
target. Never expand scope, retain access, extract unrelated data or weaken
logging and safeguards.

## Example

```text
Allowed: disposable lab prompt-injection test against synthetic documents.
Not allowed: reuse the payload on a live tenant without new target/command approval.
Completion: control result, bounded evidence, cleanup and defensive next action.
```

Completion requires authorization trace, exact executed scope, sanitized
findings, cleanup and confirmation that no persistence or unrelated data remains.
