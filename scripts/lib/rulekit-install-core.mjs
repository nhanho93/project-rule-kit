import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const posix = value => value.split(path.sep).join("/");
const hashBuffer = value => crypto.createHash("sha256").update(value).digest("hex");
export const hashFile = file => hashBuffer(fs.readFileSync(file));
const stable = value => {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
  }
  return value;
};
const digest = value => `sha256-${hashBuffer(JSON.stringify(stable(value)))}`;
const TARGET_OVERRIDE_PATH = ".agent-system/rulekit-install-overrides.json";

function assertInside(root, candidate, label) {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  if (relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))) return;
  throw new Error(`${label} escapes its allowed root.`);
}

export function assertNoSymlinkComponents(root, candidate) {
  assertInside(root, candidate, "Target path");
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  let current = path.resolve(root);
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) {
      throw new Error(`Refusing symbolic-link target component: ${posix(path.relative(root, current))}`);
    }
  }
}

function shouldExclude(relative, config) {
  if (config.excludedPrefixes.some(prefix => relative.startsWith(prefix))) return true;
  const artifact = config.artifactDirectories.find(prefix => relative.startsWith(prefix));
  return Boolean(artifact && !config.artifactKeepNames.includes(path.posix.basename(relative)));
}

function normalizeOwnedEntry(value, label, prefix = false) {
  if (typeof value !== "string" || value.trim() !== value || value.length === 0) {
    throw new Error(`${label} entries must be non-empty trimmed strings.`);
  }
  const normalized = value.replaceAll("\\", "/");
  if (path.posix.isAbsolute(normalized) || /^[A-Za-z]:\//.test(normalized)) {
    throw new Error(`${label} entries must be relative paths.`);
  }
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length === 0 || segments.some(segment => segment === "." || segment === "..")) {
    throw new Error(`${label} contains an unsafe path: ${value}`);
  }
  const canonical = segments.join("/");
  return prefix ? `${canonical}/` : canonical;
}

function normalizeOwnershipConfig(value, label) {
  const paths = value.projectOwnedPaths ?? [];
  const prefixes = value.projectOwnedPrefixes ?? [];
  if (!Array.isArray(paths) || !Array.isArray(prefixes)) {
    throw new Error(`${label} ownership fields must be arrays.`);
  }
  const normalizedPaths = paths.map(item => normalizeOwnedEntry(item, `${label}.projectOwnedPaths`));
  const normalizedPrefixes = prefixes.map(item => normalizeOwnedEntry(item, `${label}.projectOwnedPrefixes`, true));
  if (new Set(normalizedPaths).size !== normalizedPaths.length || new Set(normalizedPrefixes).size !== normalizedPrefixes.length) {
    throw new Error(`${label} ownership entries must be unique.`);
  }
  return { projectOwnedPaths: normalizedPaths, projectOwnedPrefixes: normalizedPrefixes };
}

function readTargetOverrides(target) {
  const file = path.join(target, ...TARGET_OVERRIDE_PATH.split("/"));
  assertNoSymlinkComponents(target, file);
  if (!fs.existsSync(file)) {
    return { path: TARGET_OVERRIDE_PATH, exists: false, sha256: null, projectOwnedPaths: [], projectOwnedPrefixes: [] };
  }
  if (!fs.lstatSync(file).isFile()) throw new Error("Target install override must be a regular file.");
  const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  if (parsed.schemaVersion !== 1) throw new Error("Target install override has an unsupported schemaVersion.");
  return {
    path: TARGET_OVERRIDE_PATH,
    exists: true,
    sha256: hashFile(file),
    ...normalizeOwnershipConfig(parsed, "targetOverride")
  };
}

function ownershipOf(relative, ownership) {
  if (ownership.projectOwnedPaths.includes(relative)) return "project";
  return ownership.projectOwnedPrefixes.some(prefix => relative.startsWith(prefix)) ? "project" : "managed";
}

function listSourceFiles(sourceRoot, config, ownership) {
  const files = [];
  const visit = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      const relative = posix(path.relative(sourceRoot, full));
      if (entry.isSymbolicLink()) throw new Error(`Refusing symbolic link in package source: ${relative}`);
      if (entry.isDirectory()) visit(full);
      else if (entry.isFile() && !shouldExclude(relative, config)) {
        files.push({ path: relative, sha256: hashFile(full), size: fs.statSync(full).size, ownership: ownershipOf(relative, ownership) });
      }
    }
  };
  visit(sourceRoot);
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

function readState(statePath) {
  if (!fs.existsSync(statePath)) return { schemaVersion: 1, entries: [] };
  const parsed = JSON.parse(fs.readFileSync(statePath, "utf8"));
  if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.entries)) {
    throw new Error("Installed-state file has an unsupported shape.");
  }
  return parsed;
}

export function loadPackage(packageRoot) {
  const manifestPath = path.join(packageRoot, "rulekit-package.json");
  const config = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (config.schemaVersion !== 1 || !config.version || !config.sourceRoot) {
    throw new Error("Invalid rulekit-package.json.");
  }
  const sourceRoot = path.resolve(packageRoot, config.sourceRoot);
  assertInside(packageRoot, sourceRoot, "Package source");
  const ownership = normalizeOwnershipConfig(config, "package");
  return { config, sourceRoot, manifestPath, ownership };
}

export function buildInstallPlan(packageRoot, targetRoot, options = {}) {
  const target = path.resolve(targetRoot);
  const mode = options.adoptExisting ? "adopt" : "install";
  const { config, sourceRoot, ownership: packageOwnership } = loadPackage(packageRoot);
  if (fs.existsSync(target) && fs.lstatSync(target).isSymbolicLink()) {
    throw new Error("Refusing symbolic-link target root.");
  }
  const statePath = path.join(target, config.managedStatePath);
  assertNoSymlinkComponents(target, statePath);
  const state = readState(statePath);
  if (mode === "adopt" && state.entries.length > 0) {
    throw new Error("Adoption is allowed only when managed install state is absent or empty.");
  }
  const targetOverride = readTargetOverrides(target);
  const ownership = {
    projectOwnedPaths: [...new Set([...packageOwnership.projectOwnedPaths, ...targetOverride.projectOwnedPaths])],
    projectOwnedPrefixes: [...new Set([...packageOwnership.projectOwnedPrefixes, ...targetOverride.projectOwnedPrefixes])]
  };
  const previous = new Map(state.entries.map(entry => [entry.path, entry]));
  const sourceFiles = listSourceFiles(sourceRoot, config, ownership);
  const desired = new Set(sourceFiles.map(file => file.path));
  const operations = [];

  for (const file of sourceFiles) {
    const destination = path.join(target, ...file.path.split("/"));
    assertNoSymlinkComponents(target, destination);
    const prior = previous.get(file.path);
    if (file.ownership === "project") {
      if (!fs.existsSync(destination)) operations.push({ kind: "installProjectSeed", path: file.path, before: null, after: file.sha256 });
      else if (fs.lstatSync(destination).isFile() && hashFile(destination) === file.sha256) operations.push({ kind: "unchangedProject", path: file.path, before: file.sha256, after: file.sha256 });
      else operations.push({ kind: "preserveProject", path: file.path, reason: "project-owned-overlay", before: null, after: file.sha256 });
      continue;
    }
    if (!fs.existsSync(destination)) {
      operations.push({ kind: "install", path: file.path, before: null, after: file.sha256 });
      continue;
    }
    const stat = fs.lstatSync(destination);
    if (!stat.isFile()) {
      operations.push({ kind: "collision", path: file.path, reason: "target-not-file", before: null, after: file.sha256 });
      continue;
    }
    const current = hashFile(destination);
    if (current === file.sha256) operations.push({ kind: "unchanged", path: file.path, before: current, after: file.sha256 });
    else if (prior && current === prior.sha256) operations.push({ kind: "updateManaged", path: file.path, before: current, after: file.sha256 });
    else if (mode === "adopt" && !prior) operations.push({ kind: "adoptManaged", path: file.path, before: current, after: file.sha256 });
    else operations.push({ kind: "collision", path: file.path, reason: prior ? "managed-local-drift" : "unmanaged-existing", before: current, after: file.sha256 });
  }

  for (const prior of state.entries) {
    if (desired.has(prior.path)) continue;
    const destination = path.join(target, ...prior.path.split("/"));
    assertNoSymlinkComponents(target, destination);
    if (!fs.existsSync(destination)) operations.push({ kind: "stateOnly", path: prior.path, before: null, after: null });
    else if (fs.lstatSync(destination).isFile() && hashFile(destination) === prior.sha256) {
      operations.push({ kind: "removeManaged", path: prior.path, before: prior.sha256, after: null });
    } else operations.push({ kind: "collision", path: prior.path, reason: "removed-managed-local-drift", before: null, after: null });
  }

  const payload = {
    schemaVersion: 1,
    mode,
    package: { name: config.name, version: config.version, integrity: digest(sourceFiles) },
    target: posix(target),
    managedStatePath: config.managedStatePath,
    targetOverride: {
      path: targetOverride.path,
      exists: targetOverride.exists,
      sha256: targetOverride.sha256,
      projectOwnedPaths: targetOverride.projectOwnedPaths,
      projectOwnedPrefixes: targetOverride.projectOwnedPrefixes
    },
    operations: operations.sort((a, b) => a.path.localeCompare(b.path))
  };
  return { ...payload, approvalDigest: digest(payload), hasCollisions: operations.some(item => item.kind === "collision") };
}

export function createTemporaryTarget() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "rulekit-install-test-"));
}
