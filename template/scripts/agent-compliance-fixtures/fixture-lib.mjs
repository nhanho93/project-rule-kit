import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const DOCS = ["project-profile", "project-structure", "code-conventions", "domain-glossary", "markdown-conventions", "delivery-profile"];

function hashTree(root) {
  const hash = crypto.createHash("sha256");
  const files = [];
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if ([".git", "node_modules", "state"].includes(entry.name)) continue;
      const target = path.join(dir, entry.name);
      entry.isDirectory() ? walk(target) : files.push(target);
    }
  };
  walk(root);
  for (const file of files.sort()) {
    hash.update(path.relative(root, file));
    hash.update(fs.readFileSync(file));
  }
  return hash.digest("hex");
}

export function createHarness(templateRoot) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "project-rule-kit-compliance-"));
  const sourceHash = hashTree(templateRoot);
  let cases = 0;
  let assertions = 0;
  const assert = (condition, message) => {
    assertions++;
    if (!condition) throw new Error(message);
  };
  const project = (name, workflow = false) => {
    cases++;
    const root = path.join(tempRoot, `${String(cases).padStart(2, "0")}-${name}`);
    fs.cpSync(templateRoot, root, { recursive: true });
    fs.rmSync(path.join(root, ".agent-system", "state"), { recursive: true, force: true });
    if (!workflow) {
      for (const name of ["handover.md", "todo.md", "pending_todo.md"]) {
        fs.rmSync(path.join(root, "tasks", name), { force: true });
      }
      fs.writeFileSync(path.join(root, ".agent-system", "compliance.json"), '{"enable_workflow":false}\n');
    }
    return root;
  };
  const customize = (root, date = new Date().toISOString()) => {
    for (const doc of DOCS) {
      const file = path.join(root, "docs", "agent-rules", `${doc}.md`);
      fs.writeFileSync(file, `---\nlast_verified: ${date}\nevidence_sources: fixture\nimpacted_modules: fixture\ndecision_owner: fixture\nstatus: VERIFIED\n---\n# ${doc}\nVerified fixture content.\n`);
    }
  };
  const continuity = root => {
    const dir = path.join(root, "tasks");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(root, ".agent-system", "compliance.json"), '{"enable_workflow":true}\n');
    fs.writeFileSync(path.join(dir, "handover-1.md"), "handover baseline\n");
    fs.writeFileSync(path.join(dir, "todo-1.md"), "todo baseline\n");
    fs.writeFileSync(path.join(dir, "pending_todo.md"), "pending baseline\n");
  };
  const run = (root, script, args = []) => spawnSync("node", [path.join(root, "scripts", script), ...args], {
    cwd: root, encoding: "utf8", timeout: 30000
  });
  const expect = (result, status, text, label) => {
    assert(result.status === status, `${label}: expected exit ${status}, got ${result.status}; ${result.stderr}`);
    if (text) assert(`${result.stdout}\n${result.stderr}`.includes(text), `${label}: missing '${text}'`);
  };
  const receiptPath = (root, task) => path.join(root, ".agent-system", "state", `${task}.json`);
  const manifest = (task, overrides = {}) => ({
    schema_version: 1, task_id: task, classification: "basic", knowledge_impact: "NO_CHANGE",
    knowledge_files_impacted: [], reason: "Fixture verifies compliance contract.",
    verification: [{ command: "fixture", exit_code: 0, sanitized_output_summary: "PASS" }], ...overrides
  });
  const writeManifest = (root, value, name = "manifest.json") => {
    fs.writeFileSync(path.join(root, name), JSON.stringify(value, null, 2));
    return name;
  };
  const basicArgs = (task, extra = []) => ["--task-id", task, "--classification", "basic", "--request-summary", "Small reversible fixture change", "--signal", "single_domain", "--signal", "small_reversible", ...extra];
  const complexArgs = (task, extra = []) => ["--task-id", task, "--classification", "complex", "--request-summary", "Multi-file fixture implementation", "--signal", "multi_file", ...extra];
  const criticalArgs = (task, extra = []) => ["--task-id", task, "--classification", "critical", "--request-summary", "Authorized fixture deployment change", "--signal", "deployment", "--classification-source", "user_confirmed", "--confirmation-ref", "User confirmed fixture critical scope", ...extra];
  const planContent = (classification, signals, approval = "APPROVED") => `# TASK CLASSIFICATION\nTASK_CLASSIFICATION: ${classification}\nSIGNALS: ${signals.join(", ")}\n# GOAL\nDeliver the verified fixture behavior.\n# NON GOALS\nNo unrelated mutation or production action.\n# DISCOVERY EVIDENCE\nFixture source and contracts were inspected.\n# IMPLEMENTATION STEPS\n1. Apply bounded changes.\n2. Verify behavior.\n# DELIVERY SLICES\nSLICE WAVE_A: Deliver and verify the bounded fixture behavior.\nCompletion: deterministic fixture command passes.\n# DEPENDENCY EDGES\nWAVE_A <- NONE\n# ACCEPTANCE CRITERIA\nAll declared checks pass with no residual fixture data.\n# VERIFICATION\nRun deterministic fixture checks and inspect exact outputs.\n# QC DECISION\nBrowser E2E is not required for this script-only fixture.\n# ROLLBACK\nRestore the isolated fixture copy if verification fails.\n# APPROVAL\nAPPROVAL_STATUS: ${approval}\n${classification === "critical" ? "# AUTHORIZATION BOUNDARY\nOnly the confirmed fixture scope is authorized.\n# FAILURE RECOVERY\nStop, preserve evidence, and restore the isolated fixture.\n" : ""}`;
  return {
    assert, project, customize, continuity, run, expect, receiptPath, manifest, writeManifest,
    basicArgs, complexArgs, criticalArgs, planContent,
    assertSourceUnchanged: () => assert(hashTree(templateRoot) === sourceHash, "Production template mutated during fixture run"),
    cleanup: () => fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }),
    caseCount: () => cases, assertCount: () => assertions
  };
}
