---
name: performance-profiling
description: Use when diagnosing slowness, measuring performance, optimizing bottlenecks, or reviewing resource usage.
---

# Performance Profiling

Optimize only measured bottlenecks under a reproducible workload. Preserve
correctness and compare distributions, not isolated fast runs.

## When to Use

Use for latency, throughput, CPU, memory, I/O, query or rendering regressions.
Define the affected user path, environment, workload and target metric first.

Do not optimize from intuition, a single trace or synthetic data that excludes
the suspected bottleneck. Do not trade correctness/security for benchmark gains.

## Workflow

1. Capture a baseline distribution: sample size, p50/p95/p99, throughput,
   resources, errors and environment fingerprint.
2. Decompose the path across client, network, server, dependency, database and
   queue boundaries; measure before attributing cause.
3. Form one falsifiable hypothesis and select a profiler/trace with acceptable
   overhead. Correlate timestamps and request/run IDs.
4. Change one bounded factor, preserve a rollback path and repeat the same warm
   and cold workload.
5. Compare both performance and correctness/error metrics; check regression on
   low-volume, burst, large-data and concurrent cases.
6. Record raw data, uncertainty and residual bottlenecks instead of reporting a
   percentage without conditions.

## Limitations and Stop Conditions

- Local and production hardware/data distributions may differ materially.
- Profilers can perturb timing and memory behavior.
- Stop when workload, environment fingerprint or correctness oracle is missing.

## Example

```text
Baseline: p95 820 ms at 20 concurrent users; DB wait is 610 ms.
Change: index the measured predicate, no application rewrite.
Result: p95 240 ms, equal result IDs, no write-latency regression.
```

Completion requires reproducible before/after measurements, root-cause evidence,
correctness parity and a documented rollback/residual-risk statement.
