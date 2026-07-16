import assert from "node:assert/strict";
import test from "node:test";

import { loadCars } from "../../support/data.js";
import {
  LINE_HIGHLIGHT_LAYOUT,
  selectJapanLineSeries
} from "./reference-values.js";

test("selects one complete Japan series independently from rendered paths", () => {
  const values = selectJapanLineSeries(loadCars());

  assert.deepEqual(values.origins, ["USA", "Europe", "Japan"]);
  assert.equal(values.target.key, "trends/series/2");
  assert.equal(values.target.index, 2);
  assert.equal(values.target.origin, "Japan");
  assert.equal(values.target.pointCount, 12);
  assert.equal(Number.isFinite(values.target.first.x), true);
  assert.equal(Number.isFinite(values.target.first.y), true);
  assert.equal(Number.isFinite(values.target.last.x), true);
  assert.equal(Number.isFinite(values.target.last.y), true);
});

test("keeps the semantic series while Canvas-only geometry changes", () => {
  const cars = loadCars();
  const baseline = selectJapanLineSeries(cars).target;
  const resized = selectJapanLineSeries(cars, {
    width: LINE_HIGHLIGHT_LAYOUT.width + 120
  }).target;

  assert.equal(resized.key, baseline.key);
  assert.equal(resized.origin, baseline.origin);
  assert.equal(resized.pointCount, baseline.pointCount);
  assert.equal(resized.first.x, baseline.first.x);
  assert.notEqual(resized.last.x, baseline.last.x);
});
