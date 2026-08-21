#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryDir = path.join(root, ".agent-system", "registry");
const platforms = ["cursor", "codex", "antigravity"];
const files = ["skills.json", "policies.json", "capabilities.json", "agents.json"];

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(registryDir, file), "utf8"));
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function checkItem(item, source, errors) {
  if (!item.id) errors.push(`${source}: missing id`);
  if (!item.scope) errors.push(`${source}:${item.id}: missing scope`);
  if (!item.owner) errors.push(`${source}:${item.id}: missing owner`);

  if (item.canonical && !exists(item.canonical)) {
    errors.push(`${source}:${item.id}: missing canonical ${item.canonical}`);
  }

  if (item.scope === "shared") {
    for (const platform of platforms) {
      const adapter = item.adapters?.[platform];
      if (!adapter) {
        errors.push(`${source}:${item.id}: missing ${platform} adapter`);
      } else if (!exists(adapter)) {
        errors.push(`${source}:${item.id}: missing ${platform} adapter path ${adapter}`);
      }
    }
  } else {
    for (const platform of platforms) {
      if (platform === item.scope) continue;
      if (!item.exclusions?.[platform]) {
        errors.push(`${source}:${item.id}: missing ${platform} exclusion`);
      }
    }
  }
}

const seen = new Set();
const errors = [];
let count = 0;
const skillBranchOwners = new Map();

for (const file of files) {
  const rows = readJson(file);
  if (!Array.isArray(rows)) errors.push(`${file}: expected array`);
  for (const item of rows) {
    count += 1;
    if (seen.has(item.id)) errors.push(`${file}:${item.id}: duplicate id`);
    seen.add(item.id);
    checkItem(item, file, errors);
    if (file === "skills.json") {
      if (!["user", "model", "both"].includes(item.invocationMode)) {
        errors.push(`${file}:${item.id}: invocationMode must be user, model, or both`);
      }
      if (!Array.isArray(item.triggerBranches) || item.triggerBranches.length === 0) {
        errors.push(`${file}:${item.id}: triggerBranches must be a non-empty array`);
      } else {
        if (new Set(item.triggerBranches).size !== item.triggerBranches.length) {
          errors.push(`${file}:${item.id}: triggerBranches must be unique`);
        }
        for (const branch of item.triggerBranches) {
          if (typeof branch !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(branch)) {
            errors.push(`${file}:${item.id}: invalid trigger branch ${JSON.stringify(branch)}`);
            continue;
          }
          if (item.invocationMode === "user") continue;
          const owner = skillBranchOwners.get(branch);
          if (owner && owner !== item.id) {
            errors.push(`${file}: trigger branch ${branch} overlaps ${owner} and ${item.id}`);
          } else {
            skillBranchOwners.set(branch, item.id);
          }
        }
      }
    }
  }
}

console.log("[START] check-agent-config-registry");
console.log(`items=${count}`);
console.log(`errors=${errors.length}`);
for (const error of errors) console.error(error);
console.log(errors.length ? "[ERROR] check-agent-config-registry FAIL" : "[END] check-agent-config-registry PASS");
process.exit(errors.length ? 1 : 0);
