#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { getCanonicalDocs, hashFile, checkFreshness, validateTaskId, readReceipt, writeReceipt, validateReceipt, getContinuityState, validateClassification } from "./agent-compliance-lib.mjs";
import { parsePreflightArgs } from "./agent-preflight-input.mjs";
import { buildPreflightReceipt } from "./agent-preflight-receipt.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let input;
try {
  input = parsePreflightArgs(process.argv.slice(2));
} catch (error) {
  console.error(`[ERROR] ${error.message}`);
  process.exit(1);
}
let { taskId, maxAgeDays, classification, requestSummary, classificationSource, confirmationRef, classificationSignals } = input;
const { isSimple, isResume, isSafeReset, isStrictFreshness } = input;

console.log("[START] agent-preflight");

if (!isSimple && !taskId) {
  console.error("[ERROR] --task-id <id> is required for any mutating task.");
  process.exit(1);
}

if (taskId) {
  try {
    validateTaskId(taskId);
  } catch (e) {
    console.error(`[ERROR] ${e.message}`);
    process.exit(1);
  }
}

if (isSimple) {
  if (taskId || classification || classificationSignals.length) {
    console.error("[ERROR] --simple is only for read-only questions and cannot be combined with task classification arguments.");
    process.exit(1);
  }
  console.log("Read-only question mode requested. No mutation receipt established.");
  console.log("[SUCCESS] Preflight complete.");
  process.exit(0);
}

let existingReceipt = null;
try {
  existingReceipt = readReceipt(root, taskId);
} catch (e) {
  console.error(`[ERROR] ${e.message}`);
  process.exit(1);
}

let generation = 1;

if (existingReceipt) {
  try {
    validateReceipt(existingReceipt, taskId, root);
  } catch (e) {
    console.error(`[ERROR] Invalid/tampered receipt: ${e.message}`);
    process.exit(1);
  }

  if (isResume) {
    if (!['planning', 'open'].includes(existingReceipt.status)) {
       console.error("[ERROR] Cannot resume a closed task receipt.");
       process.exit(1);
    }

    // Print sanitized DRIFT list if changed
    const drift = [];
    const allHashes = { ...(existingReceipt.canonicalHashes || {}), ...(existingReceipt.continuity?.hashes || {}) };
    if (existingReceipt.plan?.path && existingReceipt.plan?.hash) allHashes[existingReceipt.plan.path] = existingReceipt.plan.hash;
    for (const doc of existingReceipt.requiredContextFiles || []) {
       if (allHashes[doc]) {
          const docPath = path.join(root, doc);
          if (!fs.existsSync(docPath) || hashFile(docPath) !== allHashes[doc]) {
             drift.push(doc);
          }
       }
    }
    if (drift.length > 0) {
      console.log(`[INFO] Drift detected in: ${drift.join(", ")}`);
    }

    console.log("[INFO] Resuming task " + taskId);
    console.log(`[INFO] Classification: ${existingReceipt.classification || "legacy-complex"}`);
    console.log("--- REHYDRATE REQUIRED CONTEXT ---");
    console.log(JSON.stringify(existingReceipt.requiredContextFiles || [], null, 2));
    console.log("[SUCCESS] Preflight complete.");
    process.exit(0);
  } else if (isSafeReset) {
    if (existingReceipt.status !== "closed") {
      console.error("[ERROR] Cannot reset an open or planning task receipt.");
      process.exit(1);
    }
    generation = (existingReceipt.generation || 1) + 1;
    classification ||= existingReceipt.classification;
    requestSummary ||= existingReceipt.requestSummary;
    classificationSource = classification === existingReceipt.classification && classificationSource === "policy"
      ? existingReceipt.classificationSource : classificationSource;
    confirmationRef ||= existingReceipt.confirmationRef;
    if (classificationSignals.length === 0) classificationSignals.push(...(existingReceipt.classificationSignals || []));
    console.log(`[INFO] Safe reset requested. Establishing new baseline (generation ${generation}).`);
  } else {
    console.error("[ERROR] Receipt already exists for this task. Use --resume to continue or --safe-reset to overwrite.");
    process.exit(1);
  }
} else if (isResume) {
  console.error("[ERROR] Cannot --resume: no receipt found for task " + taskId);
  process.exit(1);
} else if (isSafeReset) {
  console.error("[ERROR] Cannot --safe-reset: no receipt found to reset.");
  process.exit(1);
}

let classificationResult;
try {
  classificationResult = validateClassification(classification, classificationSignals, requestSummary, classificationSource, confirmationRef);
} catch (e) {
  console.error(`[ERROR] Classification gate: ${e.message}`);
  process.exit(1);
}

const checkScript = path.join(root, "scripts", "check-project-customization.mjs");
const checkRes = spawnSync("node", [checkScript, "--installed"], { stdio: "inherit" });
if (checkRes.status !== 0) {
  console.error("[ERROR] Project customization check failed.");
  process.exit(1);
}

const canonicalDocs = getCanonicalDocs();
const canonicalHashes = {};
let freshnessErrors = 0;
const requiredContextFiles = [];

for (const doc of canonicalDocs) {
  const docPath = path.join(root, doc);
  const freshness = checkFreshness(docPath, maxAgeDays, isStrictFreshness);
  if (freshness.status === "fail") {
    console.error(`[ERROR] ${freshness.message}`);
    freshnessErrors++;
  } else if (freshness.status === "invalid") {
    console.error(`[ERROR] ${freshness.message}`);
    freshnessErrors++;
  } else if (freshness.status === "warn") {
    console.warn(`[WARN] ${freshness.message}`);
  }
  canonicalHashes[doc] = hashFile(docPath);
  requiredContextFiles.push(doc);
}

if (freshnessErrors > 0) {
  console.error("[ERROR] Freshness validation failed.");
  process.exit(1);
}

const continuity = getContinuityState(root);
if (continuity.error) {
  console.error(`[ERROR] Continuity workflow: ${continuity.error}`);
  process.exit(1);
}

const continuityHashes = {};
if (continuity.isActive) {
  const add = (k) => { continuityHashes[k.relPath] = hashFile(k.path); requiredContextFiles.push(k.relPath); };
  add(continuity.headHandover); add(continuity.headTodo); add(continuity.pendingTodo);
  continuity.hashes = continuityHashes;
}

const newReceipt = buildPreflightReceipt({
  root, taskId, generation, classificationResult, requiredContextFiles,
  canonicalHashes, continuity, continuityHashes, existingReceipt
});

try {
  writeReceipt(root, taskId, newReceipt);
} catch (e) {
  console.error(`[ERROR] ${e.message}`);
  process.exit(1);
}

console.log("--- REQUIRED CONTEXT ---");
console.log("Agent must read the following files:");
requiredContextFiles.forEach(d => console.log(`- ${d}`));
console.log("\nJSON Summary:");
console.log(JSON.stringify(newReceipt, null, 2));
console.log("\nNote: Acknowledgment cannot prove semantic understanding.");
if (newReceipt.status === "planning") console.log("[INFO] Mutation blocked until agent-plan-gate passes.");
console.log("[SUCCESS] Preflight complete.");
