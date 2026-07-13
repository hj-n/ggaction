import test from "node:test";

import { createCarsDensityArea } from
  "../../examples/cars-density-area/program.js";
import { loadCars } from "../fixtures/data.js";
import { assertRenderedPNG } from "../helpers/renderPNG.js";
import { createCarsDensityAreaPrimitives } from
  "../programs/carsDensityAreaPrimitives.js";

test("renders the public and primitive density area charts at 2x", async () => {
  const cars = loadCars();
  for (const [name, program] of [
    ["cars-density-area", createCarsDensityArea(cars)],
    ["cars-density-area-primitives", createCarsDensityAreaPrimitives(cars)]
  ]) {
    await assertRenderedPNG(program, {
      name,
      width: 720,
      height: 500,
      pixelRatio: 2,
      colors: ["#4c78a8", "#f58518", "#e45756"],
      minimumInkPixels: 1000
    });
  }
});
