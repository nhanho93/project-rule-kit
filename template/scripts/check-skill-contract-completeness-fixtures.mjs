#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const template = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checker = path.join(template, "scripts", "check-skill-contract-completeness.mjs");
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "rulekit-skill-contracts-"));

function run() {
  return spawnSync(process.execPath, [checker, "--root", fixture], {
    encoding: "utf8", windowsHide: true
  });
}

function expect(label, status, message) {
  const result = run();
  const output = `${result.stdout || ""}\n${result.stderr || ""}`;
  if (result.status !== status || (message && !output.includes(message))) {
    throw new Error(`${label} failed: status=${result.status}\n${output}`);
  }
  console.log(`[PASS] ${label}`);
}

try {
  fs.cpSync(path.join(template, ".agent-system"), path.join(fixture, ".agent-system"), { recursive: true });
  fs.cpSync(path.join(template, ".agents"), path.join(fixture, ".agents"), { recursive: true });
  expect("all canonical skill contracts pass", 0);

  const api = path.join(fixture, ".agents", "skills", "api-patterns", "SKILL.md");
  const original = fs.readFileSync(api, "utf8");
  fs.writeFileSync(api, original.replace(/^## Limitations[\s\S]*?(?=^## Example)/m, ""));
  expect("missing limitations fails", 1, "missing limitations/stop conditions");
  fs.writeFileSync(api, original);

  fs.writeFileSync(api, original.replace(/^## Example[\s\S]*?(?=^Completion:)/m, ""));
  expect("missing worked example fails", 1, "missing worked or routing example");
  fs.writeFileSync(api, original);

  fs.writeFileSync(api, original.replace(/^Completion:[\s\S]*$/m, ""));
  expect("missing completion criterion fails", 1, "missing observable completion criterion");
  console.log("[SUCCESS] Skill contract completeness fixtures 4/4 passed.");
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}
