import fs from "node:fs";
import path from "node:path";
import { getCanonicalDocs } from "./agent-compliance-knowledge.mjs";
import { validateReceiptV2 } from "./agent-compliance-receipt-v2.mjs";

export function validateTaskId(taskId) {
  if (!taskId || typeof taskId !== "string") {
    throw new Error("Task ID must be a provided string");
  }
  if (taskId.length < 1 || taskId.length > 128) {
    throw new Error("Task ID must be between 1 and 128 characters");
  }
  if (!/^[A-Za-z0-9_-]+$/.test(taskId)) {
    throw new Error("Task ID contains invalid characters.");
  }
  return taskId;
}

export function checkContainment(root, targetPath) {
  try {
    const resolvedTarget = path.resolve(root, targetPath);
    if (!fs.existsSync(resolvedTarget)) return false;
    const realRoot = fs.realpathSync(root);
    const realTarget = fs.realpathSync(resolvedTarget);
    const rel = path.relative(realRoot, realTarget);
    if (rel.startsWith("..") || path.isAbsolute(rel)) return false;
    const stateDir = path.join(realRoot, ".agent-system", "state");
    if (fs.existsSync(stateDir)) {
       const realStateDir = fs.realpathSync(stateDir);
       const relState = path.relative(realStateDir, realTarget);
       if (!relState.startsWith("..") && !path.isAbsolute(relState)) return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

export function writeReceipt(root, taskId, data) {
  validateTaskId(taskId);
  const stateDir = path.join(root, ".agent-system", "state");
  if (!fs.existsSync(stateDir)) fs.mkdirSync(stateDir, { recursive: true });

  const gitignorePath = path.join(stateDir, ".gitignore");
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, "*\n!.gitignore\n");
  } else {
    const content = fs.readFileSync(gitignorePath, "utf8");
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith("#"));
    if (!lines.includes("*") || !lines.includes("!.gitignore")) {
      throw new Error("Customized existing state .gitignore must retain effective standalone '*' and '!.gitignore' lines");
    }
  }

  const receiptPath = path.join(stateDir, `${taskId}.json`);
  const tempPath = receiptPath + ".tmp";
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
  fs.renameSync(tempPath, receiptPath);
}

export function readReceipt(root, taskId) {
  validateTaskId(taskId);
  const receiptPath = path.join(root, ".agent-system", "state", `${taskId}.json`);
  if (!fs.existsSync(receiptPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(receiptPath, "utf8"));
  } catch (e) {
    throw new Error(`Receipt for task ${taskId} is malformed JSON.`);
  }
}

export function validateReceipt(receipt, expectedTaskId, currentRoot) {
  if (!receipt || typeof receipt !== "object") throw new Error("Receipt must be an object.");
  if (![1, 2].includes(receipt.schemaVersion)) throw new Error("Unsupported receipt schema version.");
  if (receipt.taskId !== expectedTaskId) throw new Error("Receipt taskId does not match expected taskId.");

  const realRoot = fs.realpathSync(currentRoot);
  if (receipt.projectRoot !== realRoot) throw new Error("Receipt project root does not match current real root.");
  if (receipt.schemaVersion === 1 && receipt.mode !== "complex") throw new Error("Legacy receipt mode must be complex.");
  if (!Number.isInteger(receipt.generation) || receipt.generation < 1) throw new Error("Receipt generation must be a positive integer.");
  if (receipt.schemaVersion === 1 && receipt.status !== "open" && receipt.status !== "closed") throw new Error("Legacy receipt status must be open or closed.");
  if (typeof receipt.createdAt !== "string" || !isStrictIso(receipt.createdAt)) throw new Error("Receipt createdAt must be a valid ISO timestamp.");

  const canonicalDocs = getCanonicalDocs();
  if (!receipt.canonicalHashes || typeof receipt.canonicalHashes !== "object") throw new Error("Receipt canonicalHashes missing or invalid.");
  const hashKeys = Object.keys(receipt.canonicalHashes);
  if (hashKeys.length !== canonicalDocs.length) throw new Error("Receipt canonicalHashes must contain exactly the canonical docs.");
  for (const doc of canonicalDocs) {
    const hash = receipt.canonicalHashes[doc];
    if (!hash || typeof hash !== "string" || !/^[a-f0-9]{64}$/i.test(hash)) {
      throw new Error(`Receipt canonicalHashes must contain SHA256 for ${doc}.`);
    }
  }

  if (!Array.isArray(receipt.requiredContextFiles)) throw new Error("Receipt requiredContextFiles missing or invalid.");
  const uniqueCtx = new Set(receipt.requiredContextFiles);
  if (uniqueCtx.size !== receipt.requiredContextFiles.length) throw new Error("Receipt requiredContextFiles must be unique.");
  for (const doc of canonicalDocs) {
    if (!uniqueCtx.has(doc)) throw new Error(`Receipt requiredContextFiles must include canonical doc ${doc}.`);
  }
  if (receipt.schemaVersion === 2) validateReceiptV2(receipt);

  if (receipt.status === "closed") {
    if (!receipt.closeResult || typeof receipt.closeResult !== "object") throw new Error("Closed receipt requires valid closeResult.");
    const cr = receipt.closeResult;
    if (typeof cr.manifestHash !== "string" || !/^[a-f0-9]{64}$/i.test(cr.manifestHash)) throw new Error("closeResult manifestHash missing or invalid.");
    if (!["CHANGED", "NO_CHANGE", "UNRESOLVED"].includes(cr.status)) throw new Error("closeResult status invalid.");
    if (!Number.isInteger(cr.exitCode)) throw new Error("closeResult exitCode invalid.");
    if (cr.status === "UNRESOLVED" && cr.exitCode !== 2) throw new Error("closeResult exitCode must be 2 for UNRESOLVED.");
    if ((cr.status === "CHANGED" || cr.status === "NO_CHANGE") && cr.exitCode !== 0) throw new Error("closeResult exitCode must be 0 for CHANGED/NO_CHANGE.");
    if (!Number.isInteger(cr.generation) || cr.generation !== receipt.generation) throw new Error("closeResult generation invalid or mismatched.");
    if (!Array.isArray(cr.impactedFiles)) throw new Error("closeResult impactedFiles must be an exact array.");
    if (typeof cr.closedAt !== "string" || !isStrictIso(cr.closedAt)) throw new Error("closeResult closedAt missing or invalid ISO date.");
    validateContinuitySummary(cr.continuitySummary);
  } else if (receipt.closeResult !== undefined && receipt.closeResult !== null) {
    throw new Error("Open receipt must not contain closeResult.");
  }

  if (!receipt.continuity || typeof receipt.continuity !== "object") throw new Error("Receipt continuity missing or invalid.");
  {
     if (typeof receipt.continuity.isActive !== "boolean") throw new Error("receipt continuity.isActive must be boolean.");
     if (receipt.continuity.isActive) {
        if (!receipt.continuity.headHandover || typeof receipt.continuity.headHandover !== "string") throw new Error("Active continuity requires headHandover string.");
        if (!receipt.continuity.headTodo || typeof receipt.continuity.headTodo !== "string") throw new Error("Active continuity requires headTodo string.");
        if (!receipt.continuity.pendingTodo || typeof receipt.continuity.pendingTodo !== "string") throw new Error("Active continuity requires pendingTodo string.");
        if (!receipt.continuity.hashes || typeof receipt.continuity.hashes !== "object") throw new Error("Active continuity requires hashes object.");
        const cHashKeys = Object.keys(receipt.continuity.hashes);
        if (cHashKeys.length !== 3) throw new Error("Active continuity hashes must contain exactly three keys.");
        if (!cHashKeys.includes(receipt.continuity.headHandover) || !cHashKeys.includes(receipt.continuity.headTodo) || !cHashKeys.includes(receipt.continuity.pendingTodo)) {
           throw new Error("Active continuity hashes must contain exactly the head/pending paths.");
        }
        for (const h of cHashKeys) {
           if (!/^[a-f0-9]{64}$/i.test(receipt.continuity.hashes[h])) throw new Error(`Invalid continuity hash for ${h}`);
           if (!uniqueCtx.has(h)) throw new Error(`Active continuity context missing ${h}`);
        }
     } else {
        if (receipt.continuity.headHandover !== null || receipt.continuity.headTodo !== null || receipt.continuity.pendingTodo !== null) throw new Error("Inactive continuity must have null head/pending paths.");
        if (receipt.continuity.hashes && Object.keys(receipt.continuity.hashes).length > 0) throw new Error("Inactive continuity must have empty hashes.");
     }
  }

  if (!Array.isArray(receipt.history)) throw new Error("Receipt history must be an array.");
  {
    let prevGen = 0;
    for (const h of receipt.history) {
       if (!h || typeof h !== "object") throw new Error("History entries must be objects.");
       if (!Number.isInteger(h.generation) || h.generation <= prevGen) throw new Error("History generations must be strictly increasing.");
       if (h.generation >= receipt.generation) throw new Error("History generations must be less than current generation.");
       if (typeof h.manifestHash !== "string" || !/^[a-f0-9]{64}$/i.test(h.manifestHash)) throw new Error("History manifestHash invalid.");
       if (!['CHANGED', 'NO_CHANGE', 'UNRESOLVED'].includes(h.status)) throw new Error("History status invalid.");
       const expectedExit = h.status === 'UNRESOLVED' ? 2 : 0;
       if (h.exitCode !== expectedExit) throw new Error("History exitCode invalid.");
       if (!Array.isArray(h.impactedFiles)) throw new Error("History impactedFiles invalid.");
       if (typeof h.closedAt !== "string" || !isStrictIso(h.closedAt)) throw new Error("History closedAt invalid.");
       validateContinuitySummary(h.continuitySummary);
       prevGen = h.generation;
    }
  }

  return true;
}

function isStrictIso(value) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)
    && !Number.isNaN(Date.parse(value));
}

function validateContinuitySummary(summary) {
  if (summary === null) return;
  if (!summary || typeof summary !== "object" || Array.isArray(summary)) throw new Error("closeResult continuitySummary invalid.");
  if (!["UPDATED", "NO_CHANGE"].includes(summary.pendingAction)) throw new Error("closeResult continuitySummary pendingAction invalid.");
  for (const key of ["headHandover", "headTodo", "pendingTodo"]) {
    if (typeof summary[key] !== "string" || summary[key].trim() === "") throw new Error(`closeResult continuitySummary ${key} invalid.`);
  }
}
