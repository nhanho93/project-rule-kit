#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = path.join(root, ".agent-system", "registry", "skills.json");
const skillsRoot = path.join(root, ".agents", "skills");
const rows = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const errors = [];
const warnings = [];
const descriptions = new Map();
const baselinePath = path.join(root, ".agent-system", "registry", "skill-quality-warning-baseline.json");
const updateBaseline = process.argv.includes("--update-baseline");
const allowed = {
  risk: new Set(["safe", "critical", "offensive"]),
  maturity: new Set(["core", "stable", "experimental"]),
  depth: new Set(["router", "workflow", "domain-reference"]),
  verificationProfile: new Set(["standard", "browser", "security", "deployment"])
};

function warn(id, code, message) {
  warnings.push({ id, code, message });
}

function frontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const data = {};
  const lines = match[1].split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const field = lines[index].match(/^([a-zA-Z][\w-]*):\s*(.*?)\s*$/);
    if (!field) continue;
    let value = field[2].replace(/^["']|["']$/g, "");
    if ([">", ">-", "|", "|-"].includes(value)) {
      const folded = [];
      while (index + 1 < lines.length && /^\s+/.test(lines[index + 1])) folded.push(lines[++index].trim());
      value = folded.join(" ");
    }
    data[field[1]] = value;
  }
  return data;
}

const physical = fs.readdirSync(skillsRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && fs.existsSync(path.join(skillsRoot, entry.name, "SKILL.md")))
  .map(entry => entry.name)
  .sort();
const registered = rows.map(row => row.id).sort();
const knownIds = new Set(registered);

for (const id of physical.filter(id => !registered.includes(id))) errors.push(`unregistered skill directory: ${id}`);
for (const id of registered.filter(id => !physical.includes(id))) errors.push(`registered skill directory missing: ${id}`);

let totalLines = 0;
let thin = 0;
let generic = 0;
let large = 0;
for (const row of rows) {
  const skillPath = path.join(root, row.canonical);
  if (!fs.existsSync(skillPath)) continue;
  const content = fs.readFileSync(skillPath, "utf8");
  const meta = frontmatter(content);
  const lineCount = content.split(/\r?\n/).length;
  totalLines += lineCount;
  if (meta.name !== row.id) errors.push(`${row.id}: frontmatter name does not match registry id`);
  if (!meta.description || meta.description.length < 24) errors.push(`${row.id}: description is missing or too weak`);
  for (const [field, values] of Object.entries(allowed)) {
    if (!values.has(row[field])) errors.push(`${row.id}: invalid or missing ${field}`);
  }
  for (const field of ["requires", "conflictsWith"]) {
    if (!Array.isArray(row[field])) errors.push(`${row.id}: ${field} must be an array`);
    else if (new Set(row[field]).size !== row[field].length) errors.push(`${row.id}: ${field} must be unique`);
    else for (const id of row[field]) if (!knownIds.has(id)) errors.push(`${row.id}: ${field} references unknown skill ${id}`);
  }
  if (row.requires?.includes(row.id) || row.conflictsWith?.includes(row.id)) errors.push(`${row.id}: cannot require or conflict with itself`);
  for (const id of row.requires || []) if (row.conflictsWith?.includes(id)) errors.push(`${row.id}: cannot both require and conflict with ${id}`);
  if (row.risk === "offensive" && !/authorized|authorization/i.test(content)) {
    errors.push(`${row.id}: offensive skill requires an authorization gate`);
  }
  const normalizedDescription = (meta.description || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const prior = descriptions.get(normalizedDescription);
  if (prior) errors.push(`${row.id}: exact description duplicates ${prior}`);
  else descriptions.set(normalizedDescription, row.id);

  if (lineCount < 14) {
    thin += 1;
    warn(row.id, "thin-entrypoint", `thin entrypoint (${lineCount} lines); confirm the skill changes decisions`);
  }
  if (/Core logic:\s*apply the .* pattern only when the task needs it/i.test(content)) {
    generic += 1;
    warn(row.id, "generic-scaffold", "generic scaffold language remains");
  }
  if (!/^## .*When to Use/im.test(content) && !/Why\/when apply:/i.test(content)) {
    warn(row.id, "missing-when-to-use", "missing a concrete When to Use branch");
  }
  if (!/^## .*Limitations|^## .*Do Not Use|NOT_DO:/im.test(content)) {
    warn(row.id, "missing-limitations", "missing limitations or do-not-use guidance");
  }
  if (!/```|^## .*Example/im.test(content) && row.depth !== "router") {
    warn(row.id, "missing-example", "non-router skill has no executable or worked example");
  }
  if (row.maturity === "stable" && lineCount <= 15) {
    errors.push(`${row.id}: stable skill cannot be a shallow entrypoint`);
  }
  if (lineCount > 200) {
    large += 1;
    if (row.entrypointPolicy?.allowOver200 === true) {
      warn(row.id, "oversized-approved", `oversized entrypoint allowed; owner=${row.entrypointPolicy.followupOwner}`);
    } else if (!/\]\(references\//.test(content)) errors.push(`${row.id}: entrypoint exceeds 200 lines without routed references`);
    else warn(row.id, "oversized-entrypoint", "entrypoint remains over 200 lines; reassess branch extraction");
  }
}

const warningMap = Object.fromEntries([...new Set(warnings.map(item => item.id))].sort().map(id => [
  id, [...new Set(warnings.filter(item => item.id === id).map(item => item.code))].sort()
]));
const metadataMap = Object.fromEntries(rows.map(row => [row.id, {
  risk: row.risk, maturity: row.maturity, depth: row.depth, verificationProfile: row.verificationProfile
}]));
if (updateBaseline) {
  fs.writeFileSync(baselinePath, `${JSON.stringify({ schemaVersion: 1, warnings: warningMap, metadata: metadataMap }, null, 2)}\n`);
} else if (!fs.existsSync(baselinePath)) errors.push("skill quality warning baseline is missing");
else {
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  const riskRank = { safe: 0, critical: 1, offensive: 2 };
  for (const [id, codes] of Object.entries(warningMap)) {
    for (const code of codes) {
      if (!baseline.warnings?.[id]?.includes(code)) errors.push(`${id}: warning regression ${code}`);
    }
  }
  for (const row of rows) {
    const prior = baseline.metadata?.[row.id];
    if (!prior) errors.push(`${row.id}: quality metadata baseline missing`);
    else if (riskRank[row.risk] < riskRank[prior.risk]) errors.push(`${row.id}: risk downgrade ${prior.risk} -> ${row.risk}`);
  }
}

console.log("[START] check-skill-catalog");
console.log(`skills=${rows.length}`);
console.log(`lines=${totalLines}`);
console.log(`thin=${thin}`);
console.log(`generic=${generic}`);
console.log(`large=${large}`);
console.log(`warnings=${warnings.length}`);
for (const warning of warnings) console.warn(`[WARN] ${warning.id}:${warning.code}: ${warning.message}`);
if (updateBaseline) console.log(`[INFO] warning baseline updated: ${path.relative(root, baselinePath)}`);
console.log(`errors=${errors.length}`);
for (const error of errors) console.error(`[ERROR] ${error}`);
console.log(errors.length ? "[ERROR] check-skill-catalog FAIL" : "[END] check-skill-catalog PASS");
process.exit(errors.length ? 1 : 0);
