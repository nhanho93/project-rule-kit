#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryDir = path.join(root, ".agent-system", "registry");
const platforms = ["cursor", "codex", "antigravity"];
const files = ["skills.json", "policies.json", "capabilities.json", "agents.json"];
const extensionsFile = "extensions.json";

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(registryDir, file), "utf8"));
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function resolveContained(rel) {
  if (typeof rel !== "string" || !rel.trim() || path.isAbsolute(rel)) return null;
  const resolved = path.resolve(root, rel);
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return resolved;
}

function checkEntrypointPolicy(item, source, errors) {
  const policy = item.entrypointPolicy;
  if (policy === undefined) return;
  if (!policy || typeof policy !== "object" || Array.isArray(policy)) {
    errors.push(`${source}:${item.id}: entrypointPolicy must be an object`);
    return;
  }
  if (policy.allowOver200 !== true) errors.push(`${source}:${item.id}: entrypointPolicy.allowOver200 must be true`);
  for (const field of ["reason", "followupOwner", "nextAction"]) {
    if (typeof policy[field] !== "string" || policy[field].trim().length < 8) {
      errors.push(`${source}:${item.id}: entrypointPolicy.${field} must contain at least 8 characters`);
    }
  }
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
      checkEntrypointPolicy(item, file, errors);
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

const extensionsPath = path.join(registryDir, extensionsFile);
const extensions = fs.existsSync(extensionsPath) ? readJson(extensionsFile) : [];
if (!Array.isArray(extensions)) {
  errors.push(`${extensionsFile}: expected array`);
} else {
  const extensionIds = new Set();
  for (const extension of extensions) {
    count += 1;
    if (!extension?.id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(extension.id)) {
      errors.push(`${extensionsFile}: extension id must use lower-case kebab-case`);
      continue;
    }
    if (extensionIds.has(extension.id)) errors.push(`${extensionsFile}:${extension.id}: duplicate extension id`);
    if (seen.has(extension.id)) errors.push(`${extensionsFile}:${extension.id}: id collides with a primary registry item`);
    extensionIds.add(extension.id);
    if (typeof extension.owner !== "string" || extension.owner.trim().length < 3) {
      errors.push(`${extensionsFile}:${extension.id}: owner is required`);
    }
    const validator = resolveContained(extension.validator);
    if (!validator || path.extname(validator) !== ".mjs" || !fs.existsSync(validator)) {
      errors.push(`${extensionsFile}:${extension.id}: validator must be an existing contained .mjs file`);
    } else if (validator === path.resolve(root, "scripts", "check-agent-config-registry.mjs")) {
      errors.push(`${extensionsFile}:${extension.id}: validator cannot recursively invoke the primary registry checker`);
    }
    if (!Array.isArray(extension.sources) || extension.sources.length === 0) {
      errors.push(`${extensionsFile}:${extension.id}: sources must be a non-empty array`);
    } else {
      for (const source of extension.sources) {
        const resolved = resolveContained(source);
        if (!resolved || !fs.existsSync(resolved)) errors.push(`${extensionsFile}:${extension.id}: missing source ${source}`);
      }
    }
    extension.resolvedValidator = validator;
  }
}

if (errors.length === 0) {
  for (const extension of extensions) {
    const result = spawnSync(process.execPath, [extension.resolvedValidator, "--root", root], {
      cwd: root,
      encoding: "utf8",
      timeout: 30000
    });
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.error) errors.push(`${extensionsFile}:${extension.id}: extension validator error: ${result.error.message}`);
    else if (result.status !== 0) errors.push(`${extensionsFile}:${extension.id}: extension validator failed with exit ${result.status}`);
  }
}

console.log("[START] check-agent-config-registry");
console.log(`items=${count}`);
console.log(`errors=${errors.length}`);
for (const error of errors) console.error(error);
console.log(errors.length ? "[ERROR] check-agent-config-registry FAIL" : "[END] check-agent-config-registry PASS");
process.exit(errors.length ? 1 : 0);
