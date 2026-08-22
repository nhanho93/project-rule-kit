#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildInstallPlan, createTemporaryTarget } from "./lib/rulekit-install-core.mjs";
import { applyInstallPlan } from "./lib/rulekit-install-apply.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let passed = 0;
const roots = [];
const test = (name, run) => {
  try { run(); passed += 1; console.log(`[PASS] ${name}`); }
  catch (error) { console.error(`[FAIL] ${name}: ${error.message}`); throw error; }
};
const target = () => { const value = createTemporaryTarget(); roots.push(value); return value; };

try {
  test("dry-run performs no writes", () => {
    const root = target();
    const before = fs.readdirSync(root);
    const plan = buildInstallPlan(packageRoot, root);
    assert.equal(plan.hasCollisions, false);
    assert.deepEqual(fs.readdirSync(root), before);
  });

  test("fresh apply and repeat preview are idempotent", () => {
    const root = target();
    const plan = buildInstallPlan(packageRoot, root);
    applyInstallPlan(packageRoot, root, plan.approvalDigest);
    const repeat = buildInstallPlan(packageRoot, root);
    assert.equal(repeat.hasCollisions, false);
    assert.equal(repeat.operations.some(item => !["unchanged", "unchangedProject", "stateOnly"].includes(item.kind)), false);
  });

  test("stale approval digest is rejected", () => {
    const root = target();
    const plan = buildInstallPlan(packageRoot, root);
    fs.mkdirSync(path.join(root, ".agents", "skills", "clean-code"), { recursive: true });
    fs.writeFileSync(path.join(root, ".agents", "skills", "clean-code", "SKILL.md"), "unmanaged\n");
    assert.throws(() => applyInstallPlan(packageRoot, root, plan.approvalDigest), /stale/);
  });

  test("unmanaged collision is preserved", () => {
    const root = target();
    const file = path.join(root, ".agents", "skills", "clean-code", "SKILL.md");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, "keep-me\n");
    const plan = buildInstallPlan(packageRoot, root);
    assert.equal(plan.hasCollisions, true);
    assert.throws(() => applyInstallPlan(packageRoot, root, plan.approvalDigest), /collisions/);
    assert.equal(fs.readFileSync(file, "utf8"), "keep-me\n");
  });

  test("locally modified managed file is preserved", () => {
    const root = target();
    const initial = buildInstallPlan(packageRoot, root);
    applyInstallPlan(packageRoot, root, initial.approvalDigest);
    const file = path.join(root, "scripts", "check-agent-links.mjs");
    fs.writeFileSync(file, "local-overlay\n");
    const plan = buildInstallPlan(packageRoot, root);
    assert.equal(plan.operations.find(item => item.path === "scripts/check-agent-links.mjs").reason, "managed-local-drift");
    assert.equal(fs.readFileSync(file, "utf8"), "local-overlay\n");
  });

  test("project-owned overlays are preserved without blocking upgrade", () => {
    const root = target();
    const initial = buildInstallPlan(packageRoot, root);
    applyInstallPlan(packageRoot, root, initial.approvalDigest);
    const file = path.join(root, "docs", "agent-rules", "project-profile.md");
    fs.writeFileSync(file, "customized-project-profile\n");
    const plan = buildInstallPlan(packageRoot, root);
    const operation = plan.operations.find(item => item.path === "docs/agent-rules/project-profile.md");
    assert.equal(operation.kind, "preserveProject");
    assert.equal(plan.hasCollisions, false);
    assert.equal(fs.readFileSync(file, "utf8"), "customized-project-profile\n");
  });

  test("injected failure rolls fresh install back", () => {
    const root = target();
    const plan = buildInstallPlan(packageRoot, root);
    const promoted = plan.operations.filter(item => ["install", "installProjectSeed"].includes(item.kind)).slice(0, 2);
    assert.throws(() => applyInstallPlan(packageRoot, root, plan.approvalDigest, { failAfter: 2 }), /Injected/);
    for (const item of promoted) assert.equal(fs.existsSync(path.join(root, ...item.path.split("/"))), false);
    assert.equal(fs.existsSync(path.join(root, ".agent-system", "install-state.json")), false);
  });

  test("symbolic-link target component is rejected", () => {
    const root = target();
    const outside = target();
    fs.symlinkSync(outside, path.join(root, ".agent-system"), process.platform === "win32" ? "junction" : "dir");
    assert.throws(() => buildInstallPlan(packageRoot, root), /symbolic-link/);
  });

  console.log(`[SUCCESS] Installer fixtures ${passed}/8 passed.`);
} finally {
  for (const root of roots) fs.rmSync(root, { recursive: true, force: true });
}
