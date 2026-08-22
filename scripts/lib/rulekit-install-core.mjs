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

function ownershipOf(relative, config) {
  if (config.projectOwnedPaths.includes(relative)) return "project";
  return config.projectOwnedPrefixes.some(prefix => relative.startsWith(prefix)) ? "project" : "managed";
}

function listSourceFiles(sourceRoot, config) {
  const files = [];
  const visit = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      const relative = posix(path.relative(sourceRoot, full));
      if (entry.isSymbolicLink()) throw new Error(`Refusing symbolic link in package source: ${relative}`);
      if (entry.isDirectory()) visit(full);
      else if (entry.isFile() && !shouldExclude(relative, config)) {
        files.push({ path: relative, sha256: hashFile(full), size: fs.statSync(full).size, ownership: ownershipOf(relative, config) });
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
  return { config, sourceRoot, manifestPath };
}

export function buildInstallPlan(packageRoot, targetRoot) {
  const target = path.resolve(targetRoot);
  const { config, sourceRoot } = loadPackage(packageRoot);
  if (fs.existsSync(target) && fs.lstatSync(target).isSymbolicLink()) {
    throw new Error("Refusing symbolic-link target root.");
  }
  const statePath = path.join(target, config.managedStatePath);
  assertNoSymlinkComponents(target, statePath);
  const state = readState(statePath);
  const previous = new Map(state.entries.map(entry => [entry.path, entry]));
  const sourceFiles = listSourceFiles(sourceRoot, config);
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
    package: { name: config.name, version: config.version, integrity: digest(sourceFiles) },
    target: posix(target),
    managedStatePath: config.managedStatePath,
    operations: operations.sort((a, b) => a.path.localeCompare(b.path))
  };
  return { ...payload, approvalDigest: digest(payload), hasCollisions: operations.some(item => item.kind === "collision") };
}

export function createTemporaryTarget() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "rulekit-install-test-"));
}
