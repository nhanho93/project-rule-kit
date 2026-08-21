#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  checkContainment, hashFile, readReceipt, validatePlanContent,
  validateReceipt, validateTaskId, writeReceipt
} from "./agent-compliance-lib.mjs";
import { hashWorkspace } from "./agent-project-baseline.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const valueOf = flag => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : null;
};
const taskId = valueOf("--task-id");
const planArg = valueOf("--plan");
const refresh = args.includes("--refresh");

console.log("[START] agent-plan-gate");
try {
  validateTaskId(taskId);
  if (!planArg) throw new Error("--plan <path> is required.");
  const receipt = readReceipt(root, taskId);
  if (!receipt) throw new Error(`Receipt for task ${taskId} not found.`);
  validateReceipt(receipt, taskId, root);
  if (receipt.schemaVersion !== 2 || !["complex", "critical"].includes(receipt.classification)) {
    throw new Error("Plan gate applies only to schema v2 complex/critical tasks.");
  }
  if (receipt.status === "closed") throw new Error("Cannot gate a closed task.");
  if (receipt.status === "open" && !refresh) throw new Error("Open task plan changes require explicit --refresh.");
  if (receipt.status === "planning" && hashWorkspace(root) !== receipt.workspaceBaseline) {
    throw new Error("Workspace changed before initial plan approval; restore or reconcile project mutations before gating.");
  }

  const resolved = path.resolve(root, planArg);
  if (!checkContainment(root, resolved) || !fs.statSync(resolved).isFile()) {
    throw new Error("Plan must be an existing file inside project root and outside receipt state.");
  }
  const relative = path.relative(root, resolved).replace(/\\/g, "/");
  if (!relative.startsWith("tasks/plans/")) throw new Error("Plan must be stored under tasks/plans/ for planning-stage mutation isolation.");
  const content = fs.readFileSync(resolved, "utf8");
  const result = validatePlanContent(content, receipt.classification, receipt.classificationSignals);
  receipt.plan = {
    path: relative,
    hash: hashFile(resolved),
    approvalStatus: result.approvalStatus,
    gatedAt: new Date().toISOString()
  };
  if (!receipt.requiredContextFiles.includes(relative)) receipt.requiredContextFiles.push(relative);
  receipt.status = "open";
  writeReceipt(root, taskId, receipt);
  console.log(`[SUCCESS] Plan gate passed for ${receipt.classification} task ${taskId}.`);
} catch (error) {
  console.error(`[ERROR] ${error.message}`);
  process.exitCode = 1;
}
