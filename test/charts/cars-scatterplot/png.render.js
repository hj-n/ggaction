import test from "node:test";

import { createCarsScatterplot } from "../../../examples/cars-scatterplot/program.js";
import { loadCars } from "../../support/data.js";
import { assertRenderedPNG } from "../../support/png.js";
import { createCarsScatterplotPrimitives } from "./primitive.program.js";

const cars = loadCars();

test("renders the public and primitive scatterplots with visible points", async () => {
  for (const [name, program, colors] of [
    [
      "cars-scatterplot",
      createCarsScatterplot(cars),
      ["#4c78a8", "#f58518", "#e45756"]
    ],
    [
      "cars-scatterplot-primitives",
      createCarsScatterplotPrimitives(cars),
      ["#4c78a8", "#f58518", "#54a24b"]
    ]
  ]) {
    await assertRenderedPNG(program, {
      name,
      width: 640,
      height: 400,
      colors
    });
  }
});
