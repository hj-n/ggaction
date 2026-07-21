import assert from "node:assert/strict";
import test from "node:test";

import { loadGapminder } from "../../support/data.js";
import { assertChartProgramsEquivalent } from "../../support/chart-equivalence.js";
import { createGapminderCountryLabelPrimitiveResult } from "./primitive.program.js";
import { createGapminderCountryLabels } from "./public.program.js";

test("matches the approved primitive through the public label-layout action", () => {
  const gapminder = loadGapminder();
  const primitive = createGapminderCountryLabelPrimitiveResult(gapminder);
  const program = createGapminderCountryLabels(gapminder);

  assertChartProgramsEquivalent({
    publicProgram: program,
    primitiveProgram: primitive.program
  });
  assert.deepEqual(
    program.materializationConfigs.labelLayouts.countryLabels.resolution,
    {
      overlapBefore: primitive.resolution.overlapBefore,
      overlapAfter: primitive.resolution.overlapAfter,
      displaced: primitive.resolution.items.filter(item => item.distance > 0).length,
      leaders: primitive.leaders.length,
      maximumDisplacement: Math.max(
        ...primitive.resolution.items.map(item => item.distance)
      ),
      warnings: primitive.resolution.warnings
    }
  );
  const layout = program.trace.children.find(node => node.op === "layoutLabels");
  assert.deepEqual(layout.children.map(node => node.op), ["materializeLabelLayout"]);
  assert.equal(
    layout.children[0].children[0].op,
    "rematerializeTextMark"
  );
});
