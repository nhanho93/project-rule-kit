import fs from "node:fs";
import path from "node:path";

const PROFILE = "docs/agent-rules/project-profile.md";

export function runCloseCases(h) {
  let root = h.project("no-change-repeat");
  h.customize(root);
  h.expect(h.run(root, "agent-preflight.mjs", h.basicArgs("CLOSE")), 0, null, "close baseline");
  const file = h.writeManifest(root, h.manifest("CLOSE"));
  h.expect(h.run(root, "agent-phase-close.mjs", ["--task-id", "CLOSE", "--manifest", file]), 0, "Phase close complete", "no-change close");
  h.expect(h.run(root, "agent-phase-close.mjs", ["--task-id", "CLOSE", "--manifest", file]), 0, "already closed", "idempotent close");
  fs.appendFileSync(path.join(root, file), " ");
  h.expect(h.run(root, "agent-phase-close.mjs", ["--task-id", "CLOSE", "--manifest", file]), 1, "different, modified", "modified repeat close");
  h.expect(h.run(root, "agent-preflight.mjs", ["--task-id", "CLOSE", "--safe-reset"]), 0, "generation 2", "closed safe reset");
  const reset = JSON.parse(fs.readFileSync(h.receiptPath(root, "CLOSE"), "utf8"));
  h.assert(reset.history.length === 1 && reset.history[0].generation === 1, "safe reset lost close history");

  root = h.project("changed-matrix");
  h.customize(root);
  h.expect(h.run(root, "agent-preflight.mjs", h.basicArgs("CHANGED")), 0, null, "changed baseline");
  fs.appendFileSync(path.join(root, PROFILE), "changed\n");
  let manifest = h.manifest("CHANGED", { knowledge_impact: "CHANGED", knowledge_files_impacted: [PROFILE] });
  h.writeManifest(root, manifest);
  h.expect(h.run(root, "agent-phase-close.mjs", ["--task-id", "CHANGED", "--manifest", "manifest.json"]), 0, null, "changed exact set");

  root = h.project("no-change-lie");
  h.customize(root);
  h.expect(h.run(root, "agent-preflight.mjs", h.basicArgs("LIE")), 0, null, "lie baseline");
  fs.appendFileSync(path.join(root, PROFILE), "changed\n");
  h.writeManifest(root, h.manifest("LIE"));
  h.expect(h.run(root, "agent-phase-close.mjs", ["--task-id", "LIE", "--manifest", "manifest.json"]), 1, "Declared NO_CHANGE", "no-change mismatch");

  root = h.project("manifest-security");
  h.customize(root);
  h.expect(h.run(root, "agent-preflight.mjs", h.basicArgs("SEC")), 0, null, "security baseline");
  manifest = h.manifest("SEC");
  manifest.verification[0].sanitized_output_summary = "Bearer abc.def.secret";
  h.writeManifest(root, manifest);
  h.expect(h.run(root, "agent-phase-close.mjs", ["--task-id", "SEC", "--manifest", "manifest.json"]), 1, "credential patterns", "secret value");
  manifest = h.manifest("SEC");
  manifest.verification[0] = { command: "x", exit_code: 0, evidence_path: ".agent-system/state/SEC.json" };
  h.writeManifest(root, manifest);
  h.expect(h.run(root, "agent-phase-close.mjs", ["--task-id", "SEC", "--manifest", "manifest.json"]), 1, "containment", "state evidence escape");
  manifest = h.manifest("SEC", { delivery: { operations: ["git"], target: "origin/main", authorized: false, evidence: [{ action: "push", result: "PASS" }] } });
  h.writeManifest(root, manifest);
  h.expect(h.run(root, "agent-phase-close.mjs", ["--task-id", "SEC", "--manifest", "manifest.json"]), 1, "authorized must be true", "unauthorized delivery evidence");
  manifest = h.manifest("SEC", { delivery: { operations: ["git", "git"], target: "origin/main", authorized: true, evidence: [{ action: "push", result: "PASS" }] } });
  h.writeManifest(root, manifest);
  h.expect(h.run(root, "agent-phase-close.mjs", ["--task-id", "SEC", "--manifest", "manifest.json"]), 1, "unique supported operations", "duplicate delivery operation");
  manifest = h.manifest("WRONG_TASK");
  h.writeManifest(root, manifest);
  h.expect(h.run(root, "agent-phase-close.mjs", ["--task-id", "SEC", "--manifest", "manifest.json"]), 1, "task_id does not match", "manifest task mismatch");

  root = h.project("unresolved");
  h.customize(root);
  h.expect(h.run(root, "agent-preflight.mjs", h.basicArgs("BLOCKED")), 0, null, "unresolved baseline");
  manifest = h.manifest("BLOCKED", { knowledge_impact: "UNRESOLVED", knowledge_files_impacted: [PROFILE], unresolved: { owner: "Ops", next_action: "Confirm policy" } });
  h.writeManifest(root, manifest);
  h.expect(h.run(root, "agent-phase-close.mjs", ["--task-id", "BLOCKED", "--manifest", "manifest.json"]), 2, "UNRESOLVED", "unresolved exit");

  root = h.project("continuity-close");
  h.customize(root);
  h.continuity(root);
  h.expect(h.run(root, "agent-preflight.mjs", h.basicArgs("FLOW")), 0, null, "continuity baseline");
  for (const name of ["handover-1.md", "todo-1.md", "pending_todo.md"]) fs.appendFileSync(path.join(root, "tasks", name), "updated\n");
  manifest = h.manifest("FLOW", { continuity: { pending_action: "UPDATED" } });
  h.writeManifest(root, manifest);
  h.expect(h.run(root, "agent-phase-close.mjs", ["--task-id", "FLOW", "--manifest", "manifest.json"]), 0, null, "continuity updated");
  const closed = JSON.parse(fs.readFileSync(h.receiptPath(root, "FLOW"), "utf8"));
  h.assert(closed.closeResult.continuitySummary.pendingAction === "UPDATED", "continuity summary not persisted");

  root = h.project("continuity-no-delta");
  h.customize(root);
  h.continuity(root);
  h.expect(h.run(root, "agent-preflight.mjs", h.basicArgs("NODELTA")), 0, null, "no-delta baseline");
  for (const name of ["handover-1.md", "todo-1.md"]) fs.appendFileSync(path.join(root, "tasks", name), "updated\n");
  h.writeManifest(root, h.manifest("NODELTA", { continuity: { pending_action: "UPDATED" } }));
  h.expect(h.run(root, "agent-phase-close.mjs", ["--task-id", "NODELTA", "--manifest", "manifest.json"]), 1, "pending_todo hash did not change", "pending update without delta");

  root = h.project("plan-hash-close-gate");
  h.customize(root);
  h.writeManifest(root, h.manifest("PLANNED", { classification: "complex" }));
  h.expect(h.run(root, "agent-preflight.mjs", h.complexArgs("PLANNED")), 0, "Mutation blocked", "planned close baseline");
  h.expect(h.run(root, "agent-phase-close.mjs", ["--task-id", "PLANNED", "--manifest", "manifest.json"]), 1, "plan gate is pending", "close before plan gate");
  fs.mkdirSync(path.join(root, "tasks", "plans"), { recursive: true });
  fs.writeFileSync(path.join(root, "tasks", "plans", "plan.md"), h.planContent("complex", ["multi_file"]));
  h.expect(h.run(root, "agent-plan-gate.mjs", ["--task-id", "PLANNED", "--plan", "tasks/plans/plan.md"]), 0, null, "planned task gate");
  fs.appendFileSync(path.join(root, "tasks", "plans", "plan.md"), "drift\n");
  h.expect(h.run(root, "agent-phase-close.mjs", ["--task-id", "PLANNED", "--manifest", "manifest.json"]), 1, "Gated plan changed", "plan drift close");
  h.expect(h.run(root, "agent-plan-gate.mjs", ["--task-id", "PLANNED", "--plan", "tasks/plans/plan.md", "--refresh"]), 0, null, "plan refresh");
  h.expect(h.run(root, "agent-phase-close.mjs", ["--task-id", "PLANNED", "--manifest", "manifest.json"]), 0, null, "planned close");
}
