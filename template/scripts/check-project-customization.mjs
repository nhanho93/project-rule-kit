#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const isTemplate = process.argv.includes("--template");
const isInstalled = process.argv.includes("--installed");

if ((!isTemplate && !isInstalled) || (isTemplate && isInstalled)) {
  console.error("[ERROR] Must specify exactly one of --template or --installed mode");
  process.exit(1);
}

console.log(`[START] check-project-customization (Mode: ${isTemplate ? "Template" : "Installed"})`);

let errors = 0;

const rulesDir = path.join(root, "docs", "agent-rules");

const canonicalDocs = [
  "docs/agent-rules/project-profile.md",
  "docs/agent-rules/project-structure.md",
  "docs/agent-rules/code-conventions.md",
  "docs/agent-rules/domain-glossary.md",
  "docs/agent-rules/markdown-conventions.md",
  "docs/agent-rules/delivery-profile.md"
];

for (const doc of canonicalDocs) {
  if (!fs.existsSync(path.join(root, doc))) {
    console.error(`[FAIL] Canonical knowledge file is missing: ${doc}`);
    errors++;
  }
}

const allTokens = [
  "{{PROJECT_NAME}}", "{{PRIMARY_STACK}}", "{{VALUE_GATE}}",
  "{{TEST_COMMANDS}}", "{{BUILD_COMMAND}}", "{{DEPLOY_POLICY}}",
  "{{DATABASE_POLICY}}", "{{CORE_DEPS}}", "{{CORE_RESTRICTIONS}}",
  "{{GIT_PROVIDER}}", "{{DEFAULT_BRANCH}}", "{{BRANCH_POLICY}}", "{{PUSH_POLICY}}",
  "{{PRE_PUSH_CHECKS}}", "{{PROTECTED_BRANCH_POLICY}}", "{{DEPLOY_ENVIRONMENTS}}",
  "{{DEPLOY_TRANSPORT}}", "{{DEPLOY_STRATEGY}}", "{{DEPLOY_APPROVAL_POLICY}}",
  "{{DEPLOY_HEALTH_CHECKS}}", "{{ROLLBACK_STRATEGY}}", "{{RUNTIME_TYPE}}",
  "{{CONNECTION_REFERENCE}}", "{{PROCESS_MANAGER}}", "{{REVERSE_PROXY}}",
  "{{RELEASE_LAYOUT}}", "{{LOG_SOURCES}}", "{{MONITORING_POLICY}}"
];

const allowedPlaceholders = {
  "docs/agent-rules/project-profile.md": ["{{PROJECT_NAME}}", "{{PRIMARY_STACK}}", "{{VALUE_GATE}}", "{{TEST_COMMANDS}}", "{{BUILD_COMMAND}}", "{{DEPLOY_POLICY}}", "{{DATABASE_POLICY}}"],
  "docs/agent-rules/project-structure.md": ["{{PROJECT_NAME}}", "{{CORE_DEPS}}", "{{CORE_RESTRICTIONS}}"],
  "docs/agent-rules/code-conventions.md": ["{{PROJECT_NAME}}"],
  "docs/agent-rules/domain-glossary.md": [],
  "docs/agent-rules/markdown-conventions.md": ["{{PROJECT_NAME}}"],
  "docs/agent-rules/delivery-profile.md": allTokens.filter(token => !["{{PROJECT_NAME}}", "{{PRIMARY_STACK}}", "{{VALUE_GATE}}", "{{TEST_COMMANDS}}", "{{BUILD_COMMAND}}", "{{DATABASE_POLICY}}", "{{CORE_DEPS}}", "{{CORE_RESTRICTIONS}}"].includes(token)),
  "scripts/check-project-customization.mjs": allTokens,
  "scripts/bootstrap-project-context.mjs": allTokens,
  "scripts/check-project-knowledge-loop.mjs": allTokens
};


function walkSync(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === "node_modules" || file === ".git") continue;
    const filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      walkSync(filepath, callback);
    } else if (stats.isFile()) {
      callback(filepath);
    }
  }
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const yaml = match[1];
  const data = {};
  for (const line of yaml.split(/\r?\n/)) {
    const splitIdx = line.indexOf(':');
    if (splitIdx > -1) {
      const key = line.slice(0, splitIdx).trim();
      const val = line.slice(splitIdx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
      data[key] = val;
    }
  }
  return data;
}

// In Template mode: scan the whole root
if (isTemplate) {
  walkSync(root, (filepath) => {
    const ext = path.extname(filepath);
    if (![".md", ".mdc", ".json", ".yaml", ".yml", ".toml", ".mjs", ".js"].includes(ext)) return;

    const relPath = path.relative(root, filepath).replace(/\\/g, "/");

    const allowList = allowedPlaceholders[relPath] || [];

    const content = fs.readFileSync(filepath, "utf8");
    const placeholders = content.match(/\{\{([^}]+)\}\}/g) || [];

    for (const p of placeholders) {
      if (!allowList.includes(p)) {
        console.error(`[FAIL] ${relPath} contains unauthorized placeholder: ${p}`);
        errors++;
      }
    }

    if (canonicalDocs.includes(relPath)) {
       const fm = parseFrontmatter(content);
       if (!fm) {
           console.error(`[FAIL] ${relPath} is missing required frontmatter blocks.`);
           errors++;
       } else {
           const requiredKeys = ["last_verified", "evidence_sources", "impacted_modules", "decision_owner", "status"];
           for (const k of requiredKeys) {
               if (!(k in fm)) {
                   console.error(`[FAIL] ${relPath} frontmatter missing key: ${k}`);
                   errors++;
               }
           }
           if (fm.status !== "UNRESOLVED") {
               console.error(`[FAIL] ${relPath} status must be UNRESOLVED in template mode, got: ${fm.status}`);
               errors++;
           }
       }
    }
  });

  // Specific check: project-profile must contain placeholders in template mode
  const pp = path.join(root, "docs", "agent-rules", "project-profile.md");
  if (fs.existsSync(pp)) {
    const c = fs.readFileSync(pp, "utf8");
    if (!c.match(/\{\{([^}]+)\}\}/g)) {
       console.error(`[FAIL] project-profile.md should contain placeholders in template mode.`);
       errors++;
    }
  }
}

// In Installed mode: scan relevant text instruction/config files
if (isInstalled) {
  walkSync(root, (filepath) => {
    const ext = path.extname(filepath);
    // Package-wide check for unresolved placeholders in relevant extensions
    if (![".md", ".mdc", ".json", ".yaml", ".yml", ".toml", ".mjs", ".js"].includes(ext)) return;

    const relPath = path.relative(root, filepath).replace(/\\/g, "/");
    const content = fs.readFileSync(filepath, "utf8");

    // Exception: Validator source files contain explicit token definitions, with exact per-file token allowlists; all other package files have zero allowance.
    const allowList = allowedPlaceholders[relPath] || [];
    const placeholders = content.match(/\{\{([^}]+)\}\}/g) || [];

    for (const p of placeholders) {
      if (!allowList.includes(p)) {
        console.error(`[FAIL] ${relPath} contains unresolved placeholder: ${p}`);
        errors++;
      }
    }

    // Check generic unresolved markers ONLY in canonical project knowledge files
    if (canonicalDocs.includes(relPath)) {
      const unresolvedPattern = /REVIEW_REQUIRED|Replace with project facts|TODO\b|FIXME\b/i;
      if (unresolvedPattern.test(content)) {
        console.error(`[FAIL] ${relPath} contains unresolved markers (REVIEW_REQUIRED/TODO/FIXME/Replace...).`);
        errors++;
      }

      const fm = parseFrontmatter(content);
      if (!fm) {
         console.error(`[FAIL] ${relPath} is missing required frontmatter blocks.`);
         errors++;
      } else {
         const requiredKeys = ["last_verified", "evidence_sources", "impacted_modules", "decision_owner", "status"];
         for (const k of requiredKeys) {
             if (!(k in fm)) {
                 console.error(`[FAIL] ${relPath} frontmatter missing key: ${k}`);
                 errors++;
             } else if (!fm[k] || fm[k] === "''" || fm[k] === '""' || fm[k].includes("{{")) {
                 console.error(`[FAIL] ${relPath} frontmatter has empty or placeholder value for: ${k}`);
                 errors++;
             }
         }
         if (fm.status !== "VERIFIED") {
             console.error(`[FAIL] ${relPath} status must be VERIFIED in installed mode, got: ${fm.status}`);
             errors++;
         }
         if (fm.last_verified && fm.last_verified !== "''" && fm.last_verified !== '""' && !fm.last_verified.includes("{{")) {
             const iso8601Regex = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/;
             const d = new Date(fm.last_verified);
             if (!iso8601Regex.test(fm.last_verified) || Number.isNaN(d.getTime())) {
                 console.error(`[FAIL] ${relPath} last_verified is not a valid ISO-8601 date: ${fm.last_verified}`);
                 errors++;
             }
         }
      }
    }
  });
}

if (errors > 0) {
  console.error(`[END] check-project-customization FAIL with ${errors} errors.`);
  process.exit(1);
} else {
  console.log("[END] check-project-customization PASS.");
}
