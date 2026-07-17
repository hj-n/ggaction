import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../src/ChartProgram.js";
import { assertChartProgramsEquivalent } from "../support/chart-equivalence.js";
import {
  concreteGraphicSnapshot,
  graphicTreeSnapshot
} from "../support/graphic-tree.js";
import { walkGraphicTreeEvents } from
  "../../src/grammar/schemas/graphicTree.js";

function createFlatProgram() {
  return chart()
    .createGraphics({ id: "canvas", type: "canvas" })
    .editGraphics({ target: "canvas", property: "width", value: 100 })
    .editGraphics({ target: "canvas", property: "height", value: 80 })
    .createGraphics({ id: "grid", type: "line", length: 0 })
    .createGraphics({ id: "points", type: "circle", length: 0 })
    .createGraphics({ id: "axis", type: "line", length: 0 });
}

function createNestedProgram() {
  return chart()
    .createGraphics({ id: "canvas", type: "canvas" })
    .editGraphics({ target: "canvas", property: "width", value: 100 })
    .editGraphics({ target: "canvas", property: "height", value: 80 })
    .createGraphics({ id: "plot-main", type: "collection", parent: "canvas" })
    .createGraphics({ id: "grid", type: "line", length: 0, parent: "plot-main" })
    .createGraphics({ id: "points", type: "circle", length: 0, parent: "plot-main" })
    .createGraphics({ id: "axis", type: "line", length: 0, parent: "plot-main" });
}

test("snapshots roots, ownership, items, and depth-first drawing order", () => {
  const nested = createNestedProgram();

  assert.deepEqual(graphicTreeSnapshot(nested), {
    roots: ["canvas"],
    nodes: [{
      id: "canvas",
      type: "canvas",
      parent: null,
      children: ["plot-main"],
      itemIds: []
    }, {
      id: "plot-main",
      type: "collection",
      parent: "canvas",
      children: ["grid", "points", "axis"],
      itemIds: []
    }, {
      id: "grid",
      type: "line",
      parent: "plot-main",
      children: [],
      itemIds: []
    }, {
      id: "points",
      type: "circle",
      parent: "plot-main",
      children: [],
      itemIds: []
    }, {
      id: "axis",
      type: "line",
      parent: "plot-main",
      children: [],
      itemIds: []
    }],
    drawOrder: ["canvas", "plot-main", "grid", "points", "axis"]
  });
});

test("separates concrete node equality from attachment equality", () => {
  const flat = createFlatProgram();
  const nested = createNestedProgram();

  assert.deepEqual(
    concreteGraphicSnapshot(nested, { exclude: ["plot-main"] }),
    concreteGraphicSnapshot(flat)
  );
  assert.throws(
    () => assertChartProgramsEquivalent({
      publicProgram: flat,
      primitiveProgram: nested
    }),
    assert.AssertionError
  );
  assertChartProgramsEquivalent({
    publicProgram: nested,
    primitiveProgram: nested
  });
  assert.deepEqual(flat.graphicSpec.order, ["canvas", "grid", "points", "axis"]);
});

test("preserves extension-authored top-level graphics", () => {
  const program = createNestedProgram().createGraphics({
    id: "extension-note",
    type: "text"
  });

  assert.deepEqual(program.graphicSpec.order, ["canvas", "extension-note"]);
  assert.equal(
    graphicTreeSnapshot(program).nodes.find(node => node.id === "extension-note").parent,
    null
  );
});

test("emits balanced recursive enter and exit events", () => {
  const events = [];
  walkGraphicTreeEvents(createNestedProgram().graphicSpec, {
    enter: ({ id }) => events.push(`enter:${id}`),
    exit: ({ id }) => events.push(`exit:${id}`)
  });

  assert.deepEqual(events, [
    "enter:canvas",
    "enter:plot-main",
    "enter:grid",
    "exit:grid",
    "enter:points",
    "exit:points",
    "enter:axis",
    "exit:axis",
    "exit:plot-main",
    "exit:canvas"
  ]);
});
