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
  const normalizedDescription = (meta.description || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const prior = descriptions.get(normalizedDescription);
  if (prior) errors.push(`${row.id}: exact description duplicates ${prior}`);
  else descriptions.set(normalizedDescription, row.id);

  if (lineCount < 14) {
    thin += 1;
    warnings.push(`${row.id}: thin entrypoint (${lineCount} lines); confirm the skill changes decisions`);
  }
  if (/Core logic:\s*apply the .* pattern only when the task needs it/i.test(content)) {
    generic += 1;
    warnings.push(`${row.id}: generic scaffold language remains`);
  }
  if (lineCount > 200) {
    large += 1;
    if (!/\]\(references\//.test(content)) errors.push(`${row.id}: entrypoint exceeds 200 lines without routed references`);
    else warnings.push(`${row.id}: entrypoint remains over 200 lines; reassess branch extraction`);
  }
}

console.log("[START] check-skill-catalog");
console.log(`skills=${rows.length}`);
console.log(`lines=${totalLines}`);
console.log(`thin=${thin}`);
console.log(`generic=${generic}`);
console.log(`large=${large}`);
console.log(`warnings=${warnings.length}`);
for (const warning of warnings) console.warn(`[WARN] ${warning}`);
console.log(`errors=${errors.length}`);
for (const error of errors) console.error(`[ERROR] ${error}`);
console.log(errors.length ? "[ERROR] check-skill-catalog FAIL" : "[END] check-skill-catalog PASS");
process.exit(errors.length ? 1 : 0);
