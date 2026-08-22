---
name: nodejs-best-practices
description: Use when writing or reviewing Node.js services, scripts, async flows, package usage, or runtime behavior.
---

# Nodejs Best Practices

Build Node.js flows with explicit async ownership, bounded resources and
observable failure behavior using the repository's supported runtime version.

## When to Use

Use for Node services, workers, scripts, streams, package/runtime behavior or
async review. Inspect `package.json`, lockfile, runtime config, process model and
existing error/logging conventions before choosing APIs.

Do not introduce a dependency for behavior available safely in the supported
runtime. Do not fire-and-forget work whose failure or shutdown matters.

## Workflow

1. Identify the request/job lifecycle, cancellation boundary and owner of every
   promise, timer, stream, child process and connection.
2. Validate external input at the boundary and preserve typed/domain errors.
3. Bound concurrency, queue depth, retries, timeouts and memory; include
   backpressure for streams and batch work.
4. Make startup, graceful shutdown and partial failure observable without
   logging secrets or unbounded payloads.
5. Keep side effects idempotent where retry is possible; use transactions or
   reconciliation for partial writes.
6. Test rejection, timeout, cancellation, duplicate retry and resource cleanup
   in addition to the success path.

## Limitations and Stop Conditions

- Process memory and local locks do not coordinate multiple instances.
- Event-loop speed does not make CPU-heavy work non-blocking.
- Stop when runtime version, package ownership, retry semantics or shutdown
  behavior is unknown.

## Example

```text
Bad: array.forEach(async item => await write(item)) with ignored failures.
Good: bounded worker pool, awaited results, idempotency key and aggregate error.
Proof: retry test, max-concurrency assertion and zero open handles after failure.
```

Completion requires explicit lifecycle/resource ownership, bounded failure
behavior, focused tests and raw runtime/static gate evidence.
