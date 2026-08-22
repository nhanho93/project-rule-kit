#!/usr/bin/env node
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const template = process.argv.includes("--template");
const checks = [
  ["customization", "check-project-customization.mjs", [template ? "--template" : "--installed"]],
  ["desired-state", "check-rulekit-stack.mjs", []],
  ["skill-catalog", "check-skill-catalog.mjs", []],
  ["agent-control-depth", "check-agent-control-skill-depth.mjs", []],
  ["registry", "check-agent-config-registry.mjs", []],
  ["links", "check-agent-links.mjs", []],
  ["selection-evidence", "check-skill-selection-evidence.mjs", []],
  ["skill-drift", "check-skill-drift.mjs", []],
  ["knowledge-loop", "check-project-knowledge-loop.mjs", []],
  ["compliance", "check-agent-compliance.mjs", []]
];
const findings = checks.map(([id, script, args]) => {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", script), ...args], {
    cwd: root, encoding: "utf8", windowsHide: true
  });
  return {
    id,
    status: result.status === 0 ? "pass" : "fail",
    code: result.status === 0 ? "RULEKIT_CHECK_PASS" : `RULEKIT_${id.toUpperCase().replaceAll("-", "_")}_FAILED`,
    exitCode: result.status ?? 1,
    summary: `${result.stdout || ""}\n${result.stderr || ""}`.trim().split(/\r?\n/).slice(-2).join(" | ")
  };
});
const failed = findings.filter(item => item.status === "fail");
console.log(JSON.stringify({ schemaVersion: 1, status: failed.length ? "degraded" : "healthy", findings }, null, 2));
if (failed.length) process.exitCode = 1;
