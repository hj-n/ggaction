import assert from "node:assert/strict";
import test from "node:test";

import { loadCars } from "../../support/data.js";
import { linearPathCommands } from "../../support/path.js";
import { createCarsErrorBandPrimitives } from "./primitive.program.js";
import {
  ERROR_BAND_COLORS,
  ERROR_BAND_FIELDS,
  createCarsErrorBandReferenceValues
} from "./reference-values.js";

function flattenActions(node) {
  return [node, ...(node.children ?? []).flatMap(flattenActions)];
}

test("locks independent Year by Origin confidence intervals", () => {
  const values = createCarsErrorBandReferenceValues(loadCars());

  assert.equal(values.rows.length, 36);
  assert.deepEqual(values.origins, ["USA", "Europe", "Japan"]);
  assert.deepEqual(values.scales.x.domain, [
    Date.UTC(1970, 0, 1),
    Date.UTC(1982, 0, 1)
  ]);
  assert.deepEqual(values.scales.y.domain, [-20, 60]);
  assert.deepEqual(values.axes.x.ticks.map(tick => tick.label), [
    "1970", "1972", "1974", "1976", "1978", "1980", "1982"
  ]);
  assert.deepEqual(values.axes.y.ticks.map(tick => tick.value), [
    -20, 0, 20, 40, 60
  ]);

  const usa1970 = values.intervals.find(row =>
    row.Year === "1970-01-01" && row.Origin === "USA"
  );
  assert.equal(usa1970.count, 27);
  assert.ok(Math.abs(usa1970.mean - 11.685185185185185) < 1e-12);
  assert.ok(Math.abs(usa1970.lower - 10.58782157912761) < 1e-12);
  assert.ok(Math.abs(usa1970.upper - 12.78254879124276) < 1e-12);

  const sparse1979 = values.intervals.find(row =>
    row.Year === "1979-01-01" && row.Origin === "Japan"
  );
  assert.equal(sparse1979.count, 2);
  assert.ok(Math.abs(sparse1979.lower - -8.212409472864191) < 1e-12);
  assert.ok(Math.abs(sparse1979.upper - 42.61240947286419) < 1e-12);

  for (const row of values.rows) {
    assert.ok(row[ERROR_BAND_FIELDS.lower] <= row[ERROR_BAND_FIELDS.center]);
    assert.ok(row[ERROR_BAND_FIELDS.center] <= row[ERROR_BAND_FIELDS.upper]);
  }
  for (const series of values.series) {
    const times = series.values.map(row => row.time);
    assert.deepEqual(times, [...times].sort((left, right) => left - right));
  }
});

test("authors the Cars vertical error band with raw primitives", () => {
  const cars = loadCars();
  const values = createCarsErrorBandReferenceValues(cars);
  const program = createCarsErrorBandPrimitives(cars);
  const layer = program.semanticSpec.layers.find(item => item.id === "errorBand");
  const dataset = program.semanticSpec.datasets.find(
    item => item.id === "errorBandIntervalData"
  );
  const paths = program.graphicSpec.objects.errorBand.children;

  assert.equal(layer.mark.type, "area");
  assert.equal(layer.data, "errorBandIntervalData");
  assert.equal(layer.encoding.x.fieldType, "temporal");
  assert.equal(layer.encoding.y.field, ERROR_BAND_FIELDS.lower);
  assert.equal(layer.encoding.y2.field, ERROR_BAND_FIELDS.upper);
  assert.equal(layer.encoding.group.field, "Origin");
  assert.equal(layer.encoding.color.field, "Origin");
  assert.deepEqual(dataset.transform, [values.transform]);
  assert.deepEqual(dataset.values, values.rows);
  assert.equal(paths.length, 3);
  assert.deepEqual(
    paths.map(path => path.properties.commands),
    values.series.map(series => linearPathCommands(series.points, { close: true }))
  );
  assert.deepEqual(
    paths.map(path => path.properties.fill),
    ERROR_BAND_COLORS
  );
  assert.deepEqual(
    paths.map(path => path.properties.opacity),
    [0.2, 0.2, 0.2]
  );

  const order = program.graphicSpec.order;
  assert.ok(order.indexOf("horizontalGridLines") < order.indexOf("errorBand"));
  assert.ok(order.indexOf("errorBand") < order.indexOf("xAxisLine"));
  assert.ok(order.indexOf("errorBand") < order.indexOf("colorLegendSymbols"));
  assert.ok(order.indexOf("colorLegendSymbols") < order.indexOf("chartTitle"));

  const operations = flattenActions(program.trace).map(node => node.op);
  assert.equal(operations.includes("createErrorBand"), false);
  assert.equal(operations.includes("createIntervalData"), false);
  assert.equal(operations.includes("encodeYRange"), false);
});

test("owns input rows and rejects an empty valid dataset", () => {
  const cars = loadCars();
  const values = createCarsErrorBandReferenceValues(cars);
  const original = structuredClone(values.validCars[0]);

  cars[0].Acceleration = 999;
  assert.deepEqual(values.validCars[0], original);
  assert.throws(
    () => createCarsErrorBandReferenceValues([{ Year: null }]),
    /at least one valid car row/
  );
});

