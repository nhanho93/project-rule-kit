#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "template", ".agent-system", "registry", "skills.json");
const rows = JSON.parse(fs.readFileSync(file, "utf8"));
const critical = new Set([
  "antigravity-orchestrator", "database-migration-safety", "deployment-runbook",
  "git-change-management", "server-management", "vm-operations-runbook",
  "vulnerability-scanner"
]);
const browser = new Set([
  "e2e-qc", "frontend-design", "frontend-ui-qc", "project-ui-conventions",
  "ui-ux-pro-max", "web-design-guidelines", "webapp-testing"
]);
const deployment = new Set([
  "database-migration-safety", "deployment-runbook", "git-change-management",
  "server-management", "vm-operations-runbook"
]);
const security = new Set(["red-team-tactics", "vulnerability-scanner"]);
const router = new Set([
  "behavioral-modes", "intelligent-routing", "project-context-router"
]);
const domain = new Set([
  "api-patterns", "bash-linux", "database-design", "frontend-design",
  "game-development", "geo-fundamentals", "i18n-localization", "mcp-builder",
  "mobile-design", "nextjs-react-expert", "nodejs-best-practices",
  "performance-profiling", "powershell-windows", "python-patterns", "rust-pro",
  "seo-fundamentals", "tailwind-patterns", "ui-ux-pro-max",
  "web-design-guidelines"
]);

for (const row of rows) {
  const skill = path.join(root, "template", row.canonical);
  const lines = fs.readFileSync(skill, "utf8").split(/\r?\n/).length;
  row.risk = row.id === "red-team-tactics" ? "offensive" : critical.has(row.id) ? "critical" : "safe";
  row.maturity = lines <= 15 ? "experimental" : "stable";
  row.depth = router.has(row.id) ? "router" : domain.has(row.id) ? "domain-reference" : "workflow";
  row.verificationProfile = security.has(row.id) ? "security" : deployment.has(row.id)
    ? "deployment" : browser.has(row.id) ? "browser" : "standard";
  row.requires ??= [];
  row.conflictsWith ??= [];
}
fs.writeFileSync(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`[SUCCESS] Added quality metadata to ${rows.length} registry entries.`);
