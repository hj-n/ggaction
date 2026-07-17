import test from "node:test";

import { createProgramCompositionExample } from
  "../../../examples/program-composition/program.js";
import { assertChartProgramsEquivalent } from
  "../../support/chart-equivalence.js";
import { createProgramCompositionPrimitives } from "./primitive.program.js";

test("matches the composition example with its primitive baseline", () => {
  assertChartProgramsEquivalent({
    publicProgram: createProgramCompositionExample(),
    primitiveProgram: createProgramCompositionPrimitives()
  });
});
