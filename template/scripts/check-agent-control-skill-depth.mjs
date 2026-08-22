#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const rootIndex = args.indexOf("--root");
const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = rootIndex >= 0 ? path.resolve(args[rootIndex + 1] || "") : defaultRoot;
const skillsRoot = path.join(root, ".agents", "skills");

const common = [
  [/^## .*When to Use/im, "when-to-use boundary"],
  [/^## .*Limitations/im, "limitations and stop conditions"],
  [/^## .*Example/im, "worked example"],
  [/completion|complete only when|routing is complete/i, "completion criterion"]
];

const contracts = {
  "intelligent-routing": [
    [/triggerBranches/, "registry trigger ownership"],
    [/invocationMode/, "invocation boundary"],
    [/unresolved overlap|uncovered branch/i, "routing gap stop condition"]
  ],
  brainstorming: [
    [/facts-versus-decisions/i, "facts-versus-decisions discovery"],
    [/option of making no change/i, "no-change alternative"],
    [/unresolved decision/i, "decision stop condition"]
  ],
  "code-organization-audit": [
    [/callers and consumers/i, "behavior-path trace"],
    [/dependency/i, "dependency audit"],
    [/non-goals/i, "refactor anti-scope"]
  ],
  "lint-and-validate": [
    [/baseline\s+failures/i, "baseline attribution"],
    [/root cause/i, "root-cause repair"],
    [/exit code/i, "raw gate evidence"]
  ],
  "testing-patterns": [
    [/rejected old behavior/i, "failing characterization"],
    [/negative, boundary/i, "edge-case matrix"],
    [/retry\/concurrency/i, "retry and concurrency coverage"],
    [/`e2e-qc`/, "browser-test ownership boundary"]
  ],
  "e2e-qc": [
    [/authenticated user path/i, "authenticated surface"],
    [/console and network/i, "browser diagnostics"],
    [/teardown/i, "fixture cleanup"],
    [/BLOCKED.*SKIPPED/is, "blocked-not-skipped gate"]
  ],
  "parallel-agents": [
    [/dependency graph/i, "dependency gate"],
    [/non-overlapping write surface/i, "write ownership"],
    [/`multi-agent-monitor`/, "monitoring ownership boundary"],
    [/combined\s+candidate/i, "merge verification"]
  ],
  "multi-agent-monitor": [
    [/`parallel-agents`/, "dispatch ownership boundary"],
    [/evidence cursor/i, "cursor-aware monitoring"],
    [/detect a stall/i, "stall diagnosis"],
    [/artifact verification/i, "terminal evidence gate"]
  ]
};

const errors = [];
for (const [id, required] of Object.entries(contracts)) {
  const file = path.join(skillsRoot, id, "SKILL.md");
  if (!fs.existsSync(file)) {
    errors.push(`${id}: missing canonical entrypoint`);
    continue;
  }
  const content = fs.readFileSync(file, "utf8");
  if (/Core logic:\s*apply the .* pattern only when the task needs it/i.test(content)) {
    errors.push(`${id}: generic scaffold language returned`);
  }
  if (content.split(/\r?\n/).length < 35) errors.push(`${id}: depth contract is too shallow`);
  for (const [pattern, label] of [...common, ...required]) {
    if (!pattern.test(content)) errors.push(`${id}: missing ${label}`);
  }
}

console.log("[START] check-agent-control-skill-depth");
console.log(`skills=${Object.keys(contracts).length}`);
console.log(`errors=${errors.length}`);
for (const error of errors) console.error(`[ERROR] ${error}`);
console.log(errors.length ? "[ERROR] check-agent-control-skill-depth FAIL" : "[END] check-agent-control-skill-depth PASS");
process.exit(errors.length ? 1 : 0);
