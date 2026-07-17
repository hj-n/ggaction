import assert from "node:assert/strict";
import test from "node:test";

import {
  derivePolarLineSeries
} from "../../../src/grammar/lineSeries.js";
import {
  buildPolarLinePathCommands
} from "../../../src/grammar/polarLineCommands.js";

function layer(theta = { field: "angle", fieldType: "quantitative" }) {
  return {
    id: "line",
    mark: { type: "line" },
    encoding: {
      theta,
      radius: { field: "value", fieldType: "quantitative" },
      group: { field: "group", fieldType: "nominal" }
    }
  };
}

const frame = { centerX: 0, centerY: 0, availableRadius: 10 };
const radiusScale = { type: "linear", domain: [0, 10], range: [0, 10] };

test("groups Polar lines and sorts equal continuous theta values stably", () => {
  const derived = derivePolarLineSeries([
    { group: "a", angle: 90, value: 4, name: "first" },
    { group: "b", angle: 0, value: 2 },
    { group: "a", angle: 0, value: 1 },
    { group: "a", angle: 90, value: 6, name: "second" },
    { group: "b", angle: 180, value: 3 }
  ], layer());

  assert.deepEqual(derived.series.map(item => item.key), [
    { group: "a" },
    { group: "b" }
  ]);
  assert.deepEqual(
    derived.series[0].values.map(value => [value.theta, value.radius]),
    [[0, 1], [90, 4], [90, 6]]
  );
});

test("sorts categorical theta by the resolved domain rather than source order", () => {
  const derived = derivePolarLineSeries([
    { group: "a", role: "third", value: 3 },
    { group: "a", role: "first", value: 1 },
    { group: "a", role: "second", value: 2 }
  ], layer({ field: "role", fieldType: "nominal" }), {
    thetaDomain: ["first", "second", "third"]
  });

  assert.deepEqual(
    derived.series[0].values.map(value => value.theta),
    ["first", "second", "third"]
  );
});

test("builds exact open, closed, reversed, and full-circle seam commands", () => {
  const series = [
    { theta: 0, radius: 5 },
    { theta: 180, radius: 10 },
    { theta: 360, radius: 5 }
  ];
  const thetaScale = { type: "linear", domain: [360, 0], range: [0, 360] };
  const open = buildPolarLinePathCommands({
    series,
    thetaFieldType: "quantitative",
    thetaScale,
    radiusScale,
    frame
  });
  const closed = buildPolarLinePathCommands({
    series,
    thetaFieldType: "quantitative",
    thetaScale,
    radiusScale,
    frame,
    closed: true
  });

  assert.deepEqual(open.map(command => command.op), ["M", "L", "L"]);
  assert.ok(Math.abs(open[0].x - open.at(-1).x) < 1e-12);
  assert.ok(Math.abs(open[0].y - open.at(-1).y) < 1e-12);
  assert.deepEqual(closed, [...open, { op: "Z" }]);
});

test("rejects incomplete, invalid-domain, and one-point Polar series", () => {
  assert.throws(
    () => derivePolarLineSeries([
      { group: "a", angle: 0, value: 1 }
    ], layer()),
    /at least two points/
  );
  assert.throws(
    () => derivePolarLineSeries([
      { group: "a", role: "missing", value: 1 },
      { group: "a", role: "first", value: 2 }
    ], layer({ field: "role", fieldType: "nominal" }), {
      thetaDomain: ["first"]
    }),
    /does not contain/
  );
  assert.throws(
    () => buildPolarLinePathCommands({
      series: [{ theta: 0, radius: 1 }],
      thetaFieldType: "quantitative",
      thetaScale: { type: "linear", domain: [0, 1], range: [0, 360] },
      radiusScale,
      frame
    }),
    /at least two/
  );
});
