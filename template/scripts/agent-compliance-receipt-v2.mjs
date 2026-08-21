import { validateClassification } from "./agent-task-classification.mjs";

const SHA256 = /^[a-f0-9]{64}$/i;
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

export function validateReceiptV2(receipt) {
  const result = validateClassification(receipt.classification, receipt.classificationSignals, receipt.requestSummary, receipt.classificationSource, receipt.confirmationRef);
  if (receipt.mode !== "classified") throw new Error("Schema v2 receipt mode must be classified.");
  if (typeof receipt.workspaceBaseline !== "string" || !SHA256.test(receipt.workspaceBaseline)) throw new Error("Schema v2 receipt workspaceBaseline missing or invalid.");
  if (!["planning", "open", "closed"].includes(receipt.status)) throw new Error("Schema v2 receipt status must be planning, open, or closed.");

  if (result.classification === "basic") {
    if (receipt.status === "planning") throw new Error("Basic receipt cannot remain in planning state.");
    if (receipt.plan !== null) throw new Error("Basic receipt must not contain a plan gate.");
  } else if (receipt.status === "planning") {
    if (receipt.plan !== null) throw new Error("Planning receipt must not contain an approved plan gate.");
    if (receipt.closeResult !== undefined && receipt.closeResult !== null) throw new Error("Planning receipt cannot contain closeResult.");
  } else {
    validatePlanGate(receipt.plan, result.classification);
    if (!receipt.requiredContextFiles.includes(receipt.plan.path)) throw new Error("Required context must include the gated plan.");
  }

  if (receipt.status === "closed" && receipt.closeResult?.classification !== result.classification) {
    throw new Error("closeResult classification must match receipt classification.");
  }
}

function validatePlanGate(plan, classification) {
  if (!plan || typeof plan !== "object" || Array.isArray(plan)) throw new Error("Complex/critical receipt requires a valid plan gate.");
  if (typeof plan.path !== "string" || plan.path.trim() === "") throw new Error("Plan gate path missing or invalid.");
  if (typeof plan.hash !== "string" || !SHA256.test(plan.hash)) throw new Error("Plan gate hash missing or invalid.");
  if (typeof plan.gatedAt !== "string" || !ISO.test(plan.gatedAt) || Number.isNaN(Date.parse(plan.gatedAt))) throw new Error("Plan gate timestamp missing or invalid.");
  if (!["APPROVED", "NOT_REQUIRED"].includes(plan.approvalStatus)) throw new Error("Plan gate approval status invalid.");
  if (classification === "critical" && plan.approvalStatus !== "APPROVED") throw new Error("Critical receipt requires approved plan gate.");
}
