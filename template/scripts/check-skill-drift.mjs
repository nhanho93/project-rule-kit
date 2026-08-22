#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectSkillDrift, compareSkillDrift } from "./skill-drift-lib.mjs";
import { writeJsonAtomic } from "./rulekit-integrity-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baselinePath = path.join(root, ".agent-system", "registry", "skill-drift-baseline.json");
const current = collectSkillDrift(root);
if (process.argv.includes("--update-baseline")) {
  writeJsonAtomic(baselinePath, { schemaVersion: 1, skills: current });
  console.log(`[SUCCESS] Skill drift baseline updated; skills=${Object.keys(current).length}.`);
} else {
  try {
    const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
    const report = compareSkillDrift(baseline, current);
    const count = report.added.length + report.removed.length + report.changed.length;
    console.log(JSON.stringify({ status: count ? "drift" : "current", ...report }, null, 2));
    if (count) process.exitCode = 1;
    else console.log("[SUCCESS] No semantic skill drift detected.");
  } catch (error) {
    console.error(`[ERROR] RULEKIT_DRIFT_BASELINE_INVALID: ${error.message}`);
    process.exitCode = 1;
  }
}
