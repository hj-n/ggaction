import assert from "node:assert/strict";
import test from "node:test";

import { aggregateRows } from "../../../../src/grammar/aggregate.js";
import {
  BOX_FIELDS,
  deriveBoxData,
  normalizeBoxTransform
} from "../../../../src/grammar/boxPlot.js";
import {
  resolveDiscretizedColorScale
} from "../../../../src/grammar/scales/discretized.js";

test("locks the independent aggregate, box, and scale quantile contracts", () => {
  const aggregate = aggregateRows(
    [{ value: 10 }, { value: null }, { value: 0 }, { value: 30 }, { value: 20 }],
    "value",
    { op: "quantile", probability: 0.25 }
  );
  assert.equal(aggregate, 7.5);

  const box = deriveBoxData(
    [0, 10, 20, 30].map(value => ({ group: "A", value })),
    normalizeBoxTransform({ category: "group", field: "value" })
  );
  assert.deepEqual(box.summaries, [{
    group: "A",
    [BOX_FIELDS.q1]: 7.5,
    [BOX_FIELDS.median]: 15,
    [BOX_FIELDS.q3]: 22.5,
    [BOX_FIELDS.lowerWhisker]: 0,
    [BOX_FIELDS.upperWhisker]: 30,
    [BOX_FIELDS.lowerFence]: -15,
    [BOX_FIELDS.upperFence]: 45,
    [BOX_FIELDS.count]: 4
  }]);

  const scale = resolveDiscretizedColorScale({
    type: "quantile",
    domain: "auto",
    range: ["a", "b", "c", "d"],
    values: [0, 0, 0, 10, 20]
  });
  assert.deepEqual(scale.domain, [0, 0, 0, 10, 20]);
  assert.deepEqual(scale.thresholds, [0, 0, 10]);
});

test("keeps quantile input policies intentionally non-equivalent", () => {
  assert.equal(
    aggregateRows(
      [{ value: 0 }, { value: Infinity }, { value: 10 }],
      "value",
      { op: "quantile", probability: 0.5 }
    ),
    5
  );
  assert.throws(
    () => deriveBoxData(
      [{ group: "A", value: 0 }, { group: "A", value: Infinity }],
      normalizeBoxTransform({ category: "group", field: "value" })
    ),
    /must contain finite numbers/
  );
  assert.throws(
    () => resolveDiscretizedColorScale({
      type: "quantile",
      domain: "auto",
      range: ["a", "b"],
      values: [0, Infinity]
    }),
    /must contain finite numbers/
  );
});
