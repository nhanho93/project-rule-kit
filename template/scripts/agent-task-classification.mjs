export const BASIC_SIGNALS = ["single_domain", "small_reversible"];
export const COMPLEX_SIGNALS = [
  "multi_file", "multi_domain", "unclear_requirements", "shared_contract",
  "user_workflow", "e2e_required", "architecture_change"
];
export const CRITICAL_SIGNALS = [
  "auth_rbac", "database_change", "data_mutation", "production_mutation",
  "deployment", "git_history_rewrite", "secrets_permissions", "cross_system",
  "concurrency_jobs"
];

const ALL_SIGNALS = new Set([...BASIC_SIGNALS, ...COMPLEX_SIGNALS, ...CRITICAL_SIGNALS]);

export function validateClassification(classification, signals, summary, source = "policy", confirmationRef = null) {
  if (!["basic", "complex", "critical"].includes(classification)) {
    throw new Error("--classification must be basic, complex, or critical.");
  }
  if (typeof summary !== "string" || summary.trim().length < 8 || summary.length > 500) {
    throw new Error("--request-summary must be sanitized and contain 8-500 characters.");
  }
  rejectUnsafeText(summary, "request summary");
  if (!Array.isArray(signals) || signals.length === 0) throw new Error("At least one --signal is required.");
  if (!["policy", "user_confirmed"].includes(source)) throw new Error("--classification-source must be policy or user_confirmed.");
  if (source === "user_confirmed" && (typeof confirmationRef !== "string" || confirmationRef.trim().length < 8 || confirmationRef.length > 200)) {
    throw new Error("User-confirmed classification requires a sanitized 8-200 character --confirmation-ref.");
  }
  if (confirmationRef) rejectUnsafeText(confirmationRef, "confirmation reference");
  if (new Set(signals).size !== signals.length) throw new Error("Classification signals must be unique.");
  const invalid = signals.filter(signal => !ALL_SIGNALS.has(signal));
  if (invalid.length) throw new Error(`Unsupported classification signal: ${invalid.join(", ")}`);

  const critical = signals.filter(signal => CRITICAL_SIGNALS.includes(signal));
  const complex = signals.filter(signal => COMPLEX_SIGNALS.includes(signal));
  if (critical.length && classification !== "critical") {
    throw new Error(`Critical signal requires critical classification: ${critical.join(", ")}`);
  }
  if (classification === "critical" && critical.length === 0) {
    throw new Error("Critical classification requires at least one critical signal.");
  }
  if ((classification === "critical" || signals.includes("unclear_requirements")) && source !== "user_confirmed") {
    throw new Error("Critical or unclear classification requires user_confirmed source.");
  }
  if (classification === "complex" && complex.length === 0) {
    throw new Error("Complex classification requires at least one complex signal.");
  }
  if (classification === "basic") {
    const missing = BASIC_SIGNALS.filter(signal => !signals.includes(signal));
    if (missing.length || complex.length) {
      throw new Error("Basic classification requires only basic risk plus both single_domain and small_reversible signals.");
    }
  }
  return { classification, signals: [...signals], requestSummary: summary.trim(), classificationSource: source, confirmationRef: confirmationRef?.trim() || null };
}

function rejectUnsafeText(value, label) {
  if (/\r|\n|[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value)) throw new Error(`${label} must be one sanitized line.`);
  if (/\bBearer\s+[\w.-]+|\bAKIA[0-9A-Z]{16}\b|\bsk-[A-Za-z0-9]{32,}\b|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/i.test(value)) {
    throw new Error(`${label} contains credential-looking content.`);
  }
}

export function requiredPlanSections(classification) {
  const common = [
    "TASK_CLASSIFICATION", "GOAL", "NON_GOALS", "DISCOVERY_EVIDENCE",
    "IMPLEMENTATION_STEPS", "DELIVERY_SLICES", "DEPENDENCY_EDGES",
    "ACCEPTANCE_CRITERIA", "VERIFICATION", "QC_DECISION", "ROLLBACK",
    "APPROVAL"
  ];
  return classification === "critical"
    ? [...common, "AUTHORIZATION_BOUNDARY", "FAILURE_RECOVERY"]
    : common;
}

function planSectionBody(content, section) {
  const label = section.replaceAll("_", "[ _-]");
  const header = new RegExp(`^#{1,6}\\s+${label}\\s*$`, "im");
  const match = header.exec(content);
  if (!match) return "";
  const remainder = content.slice(match.index + match[0].length).replace(/^\r?\n/, "");
  const nextHeading = remainder.search(/^#{1,6}\s+/m);
  return (nextHeading >= 0 ? remainder.slice(0, nextHeading) : remainder).trim();
}

export function validatePlanContent(content, classification, receiptSignals) {
  if (typeof content !== "string" || content.length < 200) throw new Error("Plan must contain at least 200 characters.");
  if (/\b(?:TODO|TBD|FIXME|REVIEW_REQUIRED)\b/i.test(content)) throw new Error("Plan contains unresolved placeholder markers.");
  for (const section of requiredPlanSections(classification)) {
    const pattern = new RegExp(`^#{1,6}\\s+${section.replaceAll("_", "[ _-]")}\\s*$`, "im");
    if (!pattern.test(content)) throw new Error(`Plan is missing required section: ${section}.`);
    if (planSectionBody(content, section).length < 12) throw new Error(`Plan section is empty or too shallow: ${section}.`);
  }
  const classMatch = content.match(/^TASK_CLASSIFICATION\s*:\s*(basic|complex|critical)\s*$/im);
  if (!classMatch || classMatch[1] !== classification) throw new Error("Plan TASK_CLASSIFICATION does not match receipt.");
  const signalMatch = content.match(/^SIGNALS\s*:\s*(.+)$/im);
  if (!signalMatch) throw new Error("Plan must declare SIGNALS.");
  const planSignals = signalMatch[1].split(",").map(value => value.trim()).filter(Boolean);
  if (planSignals.length !== receiptSignals.length || receiptSignals.some(signal => !planSignals.includes(signal))) {
    throw new Error("Plan SIGNALS do not match receipt signals.");
  }
  const approval = content.match(/^APPROVAL_STATUS\s*:\s*(APPROVED|NOT_REQUIRED)\s*$/im)?.[1];
  if (!approval) throw new Error("Plan must declare APPROVAL_STATUS: APPROVED or NOT_REQUIRED.");
  if ((classification === "critical" || receiptSignals.includes("unclear_requirements")) && approval !== "APPROVED") {
    throw new Error("Critical or unclear plan requires APPROVAL_STATUS: APPROVED.");
  }
  validateExecutionGraph(content);
  return { approvalStatus: approval };
}

function sectionBody(content, section) {
  return planSectionBody(content, section);
}

function validateExecutionGraph(content) {
  const slices = [...sectionBody(content, "DELIVERY_SLICES").matchAll(/^\s*SLICE\s+([A-Z][A-Z0-9_-]*)\s*:\s*(.{8,})$/gim)];
  const ids = slices.map(match => match[1].toUpperCase());
  if (ids.length === 0) throw new Error("DELIVERY_SLICES must declare at least one 'SLICE <ID>: <outcome>'.");
  if (new Set(ids).size !== ids.length) throw new Error("DELIVERY_SLICES IDs must be unique.");

  const known = new Set(ids);
  const declared = new Map();
  const lines = sectionBody(content, "DEPENDENCY_EDGES").split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  for (const line of lines) {
    const match = line.match(/^([A-Z][A-Z0-9_-]*)\s*<-\s*(NONE|[A-Z][A-Z0-9_,-]*(?:\s*,\s*[A-Z][A-Z0-9_-]*)*)$/i);
    if (!match) throw new Error(`Invalid DEPENDENCY_EDGES line: ${line}`);
    const id = match[1].toUpperCase();
    if (!known.has(id)) throw new Error(`DEPENDENCY_EDGES references unknown slice: ${id}`);
    if (declared.has(id)) throw new Error(`DEPENDENCY_EDGES declares ${id} more than once.`);
    const blockers = match[2].toUpperCase() === "NONE" ? [] : match[2].split(",").map(value => value.trim().toUpperCase());
    for (const blocker of blockers) {
      if (!known.has(blocker)) throw new Error(`DEPENDENCY_EDGES references unknown blocker: ${blocker}`);
      if (blocker === id) throw new Error(`DEPENDENCY_EDGES contains a self-cycle: ${id}`);
    }
    declared.set(id, blockers);
  }
  for (const id of ids) if (!declared.has(id)) throw new Error(`DEPENDENCY_EDGES is missing slice: ${id}`);

  const visiting = new Set();
  const visited = new Set();
  const visit = id => {
    if (visiting.has(id)) throw new Error(`DEPENDENCY_EDGES contains a cycle at ${id}.`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const blocker of declared.get(id) || []) visit(blocker);
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of ids) visit(id);
}
