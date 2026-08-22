#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const rootIndex = args.indexOf("--root");
const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = rootIndex >= 0 ? path.resolve(args[rootIndex + 1] || "") : defaultRoot;
const registryPath = path.join(root, ".agent-system", "registry", "skills.json");
const errors = [];

if (!fs.existsSync(registryPath)) {
  errors.push("skill registry is missing");
} else {
  const rows = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const contracts = [
    [/^## .*When to Use|Why\/when apply:/im, "when-to-use branch"],
    [/^## .*Limitations|^## .*Do Not Use|NOT_DO:/im, "limitations/stop conditions"],
    [/```|^## .*Example/im, "worked or routing example"],
    [/completion|complete only when|complete when|routing is complete|at close|acceptance|record evidence|\bPASS\b/i, "observable completion criterion"]
  ];

  for (const row of rows) {
    const file = path.join(root, row.canonical);
    if (!fs.existsSync(file)) {
      errors.push(`${row.id}: canonical entrypoint is missing`);
      continue;
    }
    const content = fs.readFileSync(file, "utf8");
    if (/Core logic:\s*apply the .* pattern only when the task needs it/i.test(content)) {
      errors.push(`${row.id}: generic scaffold language returned`);
    }
    for (const [pattern, label] of contracts) {
      if (!pattern.test(content)) errors.push(`${row.id}: missing ${label}`);
    }
  }
}

console.log("[START] check-skill-contract-completeness");
console.log(`errors=${errors.length}`);
for (const error of errors) console.error(`[ERROR] ${error}`);
console.log(errors.length
  ? "[ERROR] check-skill-contract-completeness FAIL"
  : "[END] check-skill-contract-completeness PASS");
process.exit(errors.length ? 1 : 0);
