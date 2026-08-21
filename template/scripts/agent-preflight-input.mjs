export function parsePreflightArgs(args) {
  const result = {
    isSimple: args.includes("--simple"),
    isResume: args.includes("--resume"),
    isSafeReset: args.includes("--safe-reset"),
    isStrictFreshness: args.includes("--strict-freshness"),
    taskId: null,
    maxAgeDays: 30,
    classification: null,
    requestSummary: null,
    classificationSource: "policy",
    confirmationRef: null,
    classificationSignals: []
  };
  const values = new Map([
    ["--task-id", "taskId"], ["--classification", "classification"],
    ["--request-summary", "requestSummary"],
    ["--classification-source", "classificationSource"],
    ["--confirmation-ref", "confirmationRef"]
  ]);
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (values.has(arg)) {
      if (!args[index + 1] || args[index + 1].startsWith("--")) throw new Error(`${arg} is missing a value.`);
      result[values.get(arg)] = args[++index];
    } else if (arg === "--signal") {
      if (!args[index + 1] || args[index + 1].startsWith("--")) throw new Error("--signal is missing a value.");
      result.classificationSignals.push(args[++index]);
    } else if (arg === "--max-age-days") {
      const value = Number(args[++index]);
      if (!Number.isInteger(value) || value <= 0) throw new Error("--max-age-days must be a positive integer.");
      result.maxAgeDays = value;
    }
  }
  return result;
}
