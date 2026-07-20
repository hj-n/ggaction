import assert from "node:assert/strict";
import test from "node:test";

import { assertChartProgramsEquivalent } from
  "../../support/chart-equivalence.js";
import { loadCars } from "../../support/data.js";
import { createCarsBinnedHeatmapPrimitives } from "./primitive.program.js";
import { createCarsBinnedHeatmap } from "./public.program.js";

test("matches the approved binned Cars heatmap primitive exactly", () => {
  const cars = loadCars();
  const primitive = createCarsBinnedHeatmapPrimitives(cars);
  const program = createCarsBinnedHeatmap(cars);

  assertChartProgramsEquivalent({
    publicProgram: program,
    primitiveProgram: primitive
  });
  assert.deepEqual(program.trace.children.map(node => node.op), [
    "createCanvas", "createData", "createHeatmap", "createTitle"
  ]);
  assert.deepEqual(program.trace.children[2].children.map(node => node.op), [
    "createBin2DData",
    "createRectMark",
    "encodeX",
    "encodeX2",
    "encodeY",
    "encodeY2",
    "encodeColor",
    "createGuides"
  ]);
});
