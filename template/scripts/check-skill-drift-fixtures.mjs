#!/usr/bin/env node
import assert from "node:assert/strict";
import { compareSkillDrift, normalizeSkill } from "./skill-drift-lib.mjs";
import { sha256 } from "./rulekit-integrity-lib.mjs";

let passed = 0;
const test = (name, run) => { run(); passed += 1; console.log(`[PASS] ${name}`); };
const hash = value => sha256(normalizeSkill(value));

test("volatile frontmatter and line endings are ignored", () => {
  const left = "---\ndate_added: 2026-01-01\nname: demo\n---\n# Demo\n";
  const right = "---\r\ndate_added: 2026-02-02\r\nname: demo\r\n---\r\n# Demo\r\n";
  assert.equal(hash(left), hash(right));
});
test("body changes are detected", () => assert.notEqual(hash("# A\n"), hash("# B\n")));
test("added, removed and changed are separated", () => {
  const report = compareSkillDrift({ skills: { alpha: "1", old: "2" } }, { alpha: "3", added: "4" });
  assert.deepEqual(report, { added: ["added"], removed: ["old"], changed: ["alpha"] });
});
console.log(`[SUCCESS] Drift fixtures ${passed}/3 passed.`);
