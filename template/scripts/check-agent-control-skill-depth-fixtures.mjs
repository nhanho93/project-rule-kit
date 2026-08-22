#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const template = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const script = path.join(template, "scripts", "check-agent-control-skill-depth.mjs");
const ids = ["intelligent-routing", "brainstorming", "code-organization-audit", "lint-and-validate", "testing-patterns", "e2e-qc", "parallel-agents", "multi-agent-monitor"];
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "rulekit-agent-control-"));

function run() {
  return spawnSync(process.execPath, [script, "--root", fixture], { encoding: "utf8", windowsHide: true });
}

function expect(label, expected, contains) {
  const result = run();
  const output = `${result.stdout || ""}\n${result.stderr || ""}`;
  if (result.status !== expected || (contains && !output.includes(contains))) {
    throw new Error(`${label} failed: status=${result.status}\n${output}`);
  }
  console.log(`[PASS] ${label}`);
}

try {
  for (const id of ids) {
    const target = path.join(fixture, ".agents", "skills", id);
    fs.mkdirSync(target, { recursive: true });
    fs.copyFileSync(path.join(template, ".agents", "skills", id, "SKILL.md"), path.join(target, "SKILL.md"));
  }
  expect("current eight-skill contracts pass", 0);

  const routing = path.join(fixture, ".agents", "skills", "intelligent-routing", "SKILL.md");
  const routingBody = fs.readFileSync(routing, "utf8");
  fs.writeFileSync(routing, routingBody.replace("triggerBranches", "registry branches"));
  expect("routing ownership regression fails", 1, "registry trigger ownership");
  fs.writeFileSync(routing, routingBody);

  const monitor = path.join(fixture, ".agents", "skills", "multi-agent-monitor", "SKILL.md");
  const monitorBody = fs.readFileSync(monitor, "utf8");
  fs.writeFileSync(monitor, monitorBody.replace("artifact verification", "result review"));
  expect("shallow monitoring evidence fails", 1, "terminal evidence gate");
  fs.writeFileSync(monitor, monitorBody);

  const tests = path.join(fixture, ".agents", "skills", "testing-patterns", "SKILL.md");
  fs.writeFileSync(tests, fs.readFileSync(tests, "utf8").replace("rejected old behavior", "prior behavior"));
  expect("missing failing characterization fails", 1, "failing characterization");
  console.log("[SUCCESS] Agent-control depth fixtures 4/4 passed.");
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}
