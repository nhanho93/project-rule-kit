#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rulesDir = path.join(root, "docs", "agent-rules");

const isApply = process.argv.includes("--apply");

console.log(`[START] bootstrap-project-context (Mode: ${isApply ? "Apply" : "Inspect"})`);

if (!fs.existsSync(rulesDir)) {
  console.error(`[ERROR] Rules directory not found at ${rulesDir}`);
  process.exit(1);
}

let projectName = path.basename(root) === "template" ? "my-project (evidence: fallback)" : `${path.basename(root)} (evidence: directory basename)`;
let primaryStack = "REVIEW_REQUIRED: Specify primary stack based on lockfiles/manifests";
let testCommand = "REVIEW_REQUIRED: Specify test command";
let buildCommand = "REVIEW_REQUIRED: Specify build command";
let deployPolicy = "REVIEW_REQUIRED: Specify deployment policy";
let databasePolicy = "REVIEW_REQUIRED: Specify database access policy";
let valueGate = "REVIEW_REQUIRED: Specify value gate criteria";
let coreDeps = "REVIEW_REQUIRED: Specify core dependencies";
let coreRestrictions = "REVIEW_REQUIRED: Specify core dependency restrictions";
const deliveryUnknown = label => `REVIEW_REQUIRED: Specify ${label}`;

const pkgPath = path.join(root, "package.json");
let safeApplication = true;
let conflictError = null;

if (fs.existsSync(pkgPath)) {
  try {
    const pkgContent = fs.readFileSync(pkgPath, "utf8");
    const pkg = JSON.parse(pkgContent);
    if (pkg.name) projectName = `${pkg.name} (evidence: package.json#name)`;

    const lockfiles = {
      "pnpm-lock.yaml": "pnpm",
      "yarn.lock": "yarn",
      "package-lock.json": "npm",
      "bun.lockb": "bun",
      "bun.lock": "bun"
    };

    let detectedPms = [];
    if (pkg.packageManager) {
      const pm = pkg.packageManager.split("@")[0];
      detectedPms.push({ pm, evidence: "package.json#packageManager" });
    }

    for (const [file, pm] of Object.entries(lockfiles)) {
      if (fs.existsSync(path.join(root, file))) {
        detectedPms.push({ pm, evidence: file });
      }
    }

    const uniquePms = [...new Set(detectedPms.map(d => d.pm))];
    let foundPackageManager = null;
    let foundPackageManagerEvidence = null;

    if (uniquePms.length === 1) {
      foundPackageManager = uniquePms[0];
      foundPackageManagerEvidence = detectedPms.map(d => d.evidence).join(", ");
    } else if (uniquePms.length > 1) {
      conflictError = `Conflicting package managers detected: ${uniquePms.join(", ")}`;
      safeApplication = false;
    }

    const stack = [];
    if (foundPackageManager) {
        stack.push(`Package ecosystem: ${foundPackageManager} (evidence: ${foundPackageManagerEvidence})`);
    } else if (uniquePms.length === 0) {
        // no package manager evidence
    }

    if (pkg.engines && pkg.engines.node) {
        stack.push(`Node.js ${pkg.engines.node} (evidence: package.json#engines.node)`);
    }

    const hasDep = (name) => (pkg.dependencies && pkg.dependencies[name]) || (pkg.devDependencies && pkg.devDependencies[name]);

    let tsEvidence = [];
    if (fs.existsSync(path.join(root, "tsconfig.json"))) tsEvidence.push("tsconfig.json");
    if (hasDep("typescript")) tsEvidence.push("package.json#dependencies");
    if (tsEvidence.length > 0) stack.push(`TypeScript (evidence: ${tsEvidence.join(", ")})`);

    let reactEvidence = [];
    if (hasDep("react")) reactEvidence.push("package.json#dependencies");
    // could check next.config.js, etc.
    if (reactEvidence.length > 0) stack.push(`React (evidence: ${reactEvidence.join(", ")})`);

    if (stack.length > 0) {
      primaryStack = stack.join(", ");
    }

    if (foundPackageManager && pkg.scripts) {
       if (pkg.scripts.test) {
           testCommand = `${foundPackageManager} run test (evidence: package.json#scripts.test)`;
       }
       if (pkg.scripts.build) {
           buildCommand = `${foundPackageManager} run build (evidence: package.json#scripts.build)`;
       }
    } else if (conflictError) {
       testCommand = "REVIEW_REQUIRED: Conflicting package managers";
       buildCommand = "REVIEW_REQUIRED: Conflicting package managers";
    } else if (!pkg.scripts?.test) {
       testCommand = "REVIEW_REQUIRED: test script absent";
    } else if (!pkg.scripts?.build) {
       buildCommand = "REVIEW_REQUIRED: build script absent";
    }

    const allDeps = Object.keys(pkg.dependencies || {});
    if (allDeps.length > 0) {
      coreDeps = `${allDeps.slice(0, 5).join(", ")} (evidence: package.json#dependencies)`;
    }

  } catch (e) {
    conflictError = `Malformed package.json: ${e.message}`;
    safeApplication = false;
  }
}

if (conflictError) {
  console.error(`[ERROR] ${conflictError}`);
  if (isApply) {
    console.error(`[ERROR] Aborting --apply due to conflicts/errors to ensure safe application.`);
    process.exit(1);
  }
}

const defaultReplacements = {
  "{{PROJECT_NAME}}": projectName,
  "{{PRIMARY_STACK}}": primaryStack,
  "{{TEST_COMMANDS}}": testCommand,
  "{{BUILD_COMMAND}}": buildCommand,
  "{{DEPLOY_POLICY}}": deployPolicy,
  "{{DATABASE_POLICY}}": databasePolicy,
  "{{VALUE_GATE}}": valueGate,
  "{{CORE_DEPS}}": coreDeps,
  "{{CORE_RESTRICTIONS}}": coreRestrictions
  ,"{{GIT_PROVIDER}}": deliveryUnknown("Git provider")
  ,"{{DEFAULT_BRANCH}}": deliveryUnknown("default branch")
  ,"{{BRANCH_POLICY}}": deliveryUnknown("branch convention")
  ,"{{PUSH_POLICY}}": deliveryUnknown("commit and push authorization")
  ,"{{PRE_PUSH_CHECKS}}": deliveryUnknown("required pre-push checks")
  ,"{{PROTECTED_BRANCH_POLICY}}": deliveryUnknown("protected branch or review policy")
  ,"{{DEPLOY_ENVIRONMENTS}}": deliveryUnknown("deployment environments and promotion order")
  ,"{{DEPLOY_TRANSPORT}}": deliveryUnknown("deployment transport")
  ,"{{DEPLOY_STRATEGY}}": deployPolicy
  ,"{{DEPLOY_APPROVAL_POLICY}}": deliveryUnknown("deployment approval policy")
  ,"{{DEPLOY_HEALTH_CHECKS}}": deliveryUnknown("health and smoke checks")
  ,"{{ROLLBACK_STRATEGY}}": deliveryUnknown("rollback strategy")
  ,"{{RUNTIME_TYPE}}": deliveryUnknown("runtime type")
  ,"{{CONNECTION_REFERENCE}}": deliveryUnknown("non-secret connection reference")
  ,"{{PROCESS_MANAGER}}": deliveryUnknown("process manager or orchestrator")
  ,"{{REVERSE_PROXY}}": deliveryUnknown("reverse proxy or ingress")
  ,"{{RELEASE_LAYOUT}}": deliveryUnknown("release layout")
  ,"{{LOG_SOURCES}}": deliveryUnknown("sanitized log sources")
  ,"{{MONITORING_POLICY}}": deliveryUnknown("monitoring and alerting")
};

let pendingChanges = 0;

for (const file of fs.readdirSync(rulesDir)) {
  if (!file.endsWith(".md") && !file.endsWith(".mdc")) continue;
  const filePath = path.join(rulesDir, file);
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  for (const [placeholder, defaultVal] of Object.entries(defaultReplacements)) {
    if (content.includes(placeholder)) {
      if (isApply) {
        content = content.replaceAll(placeholder, defaultVal);
        modified = true;
      } else {
        console.log(`[DRAFT] Would replace ${placeholder} with '${defaultVal}' in ${file}`);
        pendingChanges++;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`[APPLY] Updated ${file}`);
  }
}

if (!isApply && pendingChanges > 0) {
  console.log(`[INFO] Run with --apply to execute ${pendingChanges} drafted changes.`);
  if (!safeApplication) {
      console.log(`[WARNING] --apply will fail due to conflicts. Resolve them first.`);
  }
} else if (!isApply && pendingChanges === 0) {
  console.log(`[INFO] All placeholders resolved.`);
}

console.log("[END] bootstrap-project-context");
