#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readJson } from "./rulekit-integrity-lib.mjs";
import { validateSelectionEvidence } from "./skill-selection-evidence-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
try {
  const coverage = readJson(path.join(root, ".agent-system", "registry", "capability-coverage.json"));
  const evidence = readJson(path.join(root, ".agent-system", "selection-evidence.json"));
  const errors = validateSelectionEvidence(root, coverage, evidence);
  if (errors.length) throw new Error(errors.join(", "));
  const gaps = evidence.payload.dimensions.filter(item => item.status === "gap").length;
  console.log(`[SUCCESS] Selection evidence current; explicitGaps=${gaps}.`);
} catch (error) {
  console.error(`[ERROR] ${error.message}`);
  process.exitCode = 1;
}
