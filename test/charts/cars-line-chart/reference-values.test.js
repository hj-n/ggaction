import assert from "node:assert/strict";
import test from "node:test";

import { createCarsLineChartValues } from "./reference-values.js";
import { loadCars } from "../../support/data.js";

const cars = loadCars();
const layout = {
  width: 720,
  height: 460,
  margin: { top: 80, right: 170, bottom: 60, left: 80 }
};

test("aggregates, groups, sorts, and maps the cars line-chart values", () => {
  const result = createCarsLineChartValues(cars, layout);

  assert.equal(result.validCars.length, 406);
  assert.equal(result.aggregates.length, 36);
  assert.deepEqual(result.origins, ["USA", "Europe", "Japan"]);
  assert.deepEqual(result.series.map(item => item.points.length), [12, 12, 12]);
  assert.deepEqual(result.series.map(item => item.strokeDash), [
    [],
    [8, 4],
    [3, 3]
  ]);
  assert.deepEqual(result.bounds, { x: 80, y: 80, width: 470, height: 320 });
  assert.deepEqual(result.scales.y.domain, [10, 20]);
  assert.deepEqual(result.scales.y.range, [400, 80]);
  assert.deepEqual(result.axes.x.ticks.map(item => item.label), [
    "1970", "1972", "1974", "1976", "1978", "1980", "1982"
  ]);
  assert.deepEqual(result.axes.y.ticks.map(item => item.value), [
    10, 12, 14, 16, 18, 20
  ]);
  assert.equal(result.series[0].values[0].origin, "USA");
  assert.equal(result.series[0].values[0].year, 1970);
  assert.ok(
    Math.abs(result.series[0].values[0].value - 11.685185185185185) < 1e-12
  );
  assert.equal(
    result.series.every(item =>
      item.values.every((value, index) =>
        index === 0 || item.values[index - 1].time < value.time
      )
    ),
    true
  );
});

test("keeps scale, legend, and title layout internally consistent", () => {
  const result = createCarsLineChartValues(cars, layout);

  assert.equal(result.series[0].points[0].x, result.scales.x.range[0]);
  assert.equal(result.series[0].points.at(-1).x, result.scales.x.range[1]);
  assert.deepEqual(
    result.legend.items.map(item => item.origin),
    result.origins
  );
  assert.deepEqual(
    result.legend.items.map(item => item.color),
    result.series.map(item => item.color)
  );
  assert.equal(result.title.text, "The trend of acceleration by year");
  assert.equal(result.title.subtitle, "from 1970 to 1982");
});

test("rejects invalid layout and empty valid data", () => {
  assert.throws(
    () => createCarsLineChartValues(cars, { ...layout, width: NaN }),
    /finite width and height/
  );
  assert.throws(
    () => createCarsLineChartValues([], layout),
    /at least one valid car row/
  );
});
