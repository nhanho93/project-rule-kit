#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildInstallPlan } from "./lib/rulekit-install-core.mjs";
import { applyInstallPlan } from "./lib/rulekit-install-apply.mjs";

const args = process.argv.slice(2);
const valueOf = flag => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : null;
};
const target = valueOf("--target");
const approval = valueOf("--approve");
const apply = args.includes("--apply");
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

try {
  if (!target) throw new Error("--target <absolute-or-relative-path> is required.");
  if (apply && !approval) throw new Error("--apply requires --approve <digest> from a fresh preview.");
  const result = apply
    ? applyInstallPlan(packageRoot, target, approval)
    : buildInstallPlan(packageRoot, target);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(JSON.stringify({ status: "error", code: "RULEKIT_INSTALL_FAILED", message: error.message }, null, 2));
  process.exitCode = 1;
}
