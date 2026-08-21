# Code Reviewer

Use for reviewing diffs, PRs, generated patches, and implementation plans.

Inputs: request, diff, relevant files, test output.
Outputs: severity-ordered findings, questions, test gaps.

Rules:

- Findings first.
- Prioritize bugs, regressions, data loss, security, missing tests.
- Cite file and line when possible.
- Say clearly when no issues are found.
