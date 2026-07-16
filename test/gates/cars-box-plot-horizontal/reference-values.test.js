import assert from "node:assert/strict";
import test from "node:test";

import { loadCars } from "../../support/data.js";
import {
  BOX_PLOT_FIELDS,
  createCarsHorizontalMinmaxReferenceValues
} from "../../charts/cars-box-plot/reference-values.js";

test("locks independent Cars horizontal minmax summaries", () => {
  const values = createCarsHorizontalMinmaxReferenceValues(loadCars());

  assert.deepEqual(values.categories, ["USA", "Europe", "Japan"]);
  assert.deepEqual(values.scales.x.domain, [0, 250]);
  assert.deepEqual(
    values.summaries.map(row => ({
      origin: row.Origin,
      count: row[BOX_PLOT_FIELDS.count],
      q1: row[BOX_PLOT_FIELDS.q1],
      median: row[BOX_PLOT_FIELDS.median],
      q3: row[BOX_PLOT_FIELDS.q3],
      lower: row[BOX_PLOT_FIELDS.lowerWhisker],
      upper: row[BOX_PLOT_FIELDS.upperWhisker]
    })),
    [
      { origin: "USA", count: 250, q1: 88, median: 106, q3: 150, lower: 52, upper: 230 },
      { origin: "Europe", count: 71, q1: 69.5, median: 77, q3: 90.5, lower: 46, upper: 133 },
      { origin: "Japan", count: 79, q1: 67, median: 75, q3: 95, lower: 52, upper: 132 }
    ]
  );
});

test("maps horizontal bodies, minmax whiskers, and vertical medians", () => {
  const values = createCarsHorizontalMinmaxReferenceValues(loadCars());

  assert.equal(values.boxes.length, 3);
  assert.equal(values.whiskers.length, 3);
  assert.equal(values.medians.length, 3);
  assert.ok(values.whiskers.every(rule => rule.y1 === rule.y2));
  assert.ok(values.lowerCaps.every(rule => rule.x1 === rule.x2));
  assert.ok(values.upperCaps.every(rule => rule.x1 === rule.x2));
  assert.ok(values.medians.every(rule => rule.x1 === rule.x2));
  assert.ok(values.medians.every((rule, index) =>
    rule.y1 === values.boxes[index].y &&
    rule.y2 === values.boxes[index].y + values.boxes[index].height
  ));
});

