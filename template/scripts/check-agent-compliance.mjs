#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHarness } from "./agent-compliance-fixtures/fixture-lib.mjs";
import { runPreflightCases } from "./agent-compliance-fixtures/cases-preflight.mjs";
import { runCloseCases } from "./agent-compliance-fixtures/cases-close.mjs";

const templateRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const harness = createHarness(templateRoot);

console.log("[START] check-agent-compliance");
try {
  runPreflightCases(harness);
  runCloseCases(harness);
  harness.assertSourceUnchanged();
  console.log(`[END] check-agent-compliance PASS: ${harness.caseCount()} cases, ${harness.assertCount()} assertions.`);
} catch (error) {
  console.error(`[END] check-agent-compliance FAIL: ${error.message}`);
  process.exitCode = 1;
} finally {
  harness.cleanup();
}
