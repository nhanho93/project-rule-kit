import fs from "node:fs";
import path from "node:path";

export function runPreflightCases(h) {
  let root = h.project("simple");
  h.expect(h.run(root, "agent-preflight.mjs", ["--simple"]), 0, "Read-only question mode", "question bypass");
  h.assert(!fs.existsSync(path.join(root, ".agent-system", "state")), "simple mode wrote receipt state");

  root = h.project("default-workflow", true);
  h.customize(root);
  h.expect(h.run(root, "agent-preflight.mjs", h.basicArgs("DEFAULT")), 0, "tasks/pending_todo.md", "default workflow context");

  root = h.project("actual-customization");
  h.expect(h.run(root, "agent-preflight.mjs", h.basicArgs("CUSTOM")), 1, "Project customization check failed", "unresolved template");
  h.customize(root);
  h.expect(h.run(root, "agent-preflight.mjs", h.basicArgs("TASK_A")), 0, "REQUIRED CONTEXT", "basic preflight A");
  const ignore = fs.readFileSync(path.join(root, ".agent-system", "state", ".gitignore"), "utf8");
  h.assert(ignore.includes("*\n!.gitignore"), "state .gitignore contract missing");
  h.expect(h.run(root, "agent-preflight.mjs", h.basicArgs("TASK_B")), 0, "REQUIRED CONTEXT", "basic preflight B");
  h.expect(h.run(root, "agent-preflight.mjs", h.basicArgs("bad/id")), 1, "invalid characters", "invalid task id");

  root = h.project("freshness");
  h.customize(root, "2026-02-30");
  h.expect(h.run(root, "agent-preflight.mjs", h.basicArgs("DATE")), 1, "strict YYYY-MM-DD", "invalid calendar date");
  h.customize(root, new Date(Date.now() + 86400000).toISOString());
  h.expect(h.run(root, "agent-preflight.mjs", h.basicArgs("FUTURE")), 1, "future timestamp", "future date");
  h.customize(root, new Date(Date.now() - 40 * 86400000).toISOString());
  h.expect(h.run(root, "agent-preflight.mjs", h.basicArgs("STALE", ["--strict-freshness"])), 1, "Stale knowledge", "strict stale date");
  h.expect(h.run(root, "agent-preflight.mjs", h.basicArgs("AGE", ["--max-age-days", "0"])), 1, "positive integer", "invalid max age");

  root = h.project("resume-reset-tamper");
  h.customize(root);
  h.continuity(root);
  h.expect(h.run(root, "agent-preflight.mjs", h.basicArgs("RESUME")), 0, null, "resume baseline");
  const receiptFile = h.receiptPath(root, "RESUME");
  const before = fs.readFileSync(receiptFile);
  fs.appendFileSync(path.join(root, "tasks", "todo-1.md"), "drift\n");
  h.expect(h.run(root, "agent-preflight.mjs", ["--task-id", "RESUME", "--resume"]), 0, "tasks/todo-1.md", "resume drift");
  h.assert(before.equals(fs.readFileSync(receiptFile)), "resume changed receipt bytes");
  h.expect(h.run(root, "agent-preflight.mjs", ["--task-id", "RESUME", "--safe-reset"]), 1, "Cannot reset an open or planning task", "open reset");
  const receipt = JSON.parse(fs.readFileSync(receiptFile, "utf8"));
  receipt.projectRoot = `${root}-sibling`;
  fs.writeFileSync(receiptFile, JSON.stringify(receipt));
  h.expect(h.run(root, "agent-preflight.mjs", ["--task-id", "RESUME", "--resume"]), 1, "project root", "tampered root");

  root = h.project("continuity-errors");
  h.customize(root);
  fs.mkdirSync(path.join(root, "tasks"), { recursive: true });
  fs.writeFileSync(path.join(root, "tasks", "handover-1.md"), "x");
  h.expect(h.run(root, "agent-preflight.mjs", h.basicArgs("PARTIAL")), 1, "exactly one base pending", "partial continuity");
  fs.writeFileSync(path.join(root, "tasks", "todo-1.md"), "x");
  fs.writeFileSync(path.join(root, "tasks", "pending_todo.md"), "x");
  fs.writeFileSync(path.join(root, "pending_todo.md"), "duplicate");
  h.expect(h.run(root, "agent-preflight.mjs", h.basicArgs("DUP")), 1, "found 2", "duplicate pending");
  fs.rmSync(path.join(root, "pending_todo.md"));
  fs.writeFileSync(path.join(root, "tasks", "pending_todo-2.md"), "bad");
  h.expect(h.run(root, "agent-preflight.mjs", h.basicArgs("SUFFIX")), 1, "suffixed pending_todo", "suffixed pending");

  root = h.project("config-errors");
  h.customize(root);
  fs.writeFileSync(path.join(root, ".agent-system", "compliance.json"), "{bad json");
  h.expect(h.run(root, "agent-preflight.mjs", h.basicArgs("CONFIG")), 1, "config parse error", "malformed config");

  root = h.project("malformed-receipt");
  h.customize(root);
  fs.mkdirSync(path.dirname(h.receiptPath(root, "BROKEN")), { recursive: true });
  fs.writeFileSync(h.receiptPath(root, "BROKEN"), "not-json");
  h.expect(h.run(root, "agent-preflight.mjs", ["--task-id", "BROKEN", "--resume"]), 1, "malformed JSON", "malformed receipt");

  root = h.project("classification-gates");
  h.customize(root);
  h.expect(h.run(root, "agent-preflight.mjs", ["--task-id", "MISSING"]), 1, "--classification", "missing classification");
  h.expect(h.run(root, "agent-preflight.mjs", ["--simple", "--task-id", "BAD_SIMPLE"]), 1, "only for read-only questions", "simple mutation arguments");
  const downgraded = ["--task-id", "DOWNGRADE", "--classification", "basic", "--request-summary", "Small RBAC change request", "--signal", "single_domain", "--signal", "small_reversible", "--signal", "auth_rbac"];
  h.expect(h.run(root, "agent-preflight.mjs", downgraded), 1, "Critical signal requires critical", "critical downgrade");
  const unconfirmed = ["--task-id", "UNCONFIRMED", "--classification", "critical", "--request-summary", "Production deployment request", "--signal", "deployment"];
  h.expect(h.run(root, "agent-preflight.mjs", unconfirmed), 1, "requires user_confirmed", "unconfirmed critical");
  h.expect(h.run(root, "agent-preflight.mjs", h.complexArgs("PLAN_GATE")), 0, "Mutation blocked", "complex planning receipt");
  const planning = JSON.parse(fs.readFileSync(h.receiptPath(root, "PLAN_GATE"), "utf8"));
  h.assert(planning.status === "planning" && planning.plan === null, "complex preflight did not create planning state");
  h.expect(h.run(root, "agent-plan-gate.mjs", ["--task-id", "PLAN_GATE", "--plan", "missing.md"]), 1, "existing file", "missing plan");
  fs.mkdirSync(path.join(root, "tasks", "plans"), { recursive: true });
  fs.writeFileSync(path.join(root, "tasks", "plans", "plan.md"), h.planContent("complex", ["multi_file"]));
  const profilePath = path.join(root, "docs", "agent-rules", "project-profile.md");
  const profileBeforeMutation = fs.readFileSync(profilePath, "utf8");
  fs.appendFileSync(profilePath, "pre-gate mutation\n");
  h.expect(h.run(root, "agent-plan-gate.mjs", ["--task-id", "PLAN_GATE", "--plan", "tasks/plans/plan.md"]), 1, "Workspace changed before initial plan approval", "pre-plan mutation block");
  fs.writeFileSync(profilePath, profileBeforeMutation);
  fs.writeFileSync(path.join(root, "tasks", "plans", "plan.md"), h.planContent("complex", ["multi_file"]).replace("WAVE_A <- NONE", "WAVE_A <- MISSING"));
  h.expect(h.run(root, "agent-plan-gate.mjs", ["--task-id", "PLAN_GATE", "--plan", "tasks/plans/plan.md"]), 1, "unknown blocker", "plan unknown dependency");
  const cyclicPlan = h.planContent("complex", ["multi_file"])
    .replace("Completion: deterministic fixture command passes.", "Completion: deterministic fixture command passes.\nSLICE WAVE_B: Verify the second bounded fixture outcome.")
    .replace("WAVE_A <- NONE", "WAVE_A <- WAVE_B\nWAVE_B <- WAVE_A");
  fs.writeFileSync(path.join(root, "tasks", "plans", "plan.md"), cyclicPlan);
  h.expect(h.run(root, "agent-plan-gate.mjs", ["--task-id", "PLAN_GATE", "--plan", "tasks/plans/plan.md"]), 1, "contains a cycle", "plan dependency cycle");
  fs.writeFileSync(path.join(root, "tasks", "plans", "plan.md"), h.planContent("complex", ["multi_file"]));
  h.expect(h.run(root, "agent-plan-gate.mjs", ["--task-id", "PLAN_GATE", "--plan", "tasks/plans/plan.md"]), 0, "Plan gate passed", "complex plan gate");
  const opened = JSON.parse(fs.readFileSync(h.receiptPath(root, "PLAN_GATE"), "utf8"));
  h.assert(opened.status === "open" && opened.plan.hash, "plan gate did not open receipt");

  root = h.project("critical-plan-approval");
  h.customize(root);
  h.expect(h.run(root, "agent-preflight.mjs", h.criticalArgs("CRITICAL")), 0, "Mutation blocked", "critical confirmed preflight");
  fs.mkdirSync(path.join(root, "tasks", "plans"), { recursive: true });
  fs.writeFileSync(path.join(root, "tasks", "plans", "critical.md"), h.planContent("critical", ["deployment"], "NOT_REQUIRED"));
  h.expect(h.run(root, "agent-plan-gate.mjs", ["--task-id", "CRITICAL", "--plan", "tasks/plans/critical.md"]), 1, "requires APPROVAL_STATUS", "critical approval gate");
  fs.writeFileSync(path.join(root, "tasks", "plans", "critical.md"), h.planContent("critical", ["deployment"], "APPROVED"));
  h.expect(h.run(root, "agent-plan-gate.mjs", ["--task-id", "CRITICAL", "--plan", "tasks/plans/critical.md"]), 0, "Plan gate passed", "approved critical plan");
  const criticalReceipt = JSON.parse(fs.readFileSync(h.receiptPath(root, "CRITICAL"), "utf8"));
  h.assert(criticalReceipt.classificationSource === "user_confirmed" && criticalReceipt.plan.approvalStatus === "APPROVED", "critical confirmation or approval was not persisted");
}
