import fs from "node:fs";
import path from "node:path";
import { sha256 } from "./rulekit-integrity-lib.mjs";

export function normalizeSkill(content) {
  const normalized = content.replace(/\r\n/g, "\n");
  return normalized.replace(/^---\n([\s\S]*?)\n---/, (_, body) => {
    const kept = body.split("\n").filter(line => !/^(date_added|last_verified|generated_at):/.test(line));
    return `---\n${kept.join("\n")}\n---`;
  }).replace(/[ \t]+$/gm, "").trim();
}

export function collectSkillDrift(root) {
  const registry = JSON.parse(fs.readFileSync(path.join(root, ".agent-system", "registry", "skills.json"), "utf8"));
  return Object.fromEntries(registry.map(item => {
    const file = path.join(root, item.canonical);
    return [item.id, sha256(normalizeSkill(fs.readFileSync(file, "utf8")))];
  }).sort(([a], [b]) => a.localeCompare(b)));
}

export function compareSkillDrift(baseline, current) {
  const before = baseline.skills || {};
  const beforeIds = new Set(Object.keys(before));
  const currentIds = new Set(Object.keys(current));
  return {
    added: [...currentIds].filter(id => !beforeIds.has(id)).sort(),
    removed: [...beforeIds].filter(id => !currentIds.has(id)).sort(),
    changed: [...currentIds].filter(id => beforeIds.has(id) && before[id] !== current[id]).sort()
  };
}
