import assert from "node:assert/strict";
import test from "node:test";

import { loadCars } from "../../support/data.js";
import { createCarsWindowRankPrimitives } from "./primitive.program.js";

test("authors the approved window-rank chart through explicit data primitives", () => {
  const program = createCarsWindowRankPrimitives(loadCars());

  assert.equal(program.graphicSpec.objects.rankedCarsPlot.items.length, 47);
  assert.deepEqual(
    program.semanticSpec.datasets[2].values.reduce((counts, row) => ({
      ...counts,
      [row.Origin]: (counts[row.Origin] ?? 0) + 1
    }), {}),
    { USA: 17, Europe: 15, Japan: 15 }
  );
  assert.equal(
    program.trace.children.some(node => node.op === "createWindowData"),
    false
  );
});
