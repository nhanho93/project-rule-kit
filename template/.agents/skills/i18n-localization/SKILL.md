---
name: i18n-localization
description: Use when adding or reviewing translations, locales, formatting, language fallback, or localization workflows.
---

# I18n Localization

Preserve meaning, grammar, formatting and layout across locales through stable
message contracts rather than string replacement.

## When to Use

Use for translation keys, locale routing, plurals, date/number/currency formats,
fallbacks or localization workflows. Read supported locales, glossary, message
ownership and runtime formatting conventions first.

Do not concatenate translated fragments or use machine translation as approved
domain copy without review. Do not make locale determine authorization.

## Workflow

1. Define source meaning, audience, variables and domain-approved terminology.
2. Use stable semantic keys and ICU/project-native plural/select constructs;
   provide translator context without embedding code behavior in copy.
3. Format dates, numbers, currencies, names and time zones with locale-aware
   APIs while preserving canonical stored values.
4. Define missing-key and fallback behavior; detect fallback loops and mixed
   locale output.
5. Test expansion, RTL where supported, plural boundaries, missing variables,
   unsupported locale and persisted-language round-trip.
6. Review rendered critical flows with representative content and accessibility
   labels, not keys alone.

## Limitations and Stop Conditions

- Locale is not equivalent to country, currency or time zone.
- Text equality cannot prove semantic translation quality.
- Stop when source meaning, glossary ownership, fallback policy or legal copy
  approval is unresolved.

## Example

```text
Bad: "You have " + count + " tasks".
Good: locale plural message with count variable and translator context.
Proof: zero/one/many cases, long translation layout and missing-key behavior.
```

Completion requires complete keys/variables, locale-format tests, fallback
evidence and reviewed high-risk rendered copy.
