#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { getCanonicalDocs, hashFile, validateTaskId, checkContainment, readReceipt, writeReceipt, validateReceipt, getContinuityState, validateManifestBasic, validateVerification, validateImpactSet, validateContinuityManifest } from "./agent-compliance-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
let taskId = null;
let manifestPath = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--task-id" && i + 1 < args.length) taskId = args[i + 1];
  else if (args[i] === "--manifest" && i + 1 < args.length) manifestPath = args[i + 1];
}

console.log("[START] agent-phase-close");

if (!taskId || !manifestPath) {
  console.error("[ERROR] --task-id and --manifest are required.");
  process.exit(1);
}

try {
  validateTaskId(taskId);
} catch (e) {
  console.error(`[ERROR] ${e.message}`);
  process.exit(1);
}

let receipt = null;
try {
  receipt = readReceipt(root, taskId);
  if (!receipt) {
    console.error(`[ERROR] Receipt for task ${taskId} not found. Run preflight first.`);
    process.exit(1);
  }
  validateReceipt(receipt, taskId, root);
} catch (e) {
  console.error(`[ERROR] ${e.message}`);
  process.exit(1);
}

const resolvedManifestPath = path.resolve(root, manifestPath);
if (!checkContainment(root, resolvedManifestPath)) {
  console.error("[ERROR] Manifest must be within project root and outside receipt state directory.");
  process.exit(1);
}
if (!fs.statSync(resolvedManifestPath).isFile()) {
  console.error("[ERROR] Manifest path must reference an existing file.");
  process.exit(1);
}

const manifestContent = fs.readFileSync(resolvedManifestPath, "utf8");
const manifestHash = crypto.createHash("sha256").update(manifestContent).digest("hex");
let manifest;
try {
  manifest = JSON.parse(manifestContent);
} catch (e) {
  console.error("[ERROR] Manifest is not valid JSON.");
  process.exit(1);
}

if (receipt.status === "closed") {
  if (receipt.closeResult && receipt.closeResult.manifestHash === manifestHash) {
    console.log("[INFO] Task is already closed with matching manifest.");
    process.exit(receipt.closeResult.exitCode);
  } else {
    console.error("[ERROR] Cannot repeat-close with a different, modified, or missing manifest.");
    process.exit(1);
  }
}
if (receipt.status === "planning") {
  console.error("[ERROR] Cannot close a task while plan gate is pending.");
  process.exit(1);
}
if (receipt.schemaVersion === 2 && receipt.plan) {
  const planPath = path.join(root, receipt.plan.path);
  if (!checkContainment(root, planPath) || hashFile(planPath) !== receipt.plan.hash) {
    console.error("[ERROR] Gated plan changed or disappeared. Run agent-plan-gate with --refresh.");
    process.exit(1);
  }
}

let impact = null;
try {
  impact = validateManifestBasic(manifest, taskId, receipt.classification || "complex");
  validateVerification(manifest, impact, root);
} catch (e) {
  console.error(`[ERROR] ${e.message}`);
  process.exit(1);
}

if (receipt.continuity && receipt.continuity.isActive) {
  const currentState = getContinuityState(root);
  if (currentState.error) {
    console.error(`[ERROR] Continuity state error: ${currentState.error}`);
    process.exit(1);
  }
  try {
    const headHandoverHash = hashFile(currentState.headHandover.path);
    const headTodoHash = hashFile(currentState.headTodo.path);
    const pendingTodoHash = currentState.pendingTodo ? hashFile(currentState.pendingTodo.path) : null;
    validateContinuityManifest(manifest, impact, currentState, receipt, root, headHandoverHash, headTodoHash, pendingTodoHash);
  } catch (e) {
    console.error(`[ERROR] ${e.message}`);
    process.exit(1);
  }
}

const canonicalDocs = getCanonicalDocs();
const changedDocs = [];
for (const doc of canonicalDocs) {
  const currentHash = hashFile(path.join(root, doc));
  if (currentHash !== receipt.canonicalHashes[doc]) {
    changedDocs.push(doc);
  }
}

for (const f of manifest.knowledge_files_impacted) {
  if (!canonicalDocs.includes(f)) {
    console.error(`[ERROR] knowledge_files_impacted contains non-canonical or invalid path: ${f}`);
    process.exit(1);
  }
}

try {
  validateImpactSet(manifest, impact, changedDocs);
} catch (e) {
  console.error(`[ERROR] ${e.message}`);
  process.exit(1);
}

let exitCode = 0;
if (impact === "UNRESOLVED") {
  console.log("[INFO] Closing task with UNRESOLVED status.");
  exitCode = 2;
}

receipt.status = "closed";

let continuitySummary = null;
if (receipt.continuity && receipt.continuity.isActive) {
  const current = getContinuityState(root);
  continuitySummary = {
    pendingAction: manifest.continuity.pending_action,
    headHandover: current.headHandover.relPath,
    headTodo: current.headTodo.relPath,
    pendingTodo: current.pendingTodo.relPath
  };
}

receipt.closeResult = {
  manifestHash: manifestHash,
  status: impact,
  exitCode: exitCode,
  generation: receipt.generation,
  classification: receipt.classification || "complex",
  impactedFiles: [...manifest.knowledge_files_impacted],
  continuitySummary,
  closedAt: new Date().toISOString()
};

try {
  writeReceipt(root, taskId, receipt);
} catch (e) {
  console.error(`[ERROR] ${e.message}`);
  process.exit(1);
}

console.log(`[SUCCESS] Phase close complete with exit code ${exitCode}.`);
process.exit(exitCode);
