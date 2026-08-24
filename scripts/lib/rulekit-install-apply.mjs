import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  assertNoSymlinkComponents, buildInstallPlan, hashFile, loadPackage
} from "./rulekit-install-core.mjs";

function writeJsonAtomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
  const previous = `${file}.${process.pid}.${Date.now()}.previous`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  let movedPrevious = false;
  try {
    if (fs.existsSync(file)) {
      fs.renameSync(file, previous);
      movedPrevious = true;
    }
    fs.renameSync(temporary, file);
    if (movedPrevious) fs.rmSync(previous, { force: true });
  } catch (error) {
    if (fs.existsSync(temporary)) fs.rmSync(temporary, { force: true });
    if (movedPrevious && !fs.existsSync(file) && fs.existsSync(previous)) fs.renameSync(previous, file);
    throw error;
  }
}

function stageOperations(plan, sourceRoot, stageRoot) {
  for (const operation of plan.operations) {
    if (!["install", "updateManaged", "installProjectSeed"].includes(operation.kind)) continue;
    const source = path.join(sourceRoot, ...operation.path.split("/"));
    const staged = path.join(stageRoot, ...operation.path.split("/"));
    fs.mkdirSync(path.dirname(staged), { recursive: true });
    fs.copyFileSync(source, staged);
    if (hashFile(staged) !== operation.after) throw new Error(`Staged hash mismatch: ${operation.path}`);
  }
}

function rollback(mutations, statePath, oldState, stageRoot) {
  for (const mutation of mutations.reverse()) {
    if (fs.existsSync(mutation.destination)) fs.rmSync(mutation.destination, { recursive: true, force: true });
    if (mutation.hadBackup && fs.existsSync(mutation.backup)) {
      fs.mkdirSync(path.dirname(mutation.destination), { recursive: true });
      fs.renameSync(mutation.backup, mutation.destination);
    }
  }
  if (oldState) {
    fs.mkdirSync(path.dirname(statePath), { recursive: true });
    fs.writeFileSync(statePath, oldState);
  } else if (fs.existsSync(statePath)) fs.rmSync(statePath, { force: true });
  if (fs.existsSync(stageRoot)) fs.rmSync(stageRoot, { recursive: true, force: true });
}

export function applyInstallPlan(packageRoot, targetRoot, approvalDigest, options = {}) {
  const plan = buildInstallPlan(packageRoot, targetRoot, { adoptExisting: false });
  if (plan.approvalDigest !== approvalDigest) throw new Error("Approval digest is stale or belongs to another target state.");
  if (plan.hasCollisions) throw new Error("Install plan contains collisions; merge them manually and preview again.");
  const target = path.resolve(targetRoot);
  const { config, sourceRoot } = loadPackage(packageRoot);
  fs.mkdirSync(target, { recursive: true });
  const controlRoot = path.join(target, ".agent-system");
  assertNoSymlinkComponents(target, controlRoot);
  fs.mkdirSync(controlRoot, { recursive: true });
  const runId = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const stageRoot = fs.mkdtempSync(path.join(controlRoot, `.rulekit-stage-${runId}-`));
  const backupRoot = path.join(controlRoot, "install-backups", runId);
  const statePath = path.join(target, config.managedStatePath);
  const oldState = fs.existsSync(statePath) ? fs.readFileSync(statePath) : null;
  const mutations = [];
  let promoted = 0;
  try {
    stageOperations(plan, sourceRoot, stageRoot);
    for (const operation of plan.operations) {
      if (!["install", "updateManaged", "installProjectSeed", "removeManaged"].includes(operation.kind)) continue;
      const destination = path.join(target, ...operation.path.split("/"));
      assertNoSymlinkComponents(target, destination);
      const backup = path.join(backupRoot, ...operation.path.split("/"));
      if (fs.existsSync(destination)) {
        fs.mkdirSync(path.dirname(backup), { recursive: true });
        fs.renameSync(destination, backup);
      }
      mutations.push({ destination, backup, hadBackup: fs.existsSync(backup) });
      if (operation.kind !== "removeManaged") {
        const staged = path.join(stageRoot, ...operation.path.split("/"));
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.renameSync(staged, destination);
      }
      promoted += 1;
      if (Number(options.failAfter || process.env.RULEKIT_TEST_FAIL_AFTER || 0) === promoted) throw new Error("Injected installer failure.");
    }
    const entries = plan.operations.filter(item => item.after && ["install", "updateManaged", "unchanged"].includes(item.kind))
      .map(item => ({ path: item.path, sha256: item.after })).sort((a, b) => a.path.localeCompare(b.path));
    writeJsonAtomic(statePath, { schemaVersion: 1, package: plan.package, approvalDigest: plan.approvalDigest, installedAt: new Date().toISOString(), entries });
    fs.rmSync(stageRoot, { recursive: true, force: true });
    return { status: "installed", approvalDigest: plan.approvalDigest, backupRoot: fs.existsSync(backupRoot) ? backupRoot : null, operationCount: promoted };
  } catch (error) {
    rollback(mutations, statePath, oldState, stageRoot);
    throw error;
  }
}

export function applyAdoptionPlan(packageRoot, targetRoot, approvalDigest) {
  const plan = buildInstallPlan(packageRoot, targetRoot, { adoptExisting: true });
  if (plan.approvalDigest !== approvalDigest) throw new Error("Approval digest is stale or belongs to another target state.");
  if (plan.hasCollisions) throw new Error("Adoption plan contains collisions; resolve them and preview again.");
  const target = path.resolve(targetRoot);
  const { config } = loadPackage(packageRoot);
  fs.mkdirSync(target, { recursive: true });
  const statePath = path.join(target, config.managedStatePath);
  assertNoSymlinkComponents(target, statePath);
  const entries = plan.operations
    .filter(item => ["adoptManaged", "unchanged"].includes(item.kind))
    .map(item => ({ path: item.path, sha256: item.kind === "adoptManaged" ? item.before : item.after }))
    .sort((a, b) => a.path.localeCompare(b.path));
  writeJsonAtomic(statePath, {
    schemaVersion: 1,
    package: plan.package,
    approvalDigest: plan.approvalDigest,
    adoptedAt: new Date().toISOString(),
    entries
  });
  return { status: "adopted", approvalDigest: plan.approvalDigest, operationCount: entries.length };
}
