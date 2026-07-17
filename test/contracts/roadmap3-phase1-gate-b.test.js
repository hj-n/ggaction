import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { ChartProgram } from "../../src/ChartProgram.js";
import { visualVariants } from "../gates/roadmap3-focused-editing/manifest.js";

const root = fileURLToPath(new URL("../../", import.meta.url));
const inventory = JSON.parse(readFileSync(path.join(
  root,
  "agent_docs/impl/roadmap3/phase0/GATE_A_INVENTORY.json"
), "utf8"));
const index = JSON.parse(readFileSync(path.join(
  root,
  "agent_docs/contract/ACTION_INDEX.json"
), "utf8"));
const declarations = readFileSync(path.join(root, "types/program.d.ts"), "utf8");

const DIRECT_ACTIONS = Object.freeze([
  "editLegendLayout",
  "editLegendLabels",
  "editLegendTitle",
  "editLegendSymbols",
  "editLegendBorder",
  "editXAxis",
  "editYAxis",
  "editGrid",
  "editErrorBar",
  "editErrorBand",
  "editErrorBandBoundary",
  "editBoxPlot",
  "editRegression",
  "removeXAxis",
  "removeYAxis",
  "removeGrid",
  "removeLegend",
  "removeTitle",
  "removeMark"
]);

const EXTENSIONS = Object.freeze([
  "point-create-appearance",
  "bar-create-appearance",
  "line-constant-appearance",
  "scale-palette-edit"
]);

const CAPABILITIES = Object.freeze([
  "compatible-layer-inference",
  "focused-component-editing",
  "domain-removal",
  "exact-public-option-types",
  "api-layer-classification-alignment"
]);

test("locks the complete Phase 1 Gate A assignment", () => {
  assert.deepEqual(
    inventory.proposedActions
      .filter(action => action.phase === "phase1")
      .map(action => action.name),
    DIRECT_ACTIONS
  );
  assert.deepEqual(
    inventory.parameterExtensions
      .filter(extension => extension.phase === "phase1")
      .map(extension => extension.id),
    EXTENSIONS
  );
  assert.deepEqual(
    inventory.proposedCapabilities
      .filter(capability => capability.phase === "phase1")
      .map(capability => capability.id),
    CAPABILITIES
  );
});

test("keeps Phase 1 direct actions Planned and absent before Gate B approval", () => {
  const planned = new Set(index.plannedActions.map(action => action.name));
  const current = new Set(index.actions.map(action => action.name));
  for (const action of DIRECT_ACTIONS) {
    assert.equal(planned.has(action), true, action);
    assert.equal(current.has(action), false, action);
    assert.doesNotMatch(
      declarations,
      new RegExp(`^  ${action}\\(`, "m"),
      action
    );
  }
  for (const action of DIRECT_ACTIONS.filter(action => ![
    "editLegendLabels",
    "editLegendTitle",
    "editLegendSymbols"
  ].includes(action))) {
    assert.equal(ChartProgram.prototype[action], undefined, action);
  }
});

test("covers every Phase 1 public action in a primitive-only Gate target", () => {
  const callChains = visualVariants.map(target => target.callChain).join("\n");
  for (const action of DIRECT_ACTIONS) {
    assert.match(callChains, new RegExp(`\\.${action}\\(`), action);
  }
  for (const action of [
    "createPointMark",
    "createBarMark",
    "createLineMark",
    "editLineMark",
    "editScale"
  ]) {
    assert.match(callChains, new RegExp(`\\.${action}\\(`), action);
  }
  for (const target of visualVariants) {
    assert.deepEqual(target.artifact, {
      roadmap: "roadmap3",
      phase: "phase1",
      capability: target.artifact.capability
    });
    assert.equal(target.userFacing, undefined, target.variant);
  }
});
