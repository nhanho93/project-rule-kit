import fs from "node:fs";
import path from "node:path";

export function getContinuityState(root) {
  let hasWorkflowFiles = false;
  let handoverDocs = [];
  let todoDocs = [];

  let config = {};
  const configPath = path.join(root, ".agent-system", "compliance.json");
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (typeof config !== "object" || config === null || Array.isArray(config)) {
        return { isActive: true, error: "Config must be an object" };
      }

      const allowedKeys = new Set(["enable_workflow"]);
      for (const key of Object.keys(config)) {
        if (!allowedKeys.has(key)) {
          return { isActive: true, error: `Config contains unknown key: ${key}` };
        }
      }
      if (config.enable_workflow !== undefined && typeof config.enable_workflow !== "boolean") {
        return { isActive: true, error: "Config enable_workflow must be boolean if present." };
      }
    } catch(e) {
      return { isActive: true, error: "Compliance config parse error: " + e.message };
    }
  }

  const searchDirs = [root, path.join(root, "tasks")];
  let exactPendingTodos = [];
  let suffixedPendingTodos = [];

  for (const dir of searchDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const p = path.join(dir, file);
      const relPath = path.relative(root, p).replace(/\\/g, "/");

      if (file === "handover.md" || file.match(/^handover-\d+\.md$/)) {
        hasWorkflowFiles = true;
        handoverDocs.push({ name: file, path: p, relPath, dir });
      } else if (file === "todo.md" || file.match(/^todo-\d+\.md$/)) {
        hasWorkflowFiles = true;
        todoDocs.push({ name: file, path: p, relPath, dir });
      } else if (file === "pending_todo.md") {
        hasWorkflowFiles = true;
        exactPendingTodos.push({ name: file, path: p, relPath, dir });
      } else if (file.match(/^pending_todo-\d+\.md$/)) {
        hasWorkflowFiles = true;
        suffixedPendingTodos.push({ name: file, path: p, relPath, dir });
      }
    }
  }

  if (hasWorkflowFiles || config.enable_workflow === true) {
    if (suffixedPendingTodos.length > 0) {
      return { isActive: true, error: "Found suffixed pending_todo variants. pending_todo.md must be a single live SSOT." };
    }
    if (exactPendingTodos.length !== 1) {
      return { isActive: true, error: `Expected exactly one base pending_todo.md across search dirs, found ${exactPendingTodos.length}.` };
    }
    if (handoverDocs.length === 0 || todoDocs.length === 0) {
      return { isActive: true, error: "Continuity workflow active but missing handover or todo head. Exact chains only and all three required if active." };
    }

    const getHead = (docs, prefix) => {
      docs.sort((a, b) => {
        const getNum = (n) => {
          const m = n.match(new RegExp(`^${prefix}-?(\\d+)\\.md$`));
          return m ? parseInt(m[1], 10) : -1;
        };
        return getNum(b.name) - getNum(a.name);
      });
      return docs[0];
    };

    return {
      isActive: true,
      headHandover: getHead(handoverDocs, "handover"),
      headTodo: getHead(todoDocs, "todo"),
      pendingTodo: exactPendingTodos[0]
    };
  }

  return { isActive: false };
}

export function getSuffix(name, prefix) {
  const m = name.match(new RegExp(`^${prefix}-?(\\d+)\\.md$`));
  return m ? parseInt(m[1], 10) : -1;
}

export function checkAdvance(currentHead, oldHeadPath, oldHeadHash, prefix, root, currentHash) {
  if (!currentHead || !oldHeadPath) return false;
  if (currentHead.dir !== path.dirname(path.join(root, oldHeadPath))) {
    return false;
  }
  const currentSuffix = getSuffix(currentHead.name, prefix);
  const oldSuffix = getSuffix(path.basename(oldHeadPath), prefix);

  if (currentSuffix > oldSuffix) {
    return true;
  } else if (currentSuffix === oldSuffix) {
    if (currentHead.relPath !== oldHeadPath) return false;
    return currentHash !== oldHeadHash;
  }
  return false;
}
