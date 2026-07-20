import assert from "node:assert/strict";
import test from "node:test";

import { assertChartProgramsEquivalent } from "../../support/chart-equivalence.js";
import { loadCars, loadGapminder } from "../../support/data.js";
import {
  createCarsOriginJitterPrimitives,
  createGapminderClusterJitterPrimitives
} from "./primitive.program.js";
import {
  createCarsOriginJitterProgram,
  createGapminderClusterJitterProgram
} from "./public.program.js";

test("matches the approved vertical jitter primitive exactly", () => {
  const cars = loadCars();
  const publicProgram = createCarsOriginJitterProgram(cars);
  assertChartProgramsEquivalent({
    primitiveProgram: createCarsOriginJitterPrimitives(cars),
    publicProgram
  });
  assert.deepEqual(
    publicProgram.trace.children.find(node => node.op === "jitterPoints")
      .children.map(node => node.op),
    ["rematerializePointMark"]
  );
});

test("matches the approved horizontal jitter primitive exactly", () => {
  const gapminder = loadGapminder();
  assertChartProgramsEquivalent({
    primitiveProgram: createGapminderClusterJitterPrimitives(gapminder),
    publicProgram: createGapminderClusterJitterProgram(gapminder)
  });
});
