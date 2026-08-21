#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const linkRe = /\[[^\]]+\]\(([^)]+)\)/g;
const markdown = [];

function walk(dir) {
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
  return path.resolve(path.dirname(from), clean);
}

walk(root);

const broken = [];
for (const file of markdown) {
  const text = fs.readFileSync(file, "utf8");
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
