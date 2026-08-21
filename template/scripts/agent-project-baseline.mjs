import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const EXCLUDED_DIRS = new Set([
  ".git", "node_modules", ".next", "dist", "build", "coverage", ".cache"
]);

export function hashWorkspace(root) {
  const files = [];
  walk(root, root, files);
  const hash = crypto.createHash("sha256");
  for (const file of files.sort()) {
    const relative = path.relative(root, file).replace(/\\/g, "/");
    hash.update(relative);
    hash.update("\0");
    hash.update(fs.readFileSync(file));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function walk(root, current, files) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const target = path.join(current, entry.name);
    const relative = path.relative(root, target).replace(/\\/g, "/");
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name) || relative === ".agent-system/state" || relative === "tasks/plans") continue;
      walk(root, target, files);
    } else if (entry.isFile() && !relative.endsWith(".tmp")) {
      files.push(target);
    }
  }
}
