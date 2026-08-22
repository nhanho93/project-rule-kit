#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rootArg = process.argv.indexOf("--root");
if (rootArg >= 0 && (!process.argv[rootArg + 1] || process.argv[rootArg + 1].startsWith("--"))) {
  console.error("[ERROR] --root requires a directory path");
  process.exit(1);
}
const root = rootArg >= 0 ? path.resolve(process.argv[rootArg + 1]) : defaultRoot;
const linkRe = /\[[^\]]+\]\(([^)]+)\)/g;
const markdown = [];
const roots = [
  "AGENTS.md",
  "GEMINI.md",
  ".agent-system",
  ".agents",
  ".cursor/rules",
  ".cursor/skills",
  ".cursor/agents",
  ".cursor/capability-maps",
  "docs/agent-rules"
];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const stat = fs.statSync(dir);
  if (stat.isFile()) {
    if (/\.(md|mdc)$/i.test(dir)) markdown.push(dir);
    return;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (/\.(md|mdc)$/i.test(entry.name)) {
      markdown.push(full);
    }
  }
}

function normalizeTarget(from, target) {
  if (/^(https?:|mailto:|#)/i.test(target)) return null;
  const clean = target.split("#")[0].split("?")[0];
  if (!clean) return null;
  if (/\{\{[^}]+\}\}|\{[A-Z][A-Z0-9_-]*\}/.test(clean)) return null;

  const candidates = [
    path.resolve(path.dirname(from), clean),
    path.resolve(root, clean)
  ];
  const relFrom = path.relative(root, from).replace(/\\/g, "/");
  const skill = relFrom.match(/^(?:\.agents|\.cursor)\/skills\/([^/]+)\/(.*)$/);
  if (skill) {
    const [, id, nestedFile] = skill;
    const nestedDir = path.dirname(nestedFile);
    for (const base of [".agent/skills", ".agents/skills", ".cursor/skills"]) {
      candidates.push(path.resolve(root, base, id, nestedDir, clean));
    }
  }
  return candidates.find(candidate => fs.existsSync(candidate)) ?? candidates[0];
}

for (const item of roots) walk(path.join(root, item));

const broken = [];
for (const file of markdown) {
  const text = fs.readFileSync(file, "utf8").replace(/(```|~~~)[\s\S]*?\1/g, "");
  for (const match of text.matchAll(linkRe)) {
    const resolved = normalizeTarget(file, match[1].trim());
    if (resolved && !fs.existsSync(resolved)) {
      broken.push(`${path.relative(root, file)} -> ${match[1].trim()}`);
    }
  }
}

console.log("[START] check-agent-links");
console.log(`markdown=${markdown.length}`);
console.log(`broken=${broken.length}`);
for (const item of broken) console.error(item);
console.log(broken.length ? "[ERROR] check-agent-links FAIL" : "[END] check-agent-links PASS");
process.exit(broken.length ? 1 : 0);
