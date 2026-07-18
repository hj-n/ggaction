import assert from "node:assert/strict";
import test from "node:test";

import { createCrossFeatureDashboardState } from
  "../../../examples/cross-feature-dashboard/program.js";
import { assertChartProgramsEquivalent } from
  "../../support/chart-equivalence.js";
import {
  loadCars,
  loadFashionTsne,
  loadNightingaleRose
} from "../../support/data.js";

import { createCrossFeatureDashboardPrimitiveState } from
  "./primitive.program.js";

test("matches the approved primitive with the user-facing composition flow", () => {
  const data = {
    cars: loadCars(),
    fashionRows: loadFashionTsne(),
    nightingale: loadNightingaleRose()
  };
  const primitive = createCrossFeatureDashboardPrimitiveState(data);
  const userFacing = createCrossFeatureDashboardState(data);

  assertChartProgramsEquivalent({
    primitiveProgram: primitive.revisedDashboard,
    publicProgram: userFacing.revisedDashboard
  });
  assert.equal(userFacing.revisedPolarPair.children.detail, userFacing.fashionPolar);
  assert.equal(userFacing.revisedDashboard.children.polarPair, userFacing.revisedPolarPair);
});
