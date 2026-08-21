import fs from "node:fs";
import crypto from "node:crypto";

export function getCanonicalDocs() {
  return [
    "docs/agent-rules/project-profile.md",
    "docs/agent-rules/project-structure.md",
    "docs/agent-rules/code-conventions.md",
    "docs/agent-rules/markdown-conventions.md",
    "docs/agent-rules/delivery-profile.md"
  ];
}

export function hashFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

export function parseFrontmatter(content) {
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

export function isValidDateStr(str) {
  if (!str) return false;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const d = new Date(str + "T00:00:00Z");
    return !isNaN(d.getTime()) && str === d.toISOString().split("T")[0];
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(str)) {
    const d = new Date(str);
    return !isNaN(d.getTime());
  }
  return false;
}

export function checkFreshness(filepath, maxAgeDays, strict) {
  if (!fs.existsSync(filepath)) return { status: "missing" };
  const content = fs.readFileSync(filepath, "utf8");
  const fm = parseFrontmatter(content);
  if (!fm || !fm.last_verified) return { status: "invalid", message: "Missing last_verified frontmatter" };
  if (fm.status !== "VERIFIED") return { status: "invalid", message: "Status is not VERIFIED" };

  if (!isValidDateStr(fm.last_verified)) {
    return { status: "invalid", message: "last_verified must be strict YYYY-MM-DD or full ISO date with real calendar date" };
  }

  let verifiedDate;
  if (/^\d{4}-\d{2}-\d{2}$/.test(fm.last_verified)) {
    verifiedDate = new Date(fm.last_verified + "T00:00:00Z");
  } else {
    verifiedDate = new Date(fm.last_verified);
  }

  const ageMs = Date.now() - verifiedDate.getTime();

  if (ageMs < -300000) {
      return { status: "invalid", message: "future timestamp rejected" };
  }

  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  if (ageDays > maxAgeDays) {
    return { status: strict ? "fail" : "warn", message: `Stale knowledge (>${maxAgeDays} days): ${Math.floor(ageDays)} days old` };
  }
  return { status: "ok" };
}
