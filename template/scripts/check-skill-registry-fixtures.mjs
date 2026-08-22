#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "skill-registry-fixture-"));
let assertions = 0;

function run(root, expectFailure, expected, script = "scripts/check-agent-config-registry.mjs") {
  try {
    const output = execFileSync(process.execPath, [script], { cwd: root, encoding: "utf8", stdio: "pipe" });
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
  for (const tree of [".agent-system", ".agents", ".cursor"]) {
    fs.cpSync(path.join(source, tree), path.join(temp, tree), { recursive: true });
  }
  for (const file of ["AGENTS.md", "GEMINI.md"]) {
    fs.copyFileSync(path.join(source, file), path.join(temp, file));
  }
  fs.mkdirSync(path.join(temp, "docs", "agent-rules"), { recursive: true });
  for (const file of ["coding-conventions.md", "project-structure.md"]) {
    const candidate = path.join(source, "docs", file);
    if (fs.existsSync(candidate)) fs.copyFileSync(candidate, path.join(temp, "docs", file));
  }
  fs.cpSync(
    path.join(source, "docs", "agent-rules"),
    path.join(temp, "docs", "agent-rules"),
    { recursive: true }
  );
  fs.mkdirSync(path.join(temp, "scripts"), { recursive: true });
  for (const file of ["check-agent-config-registry.mjs", "check-skill-catalog.mjs"]) {
    fs.copyFileSync(path.join(source, "scripts", file), path.join(temp, "scripts", file));
  }
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

  fs.writeFileSync(registry, original);
  const extensionSource = path.join(temp, ".agent-system", "registry", "legacy-registry.json");
  const extensionValidator = path.join(temp, "scripts", "check-legacy-registry.mjs");
  fs.writeFileSync(extensionSource, "[]\n");
  fs.writeFileSync(extensionValidator, "process.exit(0);\n");
  const extensions = [{
    id: "legacy-registry",
    owner: "project maintainer",
    validator: "scripts/check-legacy-registry.mjs",
    sources: [".agent-system/registry/legacy-registry.json"]
  }];
  const extensionsPath = path.join(temp, ".agent-system", "registry", "extensions.json");
  fs.writeFileSync(extensionsPath, `${JSON.stringify(extensions, null, 2)}\n`);
  run(temp, false);

  fs.writeFileSync(extensionValidator, "console.error('fixture extension failure'); process.exit(1);\n");
  run(temp, true, "extension validator failed");

  fs.writeFileSync(extensionValidator, "process.exit(0);\n");
  extensions[0].sources = [".agent-system/registry/missing-registry.json"];
  fs.writeFileSync(extensionsPath, `${JSON.stringify(extensions, null, 2)}\n`);
  run(temp, true, "missing source");
  extensions[0].sources = [".agent-system/registry/legacy-registry.json"];
  fs.writeFileSync(extensionsPath, `${JSON.stringify(extensions, null, 2)}\n`);

  const catalogRows = JSON.parse(original);
  const largeCandidate = catalogRows.find(row => {
    const content = fs.readFileSync(path.join(temp, row.canonical), "utf8");
    return content.split(/\r?\n/).length < 180 && !/\]\(references\//.test(content);
  });
  if (!largeCandidate) throw new Error("No bounded skill candidate found for entrypoint policy fixture");
  const candidatePath = path.join(temp, largeCandidate.canonical);
  fs.appendFileSync(candidatePath, `\n${"Policy fixture line.\n".repeat(210)}`);
  run(temp, true, "entrypoint exceeds 200 lines", "scripts/check-skill-catalog.mjs");

  largeCandidate.entrypointPolicy = { allowOver200: true };
  fs.writeFileSync(registry, `${JSON.stringify(catalogRows, null, 2)}\n`);
  run(temp, true, "entrypointPolicy.reason");

  largeCandidate.entrypointPolicy = {
    allowOver200: true,
    reason: "Temporary project overlay compatibility",
    followupOwner: "project maintainer",
    nextAction: "Split conditional branches into routed references"
  };
  fs.writeFileSync(registry, `${JSON.stringify(catalogRows, null, 2)}\n`);
  run(temp, false);
  execFileSync(process.execPath, ["scripts/check-skill-catalog.mjs", "--update-baseline"], {
    cwd: temp, encoding: "utf8", stdio: "pipe"
  });
  run(temp, false, null, "scripts/check-skill-catalog.mjs");
  console.log(`[END] check-skill-registry-fixtures PASS: ${assertions} assertions.`);
} catch (error) {
  console.error(`[END] check-skill-registry-fixtures FAIL: ${error.message}`);
  process.exitCode = 1;
} finally {
  fs.rmSync(temp, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}
