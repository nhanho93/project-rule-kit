import fs from "node:fs";
import path from "node:path";
import { checkContainment } from "./agent-compliance-state.mjs";
import { checkAdvance } from "./agent-compliance-continuity.mjs";

export function rejectSecrets(obj) {
  if (typeof obj === "string") {
    if (/(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36}/.test(obj) || /\bsk-[a-zA-Z0-9]{32,}\b/.test(obj) || /\bAKIA[0-9A-Z]{16}\b/.test(obj) || /\bBearer\s+[\w\-.]+/i.test(obj) || /\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/.test(obj)) {
      throw new Error("Manifest contains known credential patterns. Rejected.");
    }
    return;
  }
  if (!obj || typeof obj !== "object") return;
  const badSegments = new Set(["token", "secret", "password", "authorization", "cookie", "credential", "bearer", "jwt"]);
  const badCompounds = new Set(["apikey", "api_key", "clientsecret", "accesstoken"]);

  for (const k of Object.keys(obj)) {
    const lowerK = k.toLowerCase();
    const segments = lowerK.split(/[-_]/);
    const compound = lowerK.replace(/[-_]/g, '');

    if (segments.some(seg => badSegments.has(seg)) || badCompounds.has(compound)) {
      throw new Error("Manifest contains credential-looking keys. Rejected.");
    }
    rejectSecrets(obj[k]);
  }
}

export function validateManifestBasic(manifest, taskId, expectedClassification = "complex") {
  rejectSecrets(manifest);

  if (manifest.schema_version !== 1) {
    throw new Error("Manifest schema_version must be 1.");
  }
  if (manifest.task_id !== taskId) {
    throw new Error("Manifest task_id does not match --task-id.");
  }
  const declaredClassification = manifest.classification || manifest.complexity;
  if (declaredClassification !== expectedClassification) {
    throw new Error("Manifest classification must match the task receipt.");
  }

  const impact = manifest.knowledge_impact;
  if (!["CHANGED", "NO_CHANGE", "UNRESOLVED"].includes(impact)) {
    throw new Error("Invalid knowledge_impact in manifest.");
  }

  if (!Array.isArray(manifest.knowledge_files_impacted)) {
    throw new Error("knowledge_files_impacted must be an array.");
  }

  const uniqueImpacted = new Set(manifest.knowledge_files_impacted);
  if (uniqueImpacted.size !== manifest.knowledge_files_impacted.length) {
    throw new Error("knowledge_files_impacted must contain unique entries.");
  }
  if (manifest.knowledge_files_impacted.some(file => typeof file !== "string" || file.trim() === "")) {
    throw new Error("knowledge_files_impacted entries must be nonblank strings.");
  }

  if (!manifest.reason || typeof manifest.reason !== "string" || manifest.reason.trim() === "") {
    throw new Error("reason must be a provided nonblank string.");
  }
  validateDeliveryEvidence(manifest.delivery);

  return impact;
}

function validateDeliveryEvidence(delivery) {
  if (delivery === undefined) return;
  if (!delivery || typeof delivery !== "object" || Array.isArray(delivery)) throw new Error("delivery must be an object when provided.");
  const allowed = new Set(["git", "vm", "deployment", "migration"]);
  if (!Array.isArray(delivery.operations) || delivery.operations.length === 0) throw new Error("delivery.operations must be a non-empty array.");
  if (new Set(delivery.operations).size !== delivery.operations.length || delivery.operations.some(op => !allowed.has(op))) {
    throw new Error("delivery.operations must contain unique supported operations.");
  }
  if (typeof delivery.target !== "string" || delivery.target.trim() === "") throw new Error("delivery.target must be a sanitized nonblank reference.");
  if (delivery.authorized !== true) throw new Error("delivery.authorized must be true for recorded delivery operations.");
  if (!Array.isArray(delivery.evidence) || delivery.evidence.length === 0) throw new Error("delivery.evidence must be a non-empty array.");
  for (const item of delivery.evidence) {
    if (!item || typeof item !== "object" || typeof item.action !== "string" || item.action.trim() === "" || typeof item.result !== "string" || item.result.trim() === "") {
      throw new Error("delivery.evidence entries require nonblank action and result.");
    }
  }
}

export function validateVerification(manifest, impact, root) {
  if (!Array.isArray(manifest.verification) || manifest.verification.length === 0) {
    throw new Error("verification must be a non-empty array.");
  }

  for (const ver of manifest.verification) {
    if (!ver.command || typeof ver.command !== "string" || ver.command.trim() === "") {
      throw new Error("verification entries must have a nonblank command.");
    }
    if (!Number.isInteger(ver.exit_code)) {
      throw new Error("verification entries must have an integer exit_code.");
    }
    if (impact !== "UNRESOLVED" && ver.exit_code !== 0) {
      throw new Error("verification exit_code must be 0 for CHANGED/NO_CHANGE.");
    }

    const hasEvidence = ver.evidence_path && typeof ver.evidence_path === "string" && ver.evidence_path.trim() !== "";
    const hasSummary = ver.sanitized_output_summary && typeof ver.sanitized_output_summary === "string" && ver.sanitized_output_summary.trim() !== "";

    if (!hasEvidence && !hasSummary) {
      throw new Error("verification requires existing evidence_path or nonblank sanitized_output_summary.");
    }

    if (hasSummary && ver.sanitized_output_summary.length > 10000) {
        throw new Error("sanitized_output_summary exceeds bounded length");
    }

    if (hasEvidence) {
      if (!checkContainment(root, ver.evidence_path)) {
        throw new Error("Path traversal, symlink escape, or invalid containment detected in evidence_path.");
      }
      const p = path.resolve(root, ver.evidence_path);
      if (!fs.existsSync(p) || !fs.statSync(p).isFile()) {
        throw new Error("evidence_path must be an existing file.");
      }
    }
  }
}

export function validateImpactSet(manifest, impact, changedDocs) {
  if (impact === "CHANGED") {
    if (manifest.knowledge_files_impacted.length === 0) {
      throw new Error("knowledge_files_impacted must be nonempty for CHANGED.");
    }
    for (const f of manifest.knowledge_files_impacted) {
      if (!changedDocs.includes(f)) {
        throw new Error(`Listed impacted file ${f} did not actually change.`);
      }
    }
    for (const doc of changedDocs) {
      if (!manifest.knowledge_files_impacted.includes(doc)) {
        throw new Error(`Canonical file ${doc} changed but is not listed in knowledge_files_impacted.`);
      }
    }
  } else if (impact === "NO_CHANGE") {
    if (manifest.knowledge_files_impacted.length > 0) {
      throw new Error("knowledge_files_impacted must be empty for NO_CHANGE.");
    }
    if (changedDocs.length > 0) {
      throw new Error("Declared NO_CHANGE, but canonical knowledge files were modified.");
    }
  } else if (impact === "UNRESOLVED") {
    if (!manifest.unresolved || typeof manifest.unresolved.owner !== "string" || manifest.unresolved.owner.trim() === "" || typeof manifest.unresolved.next_action !== "string" || manifest.unresolved.next_action.trim() === "") {
      throw new Error("UNRESOLVED requires nonblank unresolved.owner and unresolved.next_action in manifest.");
    }
    if (manifest.knowledge_files_impacted.length === 0) {
      throw new Error("UNRESOLVED requires nonempty impacted files.");
    }
    for (const doc of changedDocs) {
      if (!manifest.knowledge_files_impacted.includes(doc)) {
        throw new Error(`Canonical file ${doc} changed but is not listed in knowledge_files_impacted for UNRESOLVED.`);
      }
    }
  }
}

export function validateContinuityManifest(manifest, impact, currentState, receipt, root, currentHandoverHash, currentTodoHash, currentPendingHash) {
  if (!manifest.continuity || !manifest.continuity.pending_action) {
    throw new Error("continuity.pending_action is required in manifest when continuity is active.");
  }

  const { pending_action, reason } = manifest.continuity;
  if (!["UPDATED", "NO_CHANGE"].includes(pending_action)) {
    throw new Error("continuity.pending_action must be UPDATED or NO_CHANGE.");
  }

  if (impact === "UNRESOLVED" && pending_action !== "UPDATED") {
     throw new Error("UNRESOLVED requires continuity.pending_action to be UPDATED actual delta.");
  }

  const headHandoverAdvanced = checkAdvance(currentState.headHandover, receipt.continuity.headHandover, receipt.continuity.hashes[receipt.continuity.headHandover], "handover", root, currentHandoverHash);
  const headTodoAdvanced = checkAdvance(currentState.headTodo, receipt.continuity.headTodo, receipt.continuity.hashes[receipt.continuity.headTodo], "todo", root, currentTodoHash);

  if (!headHandoverAdvanced || !headTodoAdvanced) {
    throw new Error("Continuity head docs (handover and todo) must be monotonically updated or advanced in suffix.");
  }

  const receiptPendingHash = receipt.continuity.pendingTodo ? receipt.continuity.hashes[receipt.continuity.pendingTodo] : null;

  if (pending_action === "UPDATED") {
    if (currentPendingHash === receiptPendingHash) {
      throw new Error("Manifest declares pending_action UPDATED, but pending_todo hash did not change.");
    }
  } else if (pending_action === "NO_CHANGE") {
    if (currentPendingHash !== receiptPendingHash) {
      throw new Error("Manifest declares pending_action NO_CHANGE, but pending_todo hash changed.");
    }
    if (!reason || typeof reason !== "string" || reason.trim() === "") {
      throw new Error("Manifest must provide a concrete nonblank continuity.reason for NO_CHANGE.");
    }
  }
}
