#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readJson, validateDesiredState } from "./rulekit-integrity-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, ".agent-system", "rulekit-stack.json");
try {
  const errors = validateDesiredState(root, readJson(file));
  if (errors.length) throw new Error(errors.join(", "));
  console.log("[SUCCESS] Rule Kit desired state is current.");
} catch (error) {
  console.error(`[ERROR] ${error.message}`);
  process.exitCode = 1;
}
