import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  createCarsScatterplotValues,
  mapLinear
} from "../helpers/carsScatterplotValues.js";

const cars = JSON.parse(
  readFileSync(new URL("../../data/cars.json", import.meta.url), "utf8")
);

test("cars scatterplot에 필요한 concrete 값을 계산한다", () => {
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

test("동일한 domain 값은 range 중앙에 배치한다", () => {
  assert.deepEqual(mapLinear([5, 5], [0, 100]), [50, 50]);
});
