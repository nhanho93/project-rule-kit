#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { computeDesiredState, validateDesiredState } from "./rulekit-integrity-lib.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "rulekit-stack-fixture-"));
const write = (relative, content) => {
  const file = path.join(root, ...relative.split("/"));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};
let passed = 0;
const test = (name, run) => { run(); passed += 1; console.log(`[PASS] ${name}`); };

try {
  write(".agent-system/registry/skills.json", `${JSON.stringify([
    { id: "alpha", adapters: { codex: "a", antigravity: "b", cursor: "c" } }
  ], null, 2)}\n`);
  write("docs/agent-rules/project-profile.md", "# Profile\n");
  const manifest = computeDesiredState(root);
  test("current desired state passes", () => assert.deepEqual(validateDesiredState(root, manifest), []));
  test("registry body drift fails", () => {
    write(".agent-system/registry/skills.json", `${JSON.stringify([
      { id: "alpha", adapters: { codex: "a", antigravity: "b", cursor: "c" } },
      { id: "beta", adapters: { codex: "a" } }
    ])}\n`);
    assert.ok(validateDesiredState(root, manifest).includes("RULEKIT_STACK_REGISTRY_DRIFT"));
  });
  write(".agent-system/registry/skills.json", `${JSON.stringify([
    { id: "alpha", adapters: { codex: "a", antigravity: "b", cursor: "c" } }
  ])}\n`);
  test("profile drift fails", () => {
    write("docs/agent-rules/project-profile.md", "# Changed\n");
    assert.ok(validateDesiredState(root, manifest).includes("RULEKIT_STACK_PROFILE_DRIFT"));
  });
  test("platform drift fails", () => {
    const invalid = structuredClone(computeDesiredState(root));
    invalid.platforms = ["codex"];
    assert.ok(validateDesiredState(root, invalid).includes("RULEKIT_STACK_PLATFORM_DRIFT"));
  });
  console.log(`[SUCCESS] Desired-state fixtures ${passed}/4 passed.`);
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
