import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const REQUIRED_DIMENSIONS = [
  "architecture-runtime", "languages-frameworks", "domain-behavior",
  "data-storage", "external-integrations", "testing-quality",
  "security-privacy", "user-experience-accessibility",
  "deployment-operations", "maintenance-workflow"
];

export const sha256 = value => crypto.createHash("sha256").update(value).digest("hex");
export const fileDigest = file => `sha256-${sha256(fs.readFileSync(file))}`;
export const stable = value => {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
  }
  return value;
};
export const valueDigest = value => `sha256-${sha256(JSON.stringify(stable(value)))}`;

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function computeDesiredState(root, options = {}) {
  const registryPath = path.join(root, ".agent-system", "registry", "skills.json");
  const profilePath = path.join(root, "docs", "agent-rules", "project-profile.md");
  const registry = readJson(registryPath);
  const packageVersion = options.kitVersion || "1.1.0";
  const platforms = [...new Set(registry.flatMap(item => Object.keys(item.adapters || {})))].sort();
  return {
    schemaVersion: 1,
    kit: { name: "project-rule-kit", version: packageVersion },
    installMode: "merge",
    platforms,
    registry: {
      path: ".agent-system/registry/skills.json",
      digest: valueDigest(registry),
      skillIds: registry.map(item => item.id).sort()
    },
    projectProfile: {
      path: "docs/agent-rules/project-profile.md",
      digest: fileDigest(profilePath)
    }
  };
}

export function validateDesiredState(root, manifest) {
  const errors = [];
  if (manifest.schemaVersion !== 1) errors.push("RULEKIT_STACK_SCHEMA_UNSUPPORTED");
  let current;
  try { current = computeDesiredState(root, { kitVersion: manifest.kit?.version }); }
  catch { return ["RULEKIT_STACK_INPUT_MISSING"]; }
  if (manifest.kit?.name !== current.kit.name) errors.push("RULEKIT_STACK_NAME_MISMATCH");
  if (manifest.installMode !== "merge") errors.push("RULEKIT_STACK_INSTALL_MODE_INVALID");
  if (JSON.stringify(manifest.platforms) !== JSON.stringify(current.platforms)) errors.push("RULEKIT_STACK_PLATFORM_DRIFT");
  if (manifest.registry?.digest !== current.registry.digest) errors.push("RULEKIT_STACK_REGISTRY_DRIFT");
  if (JSON.stringify(manifest.registry?.skillIds) !== JSON.stringify(current.registry.skillIds)) errors.push("RULEKIT_STACK_SKILL_DRIFT");
  if (manifest.projectProfile?.digest !== current.projectProfile.digest) errors.push("RULEKIT_STACK_PROFILE_DRIFT");
  return errors;
}

export function writeJsonAtomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(temporary, file);
}
