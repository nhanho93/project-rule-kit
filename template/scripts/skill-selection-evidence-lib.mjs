import fs from "node:fs";
import path from "node:path";
import { fileDigest, readJson, REQUIRED_DIMENSIONS, valueDigest } from "./rulekit-integrity-lib.mjs";

const STATUSES = new Set(["covered", "gap", "not-applicable"]);
const isRelativeSafe = value => typeof value === "string" && value.length > 0
  && !path.isAbsolute(value) && !value.split(/[\\/]/).includes("..");

export function buildSelectionEvidence(root, coverage) {
  const errors = [];
  if (coverage.schemaVersion !== 1 || !Array.isArray(coverage.dimensions)) {
    throw new Error("RULEKIT_SELECTION_SCHEMA_INVALID");
  }
  const registry = readJson(path.join(root, ".agent-system", "registry", "skills.json"));
  const knownSkills = new Set(registry.map(item => item.id));
  const ids = coverage.dimensions.map(item => item.id);
  if (ids.length !== REQUIRED_DIMENSIONS.length || new Set(ids).size !== ids.length
    || REQUIRED_DIMENSIONS.some(id => !ids.includes(id))) errors.push("RULEKIT_SELECTION_DIMENSIONS_INCOMPLETE");

  const dimensions = coverage.dimensions.map(item => {
    if (!STATUSES.has(item.status)) errors.push(`RULEKIT_SELECTION_STATUS_INVALID:${item.id}`);
    if (!Array.isArray(item.skillIds) || !Array.isArray(item.evidencePaths)) {
      errors.push(`RULEKIT_SELECTION_ARRAY_INVALID:${item.id}`);
    }
    const skillIds = [...new Set(item.skillIds || [])].sort();
    const evidencePaths = [...new Set(item.evidencePaths || [])].sort();
    if (skillIds.some(id => !knownSkills.has(id))) errors.push(`RULEKIT_SELECTION_UNKNOWN_SKILL:${item.id}`);
    if (evidencePaths.some(file => !isRelativeSafe(file))) errors.push(`RULEKIT_SELECTION_PATH_UNSAFE:${item.id}`);
    if (item.status === "covered" && (skillIds.length === 0 || evidencePaths.length === 0)) {
      errors.push(`RULEKIT_SELECTION_COVERED_WITHOUT_EVIDENCE:${item.id}`);
    }
    if (item.status !== "covered" && skillIds.length > 0) errors.push(`RULEKIT_SELECTION_NONCOVERED_HAS_SKILLS:${item.id}`);
    const evidence = evidencePaths.map(relative => {
      const absolute = path.resolve(root, relative);
      if (!absolute.startsWith(`${path.resolve(root)}${path.sep}`) || !fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
        errors.push(`RULEKIT_SELECTION_EVIDENCE_MISSING:${item.id}`);
        return { path: relative, digest: null };
      }
      return { path: relative.split(path.sep).join("/"), digest: fileDigest(absolute) };
    });
    return { id: item.id, status: item.status, reason: item.reason || "", skillIds, evidence };
  }).sort((a, b) => a.id.localeCompare(b.id));
  if (errors.length) throw new Error([...new Set(errors)].join(", "));

  const fingerprintFiles = [
    "docs/agent-rules/project-profile.md", "docs/agent-rules/project-structure.md",
    "docs/agent-rules/code-conventions.md", "docs/agent-rules/domain-glossary.md",
    "docs/agent-rules/delivery-profile.md"
  ].filter(relative => fs.existsSync(path.join(root, ...relative.split("/"))))
    .map(relative => ({ path: relative, digest: fileDigest(path.join(root, ...relative.split("/"))) }));
  const payload = {
    schemaVersion: 1,
    kind: "rulekit.selection-evidence",
    projectFingerprint: valueDigest(fingerprintFiles),
    registryDigest: valueDigest(registry),
    selectedSkillIds: [...new Set(dimensions.flatMap(item => item.skillIds))].sort(),
    dimensions,
    fingerprintFiles
  };
  return { schemaVersion: 1, digest: valueDigest(payload), payload };
}

export function validateSelectionEvidence(root, coverage, evidence) {
  const current = buildSelectionEvidence(root, coverage);
  const errors = [];
  if (evidence.schemaVersion !== 1) errors.push("RULEKIT_SELECTION_EVIDENCE_SCHEMA_INVALID");
  if (evidence.digest !== current.digest) errors.push("RULEKIT_SELECTION_EVIDENCE_STALE");
  return errors;
}
