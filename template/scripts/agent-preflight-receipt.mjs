import fs from "node:fs";
import { hashWorkspace } from "./agent-project-baseline.mjs";

export function buildPreflightReceipt({
  root, taskId, generation, classificationResult, requiredContextFiles,
  canonicalHashes, continuity, continuityHashes, existingReceipt
}) {
  return {
    schemaVersion: 2,
    generation,
    projectRoot: fs.realpathSync(root),
    taskId,
    createdAt: new Date().toISOString(),
    mode: "classified",
    classification: classificationResult.classification,
    classificationSignals: classificationResult.signals,
    classificationSource: classificationResult.classificationSource,
    confirmationRef: classificationResult.confirmationRef,
    requestSummary: classificationResult.requestSummary,
    workspaceBaseline: hashWorkspace(root),
    status: classificationResult.classification === "basic" ? "open" : "planning",
    plan: null,
    requiredContextFiles,
    canonicalHashes,
    continuity: {
      isActive: continuity.isActive,
      headHandover: continuity.isActive ? continuity.headHandover.relPath : null,
      headTodo: continuity.isActive ? continuity.headTodo.relPath : null,
      pendingTodo: continuity.isActive ? continuity.pendingTodo.relPath : null,
      hashes: continuityHashes
    },
    history: existingReceipt
      ? [...(existingReceipt.history || []), existingReceipt.closeResult].filter(Boolean)
      : []
  };
}
