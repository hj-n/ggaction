import assert from "node:assert/strict";
import test from "node:test";

import {
  deriveHorizon,
  validateHorizonTransform
} from "../../../src/grammar/horizon.js";
import { calculateHorizon } from "../../oracles/horizon.js";

const OUTPUT = Object.freeze({
  x: "horizonX",
  lower: "horizonLower",
  upper: "horizonUpper",
  group: "horizonGroup",
  color: "horizonColor",
  sign: "horizonSign",
  band: "horizonBand",
  segment: "horizonSegment"
});

function transform(overrides = {}) {
  return {
    type: "horizon",
    x: { field: "x", fieldType: "quantitative" },
    y: { field: "y", fieldType: "quantitative" },
    bands: 2,
    baseline: 0,
    extent: 6,
    resolve: "shared",
    missing: "break",
    overflow: "clip",
    palette: { positive: "blues", negative: "reds" },
    as: OUTPUT,
    ...overrides
  };
}

test("matches the independent crossing and folded-amplitude oracle", () => {
  const rows = [{ x: 10, y: 5 }, { x: 0, y: -5 }];
  const expected = calculateHorizon(rows, {
    xField: "x",
    yField: "y",
    bands: 2,
    baseline: 0,
    extent: 6
  });
  const actual = deriveHorizon(rows, transform());

  assert.deepEqual(
    actual.series.map(series => [
      series.sign,
      series.bandIndex,
      series.points.map(point => [point.x, point.amplitude])
    ]),
    expected.series.map(series => [
      series.sign,
      series.bandIndex,
      series.points.map(point => [point.x, point.amplitude])
    ])
  );
  assert.deepEqual(actual.resolved.extents, [{ extent: 6, bandHeight: 3 }]);
  assert.equal(actual.series[0].points[1].interpolated, true);
  assert.equal(actual.series[0].points[1].fraction, 0);
  assert.equal(actual.values.every(row =>
    row.horizonLower === 0 &&
    row.horizonUpper >= 0 &&
    row.horizonUpper <= 1
  ), true);
});

test("preserves deterministic groups, gaps, extents, and generated identities", () => {
  const rows = [
    { group: "A", x: 0, y: -2 },
    { group: "A", x: 1, y: null },
    { group: "A", x: 2, y: 4 },
    { group: "B", x: 0, y: -8 },
    { group: "B", x: 1, y: 3 }
  ];
  const actual = deriveHorizon(rows, transform({
    groupBy: "group",
    extent: "auto",
    resolve: "independent"
  }));

  assert.deepEqual(actual.resolved.extents, [
    { group: "A", extent: 4, bandHeight: 2 },
    { group: "B", extent: 8, bandHeight: 4 }
  ]);
  assert.equal(new Set(actual.series.map(series => series.seriesKey)).size,
    actual.series.length);
  assert.deepEqual(
    [...new Set(actual.values.map(row => row.horizonColor))],
    ["negative:0", "positive:0", "positive:1", "negative:1"]
  );
  assert.equal(Object.isFrozen(actual.values), true);
  assert.equal(Object.isFrozen(actual.resolved.extents), true);
});

test("normalizes temporal x values and accepts an all-baseline series", () => {
  const temporal = deriveHorizon([
    { date: "2001-01-01", value: 2 },
    { date: "2000-01-01", value: -2 }
  ], transform({
    x: { field: "date", fieldType: "temporal" },
    y: { field: "value", fieldType: "quantitative" }
  }));
  assert.equal(temporal.values.every(row => Number.isFinite(row.horizonX)), true);
  assert.equal(temporal.values[0].horizonX, Date.UTC(2000, 0, 1));

  const baseline = deriveHorizon([
    { x: 0, y: 5 },
    { x: 1, y: 5 }
  ], transform({ baseline: 5, extent: "auto" }));
  assert.deepEqual(baseline.resolved.extents, [{ extent: 0, bandHeight: 0 }]);
  assert.deepEqual(baseline.series, []);
  assert.deepEqual(baseline.values, []);
});

test("rejects ambiguous, destructive, and malformed Horizon inputs", () => {
  assert.throws(
    () => deriveHorizon([
      { group: "A", x: 1, y: 2 },
      { group: "A", x: 1, y: 3 }
    ], transform({ groupBy: "group" })),
    /duplicate x value/
  );
  assert.throws(
    () => deriveHorizon([{ x: 0, y: null }], transform({ missing: "error" })),
    /is missing/
  );
  assert.throws(
    () => deriveHorizon([{ x: 0, y: 9 }], transform({
      extent: 4,
      overflow: "error"
    })),
    /exceeds extent/
  );
  assert.throws(() => deriveHorizon([], transform()), /at least one source row/);
  assert.throws(
    () => validateHorizonTransform(transform({ bands: 0 })),
    /positive integer/
  );
  assert.throws(
    () => validateHorizonTransform(transform({
      palette: { positive: "not-a-palette", negative: "reds" }
    })),
    /Unknown palette/
  );
  assert.throws(
    () => validateHorizonTransform(transform({
      as: { ...OUTPUT, upper: OUTPUT.lower }
    })),
    /must be distinct/
  );
});
