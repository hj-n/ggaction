import assert from "node:assert/strict";
import test from "node:test";

import { createCarsWeightedRules } from
  "../../../../../examples/cars-weighted-rules/program.js";
import { assertChartProgramsEquivalent } from
  "../../../../support/chart-equivalence.js";
import { loadCars } from "../../../../support/data.js";
import { createCarsWeightedRulePrimitives } from "./primitive.program.js";

test("authors item-level field-driven rule widths through the public API", () => {
  const program = createCarsWeightedRules(loadCars());
  const layer = program.semanticSpec.layers.find(item => item.id === "cars");

  assert.equal(layer.encoding.strokeWidth.field, "Weight_in_lbs");
  assert.equal(program.graphicSpec.objects.cars.items.length, 8);
  assert.equal(new Set(
    program.graphicSpec.objects.cars.items.map(item => item.properties.strokeWidth)
  ).size > 1, true);
  assert.equal(program.guideConfigs.legend.strokeWidth.target, "cars");
});

test("matches the approved weighted-rule primitive exactly", () => {
  const rows = loadCars();
  assertChartProgramsEquivalent({
    publicProgram: createCarsWeightedRules(rows),
    primitiveProgram: createCarsWeightedRulePrimitives(rows)
  });
});
