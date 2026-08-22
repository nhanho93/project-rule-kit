---
name: geo-fundamentals
description: Use when working with maps, geocoding, locations, distance, boundaries, coordinates, or geo search behavior.
---

# Geo Fundamentals

Model geographic data with explicit coordinate order, reference system,
precision and boundary semantics before calculating or displaying results.

## When to Use

Use for maps, geocoding, coordinates, distance, polygons, location search or
spatial storage. Identify CRS/SRID, provider terms, precision, privacy and
expected scale first.

Do not treat latitude/longitude as planar x/y for large distances, assume
provider results are authoritative, or store more location precision than needed.

## Workflow

1. Define coordinate order, units, CRS and canonical storage representation.
2. Distinguish point, route, bounding box and polygon semantics; specify whether
   boundaries are inclusive and how holes/multipolygons behave.
3. Select geodesic or projected calculations appropriate to scale and accuracy.
4. Handle antimeridian, poles, invalid geometry, ambiguous geocodes, no result,
   provider retry/rate limit and locale formatting.
5. Index from real query predicates and verify candidate/refinement behavior.
6. Test known reference points and boundary cases; compare displayed and stored
   coordinates without leaking sensitive precision.

## Limitations and Stop Conditions

- Geocoding is probabilistic and provider-specific.
- Floating-point equality is not geographic equality.
- Stop when CRS, accuracy tolerance, boundary rule or privacy policy is unknown.

## Example

```text
Input: longitude 179.9 to -179.9 across the antimeridian.
Bad: absolute degree subtraction reports a global distance.
Good: geodesic calculation with declared units/tolerance and reference fixture.
```

Completion requires coordinate/CRS contract, provider/error behavior, spatial
query rationale and tested boundary/precision cases.
