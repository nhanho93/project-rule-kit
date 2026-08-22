#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "project-rule-kit-fixture-"));

console.log(`[FIXTURE] Started in ${tempDir}`);

const installedProfile = path.join(root, "docs", "agent-rules", "project-profile.md");
const installedContent = fs.existsSync(installedProfile)
  ? fs.readFileSync(installedProfile, "utf8")
  : "";
if (/^status:\s*['"]?VERIFIED['"]?\s*$/m.test(installedContent)) {
  try {
    execSync("node scripts/check-project-customization.mjs --installed", {
      cwd: root,
      encoding: "utf8",
      stdio: "pipe"
    });
    console.log("[FIXTURE] Installed project detected; customization knowledge gate PASS.");
    console.log("[FIXTURE] Template-authoring mutation fixtures are not run against application repositories.");
    fs.rmSync(tempDir, { recursive: true, force: true });
    process.exit(0);
  } catch (error) {
    console.error(`[FIXTURE] Installed project knowledge gate FAIL: ${error.stdout || ""}${error.stderr || ""}`);
    fs.rmSync(tempDir, { recursive: true, force: true });
    process.exit(1);
  }
}

function run(cmd, cwd = root, expectFail = false) {
  try {
    const output = execSync(cmd, { cwd, encoding: "utf8", stdio: "pipe" });
    if (expectFail) throw new Error(`Expected command to fail, but it succeeded: ${cmd}\nOutput: ${output}`);
    return output;
  } catch (e) {
    if (!expectFail) {
      console.error(`[FIXTURE] Command failed: ${cmd}\nOutput: ${e.stdout}\nError: ${e.stderr}`);
      throw e;
    }
    return e.stdout + e.stderr;
  }
}

function hashDir(dir) {
  const files = fs.readdirSync(dir, { recursive: true });
  const hash = crypto.createHash("sha256");
  for (const file of files.sort()) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isFile()) {
      hash.update(file);
      hash.update(fs.readFileSync(fullPath));
    }
  }
  return hash.digest("hex");
}

let assertions = 0;
function assert(cond, msg) {
  if (!cond) throw new Error(`Assertion failed: ${msg}`);
  assertions++;
}

try {
  // 1. distributable template passes
  console.log("[FIXTURE] 1. Checking template passes...");
  run(`node scripts/check-project-customization.mjs --template`, root);

  // Create an evidence-rich installed project
  const installDir = path.join(tempDir, "installed");
  fs.cpSync(root, installDir, { recursive: true });

  const pkgContent = {
    name: "fixture-project",
    packageManager: "pnpm@9.0.0",
    dependencies: {
      "typescript": "^5.0.0",
      "react": "^18.0.0"
    },
    scripts: {
      "test": "vitest",
      "build": "tsc"
    }
  };
  fs.writeFileSync(path.join(installDir, "package.json"), JSON.stringify(pkgContent, null, 2));
  fs.writeFileSync(path.join(installDir, "pnpm-lock.yaml"), "lockfile", "utf8");
  fs.writeFileSync(path.join(installDir, "tsconfig.json"), "{}", "utf8");

  // 2. installed copy fails before customization
  console.log("[FIXTURE] 2. Checking installed copy fails before customization...");
  run(`node scripts/check-project-customization.mjs --installed`, installDir, true);

  // 3. inspect hash unchanged
  console.log("[FIXTURE] 3. Checking inspect mode produces identical hashes...");
  const hashBefore = hashDir(installDir);
  run(`node scripts/bootstrap-project-context.mjs`, installDir);
  const hashAfter = hashDir(installDir);
  assert(hashBefore === hashAfter, "Inspect mode mutated files!");

  // 4. apply leaves unknown facts unresolved, checks exact replacements
  console.log("[FIXTURE] 4. Checking --apply leaves REVIEW_REQUIRED...");
  run(`node scripts/bootstrap-project-context.mjs --apply`, installDir);

  const profileContent = fs.readFileSync(path.join(installDir, "docs/agent-rules/project-profile.md"), "utf8");
  assert(profileContent.includes("fixture-project (evidence: package.json#name)"), "Missing project name replacement");
  assert(profileContent.includes("Package ecosystem: pnpm (evidence: package.json#packageManager, pnpm-lock.yaml)"), "Missing package ecosystem evidence");
  assert(profileContent.includes("TypeScript (evidence: tsconfig.json, package.json#dependencies)"), "Missing TypeScript evidence");
  assert(profileContent.includes("React (evidence: package.json#dependencies)"), "Missing React evidence");
  assert(profileContent.includes("pnpm run test (evidence: package.json#scripts.test)"), "Missing test script replacement");
  assert(profileContent.includes("pnpm run build (evidence: package.json#scripts.build)"), "Missing build script replacement");
  assert(!/\bnpm run\b/.test(profileContent), "Should not contain npm run: " + profileContent);
  assert(!profileContent.includes("Node.js (via"), "Should not assert Node runtime without engines");

  run(`node scripts/check-project-customization.mjs --installed`, installDir, true);

  // 5. Simulate HUMAN REVIEW of canonical docs/agent-rules files
  console.log("[FIXTURE] 5. Simulating HUMAN REVIEW on 6 canonical files...");
  const canonicalFiles = [
    "docs/agent-rules/project-profile.md",
    "docs/agent-rules/project-structure.md",
    "docs/agent-rules/code-conventions.md",
    "docs/agent-rules/domain-glossary.md",
    "docs/agent-rules/markdown-conventions.md",
    "docs/agent-rules/delivery-profile.md"
  ];
  for (const relPath of canonicalFiles) {
    const fullPath = path.join(installDir, relPath);
    let content = fs.readFileSync(fullPath, "utf8");
    // Resolve remaining markers
    content = content.replace(/REVIEW_REQUIRED.*?(?=\n|$)/g, "Fixed facts\n");
    content = content.replace(/Replace with project facts/ig, "Fixed facts");
    // Populate valid metadata
    content = content.replace(/status: 'UNRESOLVED'/g, "status: 'VERIFIED'");
    content = content.replace(/last_verified: ''/g, "last_verified: '2026-08-21T00:00:00Z'");
    content = content.replace(/evidence_sources: ''/g, "evidence_sources: 'Manual'");
    content = content.replace(/impacted_modules: ''/g, "impacted_modules: 'All'");
    content = content.replace(/decision_owner: ''/g, "decision_owner: 'Admin'");
    fs.writeFileSync(fullPath, content, "utf8");
  }

  // Then installed validation passes
  console.log("[FIXTURE] 6. Checking installed validation passes after human review...");
  fs.mkdirSync(path.join(installDir, "src"), { recursive: true });
  const runtimeToken = "{" + "{RUNTIME_VALUE}" + "}";
  fs.writeFileSync(
    path.join(installDir, "src", "runtime-template.js"),
    `const runtimeValue = '${runtimeToken}'; // TODO normal application note\n`
  );
  run(`node scripts/check-project-customization.mjs --installed`, installDir);
  run(`node scripts/check-project-knowledge-loop.mjs`, installDir);

  const leftoverDir = path.join(tempDir, "leftover-placeholder");
  fs.cpSync(installDir, leftoverDir, { recursive: true });
  const leftoverProfile = path.join(leftoverDir, "docs", "agent-rules", "project-profile.md");
  const leftoverToken = "{" + "{LEFTOVER_PROJECT_FACT}" + "}";
  fs.appendFileSync(leftoverProfile, `\nUnresolved installed value: ${leftoverToken}\n`);
  const leftoverOutput = run(`node scripts/check-project-customization.mjs --installed`, leftoverDir, true);
  assert(leftoverOutput.includes("contains unresolved placeholder"), "Installed validator allowed a canonical placeholder");

  // 6.5 Negative fixtures for frontmatter
  console.log("[FIXTURE] 6.5 Checking negative fixtures for frontmatter...");
  // a) Invalid date
  const testDateDir = path.join(tempDir, "invalid-date");
  fs.cpSync(installDir, testDateDir, { recursive: true });
  const ppDatePath = path.join(testDateDir, "docs/agent-rules/project-profile.md");
  let ppDateContent = fs.readFileSync(ppDatePath, "utf8");
  ppDateContent = ppDateContent.replace(/last_verified: '.*?'/, "last_verified: 'not-a-date'");
  fs.writeFileSync(ppDatePath, ppDateContent, "utf8");
  run(`node scripts/check-project-customization.mjs --installed`, testDateDir, true);

  // a2) Locale date (should fail)
  const testLocaleDateDir = path.join(tempDir, "locale-date");
  fs.cpSync(installDir, testLocaleDateDir, { recursive: true });
  const ppLocaleDatePath = path.join(testLocaleDateDir, "docs/agent-rules/project-profile.md");
  let ppLocaleDateContent = fs.readFileSync(ppLocaleDatePath, "utf8");
  ppLocaleDateContent = ppLocaleDateContent.replace(/last_verified: '.*?'/, "last_verified: '08/21/2026'");
  fs.writeFileSync(ppLocaleDatePath, ppLocaleDateContent, "utf8");
  run(`node scripts/check-project-customization.mjs --installed`, testLocaleDateDir, true);

  // b) Missing required file
  const testMissingDir = path.join(tempDir, "missing-file");
  fs.cpSync(installDir, testMissingDir, { recursive: true });
  fs.unlinkSync(path.join(testMissingDir, "docs/agent-rules/project-profile.md"));
  run(`node scripts/check-project-customization.mjs --installed`, testMissingDir, true);

  // 7. Prove second apply preserves custom sentence and directory hash
  console.log("[FIXTURE] 7. Checking second --apply preserves custom content...");
  const customSentence = "This is a unique custom sentence added during human review " + Date.now();
  const profilePath = path.join(installDir, "docs/agent-rules/project-profile.md");
  fs.appendFileSync(profilePath, `\n${customSentence}\n`, "utf8");

  const hashAfterManual = hashDir(installDir);
  run(`node scripts/bootstrap-project-context.mjs --apply`, installDir);
  const hashAfterSecondApply = hashDir(installDir);
  assert(hashAfterManual === hashAfterSecondApply, "Second apply was not idempotent!");
  const finalProfileContent = fs.readFileSync(profilePath, "utf8");
  assert(finalProfileContent.includes(customSentence), "Custom sentence was lost!");

  // 8. Inject unauthorized placeholders
  console.log("[FIXTURE] 8. Checking unauthorized placeholder injections...");
  const injectionTargets = [
    "docs/agent-rules/platform-adapters.md",
    ".agents/skills/dummy.md",
    ".cursor/rules/dummy.mdc",
    "scripts/check-project-knowledge-loop.mjs"
  ];
  for (const target of injectionTargets) {
    const testInjectionDir = path.join(tempDir, `inject-${target.replace(/[\/\.]/g, "-")}`);
    fs.cpSync(root, testInjectionDir, { recursive: true });
    const targetFile = path.join(testInjectionDir, target);
    fs.mkdirSync(path.dirname(targetFile), { recursive: true });
    const badToken = "{" + "{ACCIDENTAL_TOKEN}" + "}";
    if (fs.existsSync(targetFile)) {
        fs.appendFileSync(targetFile, "\n" + badToken + "\n", "utf8");
    } else {
        fs.writeFileSync(targetFile, badToken, "utf8");
    }
    run(`node scripts/check-project-customization.mjs --template`, testInjectionDir, true);
  }

  // 9. Malformed package.json and conflicting package-manager
  console.log("[FIXTURE] 9. Checking malformed and conflicting package manager...");
  const conflictDir = path.join(tempDir, "conflict");
  fs.cpSync(root, conflictDir, { recursive: true });
  fs.writeFileSync(path.join(conflictDir, "package.json"), '{"name": "conflict", "packageManager": "npm@9.0.0"}', "utf8");
  fs.writeFileSync(path.join(conflictDir, "yarn.lock"), "yarn lock data", "utf8");
  const hashBeforeConflict = hashDir(conflictDir);
  const applyOutput = run(`node scripts/bootstrap-project-context.mjs --apply`, conflictDir, true);
  assert(applyOutput.includes("Conflicting package managers detected") && applyOutput.includes("Aborting --apply"), "Did not fail safely on conflict");
  const hashAfterConflict = hashDir(conflictDir);
  assert(hashBeforeConflict === hashAfterConflict, "Conflict apply mutated files!");

  // Malformed package.json
  const malformedDir = path.join(tempDir, "malformed");
  fs.cpSync(root, malformedDir, { recursive: true });
  fs.writeFileSync(path.join(malformedDir, "package.json"), '{"name": "conflict", "packageManager": ', "utf8");
  const hashBeforeMalformed = hashDir(malformedDir);
  const applyOutput2 = run(`node scripts/bootstrap-project-context.mjs --apply`, malformedDir, true);
  assert(applyOutput2.includes("Malformed package.json") && applyOutput2.includes("Aborting --apply"), "Did not fail safely on malformed package.json");
  const hashAfterMalformed = hashDir(malformedDir);
  assert(hashBeforeMalformed === hashAfterMalformed, "Malformed apply mutated files!");

  console.log(`[FIXTURE] ALL TESTS PASSED! (${assertions} assertions)`);
} finally {
  console.log(`[FIXTURE] Cleaning up ${tempDir}`);
  fs.rmSync(tempDir, { recursive: true, force: true });
}
