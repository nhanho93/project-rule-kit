#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "skill-registry-fixture-"));
let assertions = 0;

function run(root, expectFailure, expected) {
  try {
    const output = execFileSync(process.execPath, ["scripts/check-agent-config-registry.mjs"], { cwd: root, encoding: "utf8", stdio: "pipe" });
    if (expectFailure) throw new Error(`Expected failure containing ${expected}, got PASS:\n${output}`);
    assertions += 1;
  } catch (error) {
    if (!expectFailure) throw error;
    const output = `${error.stdout || ""}${error.stderr || ""}`;
    if (!output.includes(expected)) throw new Error(`Expected ${expected}, got:\n${output}`);
    assertions += 1;
  }
}

console.log("[START] check-skill-registry-fixtures");
try {
  fs.cpSync(source, temp, { recursive: true });
  run(temp, false);
  const registry = path.join(temp, ".agent-system", "registry", "skills.json");
  const original = fs.readFileSync(registry, "utf8");
  const rows = JSON.parse(original);
  rows[1].triggerBranches = [rows[0].triggerBranches[0]];
  fs.writeFileSync(registry, `${JSON.stringify(rows, null, 2)}\n`);
  run(temp, true, "overlaps");
  rows[1].triggerBranches = [rows[1].id];
  rows[1].invocationMode = "automatic-ish";
  fs.writeFileSync(registry, `${JSON.stringify(rows, null, 2)}\n`);
  run(temp, true, "invocationMode must be user, model, or both");
  console.log(`[END] check-skill-registry-fixtures PASS: ${assertions} assertions.`);
} catch (error) {
  console.error(`[END] check-skill-registry-fixtures FAIL: ${error.message}`);
  process.exitCode = 1;
} finally {
  fs.rmSync(temp, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}
