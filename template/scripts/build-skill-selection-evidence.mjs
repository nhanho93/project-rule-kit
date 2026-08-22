#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readJson, writeJsonAtomic } from "./rulekit-integrity-lib.mjs";
import { buildSelectionEvidence } from "./skill-selection-evidence-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const coveragePath = path.join(root, ".agent-system", "registry", "capability-coverage.json");
const out = path.join(root, ".agent-system", "selection-evidence.json");
try {
  const evidence = buildSelectionEvidence(root, readJson(coveragePath));
  if (process.argv.includes("--write")) {
    writeJsonAtomic(out, evidence);
    console.log(`[SUCCESS] Selection evidence refreshed: ${path.relative(root, out)}`);
  } else console.log(JSON.stringify(evidence, null, 2));
} catch (error) {
  console.error(`[ERROR] ${error.message}`);
  process.exitCode = 1;
}
