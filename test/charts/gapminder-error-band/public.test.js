import test from "node:test";

import { assertChartProgramsEquivalent } from "../../support/chart-equivalence.js";
import { loadGapminder } from "../../support/data.js";
import { createGapminderErrorBandPrimitives } from "./primitive.program.js";
import { createGapminderErrorBand } from "./public.program.js";

test("matches the approved Gapminder error-band primitive exactly", () => {
  const gapminder = loadGapminder();
  assertChartProgramsEquivalent({
    primitiveProgram: createGapminderErrorBandPrimitives(gapminder),
    publicProgram: createGapminderErrorBand(gapminder)
  });
});
