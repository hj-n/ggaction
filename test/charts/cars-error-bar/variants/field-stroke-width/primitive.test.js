import assert from "node:assert/strict";
import test from "node:test";

import { loadCars } from "../../../../support/data.js";
import { createCarsWeightedRulePrimitives } from "./primitive.program.js";

test("authors the approved field-driven stroke-width primitive", () => {
  const program = createCarsWeightedRulePrimitives(loadCars());
  const widths = program.graphicSpec.objects.cars.items.map(
    item => item.properties.strokeWidth
  );

  assert.equal(widths.length, 8);
  assert.equal(new Set(widths).size > 1, true);
  assert.equal(
    program.trace.children.some(node => node.op === "encodeStrokeWidth"),
    false
  );
});
