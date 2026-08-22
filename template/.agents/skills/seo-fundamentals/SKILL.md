---
name: seo-fundamentals
description: Use when auditing or improving SEO, metadata, crawlability, structured data, content strategy, or indexation.
---

# Seo Fundamentals

Audit discoverability from crawl and canonical signals through rendered content
and measurable search outcomes. Separate technical evidence from ranking claims.

## When to Use

Use for crawlability, indexation, canonicals, metadata, structured data, internal
links, content intent or search performance. Establish site type, target pages,
rendering, analytics/search-console evidence and business goal first.

Do not promise rankings, generate doorway content or change production robots,
redirects or canonicals without explicit scope and rollback.

## Workflow

1. Inventory status codes, crawl directives, canonicals, sitemap/internal links
   and rendered/indexable content for representative page types.
2. Check query intent, unique value, titles/descriptions/headings and duplication
   against actual content, not keyword density targets.
3. Validate structured data eligibility and visible-content parity using current
   authoritative schemas.
4. Trace rendering/performance/mobile accessibility issues that block discovery
   or use, separating correlation from causal evidence.
5. Prioritize findings by affected pages, search demand/business value and safe
   implementation boundary.
6. Define pre/post crawl, index coverage, impressions/clicks and conversion
   observation windows; account for search-engine lag.

## Limitations and Stop Conditions

- Search results and algorithms change; audit tools do not prove index state.
- Traffic changes may come from demand, competition or seasonality.
- Stop when canonical domain, page purpose, analytics source or change authority
  is unresolved.

## Example

```text
Finding: filtered URLs self-canonicalize and enter sitemap.
Proof: crawl sample, rendered canonical and index coverage—not a ranking guess.
Fix gate: declared canonical rule, sitemap diff, redirect/crawl regression checks.
```

Completion requires evidence-linked findings, affected scope, safe change/rollback
criteria and measurable follow-up rather than ranking promises.
