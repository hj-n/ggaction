import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { chart, hconcat, vconcat } from "../../src/index.js";
import { visualVariants } from "../charts/program-composition/variants/layouts/manifest.js";

const root = fileURLToPath(new URL("../..", import.meta.url));
const index = JSON.parse(readFileSync(path.join(
  root,
  "agent_docs/contract/ACTION_INDEX.json"
), "utf8"));
const inventory = JSON.parse(readFileSync(path.join(
  root,
  "agent_docs/impl/roadmap3/phase0/GATE_A_INVENTORY.json"
), "utf8"));
const declarations = readFileSync(path.join(root, "types/program.d.ts"), "utf8");
const declarationIndex = readFileSync(path.join(root, "types/index.d.ts"), "utf8");
const currentContract = readFileSync(path.join(
  root,
  "agent_docs/contract/current/COMPOSITION.md"
), "utf8");

test("leaves no Phase 6 action or capability in Planned inventory", () => {
  const assignedActions = inventory.proposedActions
    .filter(action => action.phase === "phase6")
    .map(action => action.name);
  const assignedCapabilities = inventory.proposedCapabilities
    .filter(capability => capability.phase === "phase6")
    .map(capability => capability.id);
  const plannedActions = new Set(index.plannedActions.map(action => action.name));
  const plannedCapabilities = new Set(
    index.plannedCapabilities.map(capability => capability.id)
  );

  for (const name of assignedActions) assert.equal(plannedActions.has(name), false, name);
  for (const id of assignedCapabilities) {
    assert.equal(plannedCapabilities.has(id), false, id);
  }
});

test("locks the complete composition public surface into Current", () => {
  const current = new Set(index.actions.map(action => action.name));
  assert.equal(typeof hconcat, "function");
  assert.equal(typeof vconcat, "function");
  assert.equal(typeof chart().editCompositionLayout, "function");
  assert.equal(typeof chart().replaceCompositionChild, "function");
  assert.equal(current.has("editCompositionLayout"), true);
  assert.equal(current.has("replaceCompositionChild"), true);
  assert.match(declarationIndex, /export function hconcat/);
  assert.match(declarationIndex, /export function vconcat/);
  assert.match(declarations, /editCompositionLayout\(options: EditCompositionLayoutOptions\)/);
  assert.match(declarations, /replaceCompositionChild\(options: ReplaceCompositionChildOptions\)/);
  assert.match(currentContract, /## `editCompositionLayout`/);
  assert.match(currentContract, /## `replaceCompositionChild`/);
});

test("locks every approved composition target to a public rendering pair", () => {
  assert.deepEqual(
    visualVariants.map(variant => `${variant.chart}/${variant.variant}`),
    [
      "mixed-program-dashboard/unequal-horizontal",
      "mixed-program-dashboard/nested-dashboard",
      "mixed-program-dashboard/replacement"
    ]
  );
  for (const variant of visualVariants) {
    assert.equal(variant.artifact.phase, "phase6");
    assert.equal(variant.artifact.capability, "program-composition");
    assert.equal(typeof variant.userFacing, "function");
  }
});
