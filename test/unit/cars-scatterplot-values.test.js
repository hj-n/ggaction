import assert from "node:assert/strict";
import test from "node:test";

import {
  createCarsScatterplotValues,
  mapLinear
} from "../programs/carsScatterplot.js";
import { loadCars } from "../fixtures/data.js";

const cars = loadCars();

test("precomputes concrete values for the cars scatterplot", () => {
  const values = createCarsScatterplotValues(cars);

  assert.equal(cars.length, 406);
  assert.equal(values.validCars.length, 392);
  assert.equal(values.x.length, 392);
  assert.equal(values.y.length, 392);
  assert.equal(values.fill.length, 392);
  assert.equal(Math.min(...values.x), 30);
  assert.equal(Math.max(...values.x), 610);
  assert.equal(Math.min(...values.y), 30);
  assert.equal(Math.max(...values.y), 370);
  assert.deepEqual(new Set(values.fill), new Set([
    "#4c78a8",
    "#f58518",
    "#54a24b"
  ]));
});

test("maps a constant domain to the range midpoint", () => {
  assert.deepEqual(mapLinear([5, 5], [0, 100]), [50, 50]);
});
