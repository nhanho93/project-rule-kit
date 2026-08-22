#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "agent-links-fixture-"));
let assertions = 0;

function run(expectFailure, expected = "") {
  try {
    const output = execFileSync(process.execPath, [
      path.join(source, "scripts", "check-agent-links.mjs"),
      "--root",
      fixture
    ], { cwd: source, encoding: "utf8", stdio: "pipe" });
    if (expectFailure) throw new Error(`Expected link validation failure, got PASS:\n${output}`);
    assertions += 1;
  } catch (error) {
    if (!expectFailure) throw error;
    const output = `${error.stdout || ""}${error.stderr || ""}`;
    if (!output.includes(expected)) throw new Error(`Expected ${expected}, got:\n${output}`);
    assertions += 1;
  }
}

console.log("[START] check-agent-links-fixtures");
try {
  for (const tree of [".agent-system", ".agents", ".cursor", "docs/agent-rules"]) {
    fs.cpSync(path.join(source, tree), path.join(fixture, tree), { recursive: true });
  }
  for (const file of ["AGENTS.md", "GEMINI.md"]) {
    fs.copyFileSync(path.join(source, file), path.join(fixture, file));
  }
  run(false);

  const agentsFile = path.join(fixture, "AGENTS.md");
  fs.appendFileSync(agentsFile, "\n```markdown\n[example](missing-in-example.md)\n```\n");
  run(false);

  const generatedPath = "{" + "{GENERATED_RULE_PATH}" + "}";
  fs.appendFileSync(agentsFile, `\n[generated path](${generatedPath})\n`);
  run(false);

  fs.appendFileSync(agentsFile, "\n[real broken link](missing-live-rule.md)\n");
  run(true, "missing-live-rule.md");
  console.log(`[END] check-agent-links-fixtures PASS: ${assertions} assertions.`);
} catch (error) {
  console.error(`[END] check-agent-links-fixtures FAIL: ${error.message}`);
  process.exitCode = 1;
} finally {
  fs.rmSync(fixture, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}
