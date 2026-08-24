#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildInstallPlan, createTemporaryTarget } from "./lib/rulekit-install-core.mjs";
import { applyAdoptionPlan, applyInstallPlan } from "./lib/rulekit-install-apply.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let passed = 0;
const roots = [];
const test = (name, run) => {
  try { run(); passed += 1; console.log(`[PASS] ${name}`); }
  catch (error) { console.error(`[FAIL] ${name}: ${error.message}`); throw error; }
};
const target = () => { const value = createTemporaryTarget(); roots.push(value); return value; };
const overridePath = root => path.join(root, ".agent-system", "rulekit-install-overrides.json");
const writeOverride = (root, value) => {
  fs.mkdirSync(path.dirname(overridePath(root)), { recursive: true });
  fs.writeFileSync(overridePath(root), `${JSON.stringify(value, null, 2)}\n`);
};
const fileSnapshot = (root, excluded = new Set()) => {
  const result = new Map();
  const visit = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      const relative = path.relative(root, full).split(path.sep).join("/");
      if (excluded.has(relative)) continue;
      if (entry.isDirectory()) visit(full);
      else if (entry.isFile()) result.set(relative, fs.readFileSync(full).toString("base64"));
    }
  };
  visit(root);
  return result;
};

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

  test("target ownership override preserves customized bytes", () => {
    const root = target();
    const relative = "scripts/check-agent-links.mjs";
    const file = path.join(root, ...relative.split("/"));
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, "target-owned-customization\n");
    writeOverride(root, { schemaVersion: 1, projectOwnedPaths: [relative], projectOwnedPrefixes: [] });
    const plan = buildInstallPlan(packageRoot, root);
    assert.equal(plan.operations.find(item => item.path === relative).kind, "preserveProject");
    applyInstallPlan(packageRoot, root, plan.approvalDigest);
    assert.equal(fs.readFileSync(file, "utf8"), "target-owned-customization\n");
  });

  test("adoption writes only managed state and preserves all existing bytes", () => {
    const root = target();
    const relative = "scripts/check-agent-links.mjs";
    const file = path.join(root, ...relative.split("/"));
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, "legacy-customization\n");
    const before = fileSnapshot(root);
    const plan = buildInstallPlan(packageRoot, root, { adoptExisting: true });
    assert.equal(plan.operations.find(item => item.path === relative).kind, "adoptManaged");
    applyAdoptionPlan(packageRoot, root, plan.approvalDigest);
    const stateRelative = ".agent-system/install-state.json";
    assert.deepEqual(fileSnapshot(root, new Set([stateRelative])), before);
    assert.equal(fs.existsSync(path.join(root, ...stateRelative.split("/"))), true);
    const next = buildInstallPlan(packageRoot, root);
    assert.equal(next.operations.find(item => item.path === relative).kind, "updateManaged");
  });

  test("stale adoption digest is rejected", () => {
    const root = target();
    const file = path.join(root, "scripts", "check-agent-links.mjs");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, "legacy-one\n");
    const plan = buildInstallPlan(packageRoot, root, { adoptExisting: true });
    fs.writeFileSync(file, "legacy-two\n");
    assert.throws(() => applyAdoptionPlan(packageRoot, root, plan.approvalDigest), /stale/);
  });

  test("adoption is rejected when managed state already exists", () => {
    const root = target();
    const initial = buildInstallPlan(packageRoot, root);
    applyInstallPlan(packageRoot, root, initial.approvalDigest);
    assert.throws(() => buildInstallPlan(packageRoot, root, { adoptExisting: true }), /only when managed install state/);
  });

  test("adoption replaces an explicitly empty state file", () => {
    const root = target();
    const state = path.join(root, ".agent-system", "install-state.json");
    fs.mkdirSync(path.dirname(state), { recursive: true });
    fs.writeFileSync(state, '{"schemaVersion":1,"entries":[]}\n');
    const plan = buildInstallPlan(packageRoot, root, { adoptExisting: true });
    const result = applyAdoptionPlan(packageRoot, root, plan.approvalDigest);
    assert.equal(result.status, "adopted");
    assert.equal(JSON.parse(fs.readFileSync(state, "utf8")).package.version, "1.2.0");
  });

  test("unsafe target ownership override is rejected", () => {
    const root = target();
    writeOverride(root, { schemaVersion: 1, projectOwnedPaths: ["../outside.md"], projectOwnedPrefixes: [] });
    assert.throws(() => buildInstallPlan(packageRoot, root), /unsafe path/);
  });

  test("injected rollback never changes target-owned bytes", () => {
    const root = target();
    const initial = buildInstallPlan(packageRoot, root);
    applyInstallPlan(packageRoot, root, initial.approvalDigest);
    const protectedRelative = "scripts/check-agent-links.mjs";
    const protectedFile = path.join(root, ...protectedRelative.split("/"));
    writeOverride(root, { schemaVersion: 1, projectOwnedPaths: [protectedRelative], projectOwnedPrefixes: [] });
    fs.writeFileSync(protectedFile, "must-survive-failure\n");
    const removedRelative = "scripts/check-agent-compliance.mjs";
    fs.rmSync(path.join(root, ...removedRelative.split("/")));
    const plan = buildInstallPlan(packageRoot, root);
    assert.equal(plan.operations.find(item => item.path === protectedRelative).kind, "preserveProject");
    assert.throws(() => applyInstallPlan(packageRoot, root, plan.approvalDigest, { failAfter: 1 }), /Injected/);
    assert.equal(fs.readFileSync(protectedFile, "utf8"), "must-survive-failure\n");
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

  console.log(`[SUCCESS] Installer fixtures ${passed}/15 passed.`);
} finally {
  for (const root of roots) fs.rmSync(root, { recursive: true, force: true });
}
