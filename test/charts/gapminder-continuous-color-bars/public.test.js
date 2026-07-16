import assert from "node:assert/strict";
import test from "node:test";

import { GAPMINDER_CONTINUOUS_COLOR_BAR_BUILDERS } from
  "../../../examples/gapminder-continuous-color-bars/program.js";
import { assertChartProgramsEquivalent } from
  "../../support/chart-equivalence.js";
import { loadGapminder } from "../../support/data.js";
import { createGapminderContinuousColorBarPrimitives } from
  "./primitive.program.js";
import {
  CONTINUOUS_BAR_VARIANTS,
  createContinuousColorBarReference
} from "./reference-values.js";

const gapminder = loadGapminder();

for (const variant of CONTINUOUS_BAR_VARIANTS) {
  test(`builds the ${variant} continuous-color bars with public actions`, () => {
    const program = GAPMINDER_CONTINUOUS_COLOR_BAR_BUILDERS[variant](gapminder);
    const reference = createContinuousColorBarReference(gapminder, variant);
    const layer = program.semanticSpec.layers.find(item => item.id === "bar");

    assert.equal(layer.encoding.color.aggregate, reference.color.aggregate);
    assert.deepEqual(
      program.resolvedScales.color.domain,
      reference.domains.color
    );
    assert.equal(program.graphicSpec.objects.bar.children.length, 8);
    assert.equal(program.graphicSpec.objects.colorGradientStrips.children.length, 60);
    assert.deepEqual(program.trace.children.map(node => node.op), [
      "createCanvas",
      "createData",
      "filterData",
      "filterData",
      "createBarMark",
      "encodeX",
      "encodeY",
      "encodeColor",
      "encodeBarWidth",
      "createGuides",
      ...(variant === "reversed-life-expectancy" ? ["editScale"] : []),
      "createTitle"
    ]);
  });

  test(`exactly matches the approved ${variant} primitive`, () => {
    assertChartProgramsEquivalent({
      publicProgram: GAPMINDER_CONTINUOUS_COLOR_BAR_BUILDERS[variant](gapminder),
      primitiveProgram: createGapminderContinuousColorBarPrimitives(
        gapminder,
        variant
      )
    });
  });
}
