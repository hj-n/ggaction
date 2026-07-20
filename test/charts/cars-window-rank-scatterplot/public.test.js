import assert from "node:assert/strict";
import test from "node:test";

import { createCarsWindowRankScatterplot } from "./public.program.js";
import { assertChartProgramsEquivalent } from
  "../../support/chart-equivalence.js";
import { loadCars } from "../../support/data.js";
import { createCarsWindowRankPrimitives } from "./primitive.program.js";

test("matches the window-rank primitive with the public action chain", () => {
  const cars = loadCars();
  const primitiveProgram = createCarsWindowRankPrimitives(cars);
  const publicProgram = createCarsWindowRankScatterplot(cars);

  assertChartProgramsEquivalent({ primitiveProgram, publicProgram });
  assert.equal(publicProgram.graphicSpec.objects.rankedCarsPlot.items.length, 47);
  assert.deepEqual(
    publicProgram.semanticSpec.datasets[2].values.reduce((counts, row) => ({
      ...counts,
      [row.Origin]: (counts[row.Origin] ?? 0) + 1
    }), {}),
    { USA: 17, Europe: 15, Japan: 15 }
  );
  assert.deepEqual(
    publicProgram.trace.children.map(node => node.op),
    [
      "createCanvas",
      "createData",
      "createWindowData",
      "filterData",
      "createScatterPlot",
      "encodePointRadius",
      "createTitle"
    ]
  );
});
