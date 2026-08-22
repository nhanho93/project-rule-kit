#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { REQUIRED_DIMENSIONS } from "./rulekit-integrity-lib.mjs";
import { buildSelectionEvidence, validateSelectionEvidence } from "./skill-selection-evidence-lib.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "rulekit-selection-fixture-"));
const write = (relative, content) => { const file = path.join(root, ...relative.split("/")); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); };
const base = () => ({ schemaVersion: 1, dimensions: REQUIRED_DIMENSIONS.map(id => ({ id, status: "gap", skillIds: [], evidencePaths: [], reason: "explicit gap" })) });
let passed = 0;
const test = (name, run) => { run(); passed += 1; console.log(`[PASS] ${name}`); };

try {
  write(".agent-system/registry/skills.json", `${JSON.stringify([{ id: "alpha" }])}\n`);
  write("docs/agent-rules/project-profile.md", "profile\n");
  write("evidence.md", "evidence\n");
  test("ten explicit dimensions pass", () => assert.equal(buildSelectionEvidence(root, base()).payload.dimensions.length, 10));
  test("missing dimension fails", () => assert.throws(() => buildSelectionEvidence(root, { ...base(), dimensions: base().dimensions.slice(1) }), /DIMENSIONS/));
  test("unknown selected skill fails", () => { const value = base(); value.dimensions[0] = { ...value.dimensions[0], status: "covered", skillIds: ["unknown"], evidencePaths: ["evidence.md"] }; assert.throws(() => buildSelectionEvidence(root, value), /UNKNOWN_SKILL/); });
  test("absolute evidence path fails", () => { const value = base(); value.dimensions[0] = { ...value.dimensions[0], status: "covered", skillIds: ["alpha"], evidencePaths: [path.resolve(root, "evidence.md")] }; assert.throws(() => buildSelectionEvidence(root, value), /PATH_UNSAFE/); });
  test("evidence drift is detected", () => { const value = base(); value.dimensions[0] = { ...value.dimensions[0], status: "covered", skillIds: ["alpha"], evidencePaths: ["evidence.md"] }; const evidence = buildSelectionEvidence(root, value); write("evidence.md", "changed\n"); assert.ok(validateSelectionEvidence(root, value, evidence).includes("RULEKIT_SELECTION_EVIDENCE_STALE")); });
  console.log(`[SUCCESS] Selection fixtures ${passed}/5 passed.`);
} finally { fs.rmSync(root, { recursive: true, force: true }); }
