# Security Baseline

Core logic: protect secrets, sensitive data, and production systems.

Benefit: prevents credential leaks and unsafe mutations.

Why/when apply: always; especially logs, env files, test credentials, DB,
deploy, external APIs, screenshots, and generated evidence.

How to apply:

1. Never commit `.env*`, tokens, passwords, cookies, private keys, or PII.
2. Use local ignored files for real credentials.
3. Sanitize logs and screenshots.
4. Default to non-production targets unless the user explicitly confirms.
5. Stop before creating persistent access keys or changing permissions.
