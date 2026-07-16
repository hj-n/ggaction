import assert from "node:assert/strict";
import test from "node:test";

import { loadCars } from "../../support/data.js";
import {
  BAR_HIGHLIGHT_LAYOUT,
  selectLongestHistogramBar
} from "./reference-values.js";

test("selects the unique longest final histogram item by semantic count", () => {
  const { target } = selectLongestHistogramBar(loadCars());

  assert.deepEqual(target, {
    key: "bars/histogram/2",
    index: 2,
    bin: 0,
    interval: [50, 100],
    origin: "Japan",
    count: 47,
    concrete: {
      x: 80,
      y: 125.83333333333334,
      width: 32.44444444444444,
      height: 97.91666666666666
    }
  });
});

test("keeps the semantic target while Canvas-only geometry changes", () => {
  const cars = loadCars();
  const baseline = selectLongestHistogramBar(cars).target;
  const resized = selectLongestHistogramBar(cars, {
    height: BAR_HIGHLIGHT_LAYOUT.height + 120
  }).target;

  assert.equal(resized.key, baseline.key);
  assert.equal(resized.count, baseline.count);
  assert.deepEqual(resized.interval, baseline.interval);
  assert.equal(resized.origin, baseline.origin);
  assert.notEqual(resized.concrete.height, baseline.concrete.height);
  assert.notEqual(resized.concrete.y, baseline.concrete.y);
});
