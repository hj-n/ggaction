import assert from "node:assert/strict";
import test from "node:test";

import { GAPMINDER_DISCRETIZED_COLOR_BUILDERS } from
  "../../../examples/gapminder-discretized-color-scales/program.js";
import { assertChartProgramsEquivalent } from
  "../../support/chart-equivalence.js";
import { loadGapminder } from "../../support/data.js";
import { createGapminderDiscretizedColorPrimitives } from
  "./primitive.program.js";
import { DISCRETIZED_COLOR_TYPES } from "./reference-values.js";

const gapminder = loadGapminder();

for (const type of DISCRETIZED_COLOR_TYPES) {
  test(`builds the ${type} color chart with public actions`, () => {
    const program = GAPMINDER_DISCRETIZED_COLOR_BUILDERS[type](gapminder);
    const scale = program.semanticSpec.scales.find(item => item.id === "color");

    assert.equal(scale.type, type);
    assert.equal(program.resolvedScales.color.type, type);
    assert.equal(program.graphicSpec.objects.colorLegendSymbols.items.length, 5);
    assert.deepEqual(program.trace.children.map(node => node.op), [
      "createCanvas",
      "createData",
      "filterData",
      "createPointMark",
      "encodeX",
      "encodeY",
      "encodeColor",
      "encodeRadius",
      "editPointMark",
      "createGuides",
      "createTitle"
    ]);
  });

  test(`exactly matches the approved ${type} primitive`, () => {
    assertChartProgramsEquivalent({
      publicProgram: GAPMINDER_DISCRETIZED_COLOR_BUILDERS[type](gapminder),
      primitiveProgram: createGapminderDiscretizedColorPrimitives(gapminder, type)
    });
  });
}
