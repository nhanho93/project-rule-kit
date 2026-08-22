#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { computeDesiredState, writeJsonAtomic } from "./rulekit-integrity-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, ".agent-system", "rulekit-stack.json");
const manifest = computeDesiredState(root);
if (process.argv.includes("--write")) {
  writeJsonAtomic(out, manifest);
  console.log(`[SUCCESS] Desired state refreshed: ${path.relative(root, out)}`);
} else {
  console.log(JSON.stringify(manifest, null, 2));
  console.log("[INFO] Preview only. Use --write after reviewing project customization changes.");
}
