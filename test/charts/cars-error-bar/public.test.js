import test from "node:test";

import { assertChartProgramsEquivalent } from "../../support/chart-equivalence.js";
import { loadCars } from "../../support/data.js";
import {
  createEncodedLayerInferencePrimitives,
  createErrorBarBaselinePrimitives,
  createRuleGeometryPrimitives
} from "./primitive.program.js";
import {
  createEncodedLayerInferenceProgram,
  createErrorBarProgram,
  createRuleGeometryProgram
} from "./public.program.js";

test("matches rule geometry with public rule actions", () => {
  assertChartProgramsEquivalent({
    primitiveProgram: createRuleGeometryPrimitives(),
    publicProgram: createRuleGeometryProgram()
  });
});

test("matches the canonical error-bar primitive with public actions", () => {
  const cars = loadCars();
  assertChartProgramsEquivalent({
    primitiveProgram: createErrorBarBaselinePrimitives(cars),
    publicProgram: createErrorBarProgram(cars)
  });
});

test("matches encoded-layer inference with public actions", () => {
  const cars = loadCars();
  assertChartProgramsEquivalent({
    primitiveProgram: createEncodedLayerInferencePrimitives(cars),
    publicProgram: createEncodedLayerInferenceProgram(cars)
  });
});
