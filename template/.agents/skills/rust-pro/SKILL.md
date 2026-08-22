---
name: rust-pro
description: Use when writing or reviewing Rust code, ownership, lifetimes, crates, performance, or systems-level behavior.
---

# Rust Pro

Use Rust's type and ownership system to make state, concurrency and failure
contracts explicit without premature lifetime or unsafe complexity.

## When to Use

Use for Rust ownership/lifetimes, crates, async/concurrency, FFI or systems
performance. Read toolchain/MSRV, feature flags, workspace layout, clippy/test
policy and existing error conventions first.

Do not introduce `unsafe`, broad cloning or `'static` bounds merely to silence
the compiler. Do not add a crate before reviewing features and supply-chain cost.

## Workflow

1. Model domain states and invariants with enums/newtypes before implementation.
2. Choose ownership and borrowing from real lifetimes; keep public lifetimes
   minimal and avoid self-referential designs unless required.
3. Use `Result` with domain context and reserve panic for impossible internal
   invariants, not external input.
4. Bound async tasks/channels, cancellation and blocking work; avoid holding
   locks across `.await`.
5. Isolate every `unsafe`/FFI boundary with documented invariants and safe tests.
6. Run format, clippy with project policy, tests, feature combinations and
   benchmarks only for measured performance claims.

## Limitations and Stop Conditions

- Compile-time safety does not prove protocol, authorization or business logic.
- Benchmarks can be invalidated by features, allocator or target differences.
- Stop when MSRV, unsafe invariants, cancellation or FFI ownership is unknown.

## Example

```rust
enum JobState { Pending, Running { attempt: u32 }, Complete }
// Invalid combinations cannot be constructed as loose booleans.
```

Completion requires explicit state/ownership, no unexplained unsafe or clone,
project toolchain gates and tested error/concurrency boundaries.
