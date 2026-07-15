import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../../../src/index.js";
import { loadCars } from "../../../support/data.js";

const canvas = Object.freeze({
  width: 720,
  height: 460,
  margin: Object.freeze({ top: 90, right: 40, bottom: 70, left: 80 })
});

function encodedPoints() {
  return chart()
    .createCanvas(canvas)
    .createData({ values: loadCars() })
    .createPointMark()
    .encodeX({ field: "Origin", fieldType: "ordinal" })
    .encodeY({ field: "Acceleration" })
    .encodeColor({ field: "Origin" })
    .encodeRadius({ value: 3 });
}

test("creates the canonical vertical interval and wrapped cap hierarchy", () => {
  const program = chart()
    .createCanvas(canvas)
    .createData({ values: loadCars() })
    .createErrorBar({
      x: { field: "Origin", fieldType: "nominal" },
      y: { field: "Acceleration" }
    });
  const interval = program.semanticSpec.datasets[1];
  const action = program.trace.children.at(-1);

  assert.equal(action.op, "createErrorBar");
  assert.deepEqual(action.children.map(node => node.op), [
    "createIntervalData",
    "createRuleMark",
    "encodeX",
    "encodeY",
    "encodeY2",
    "encodeStroke",
    "encodeStrokeWidth",
    "encodeStrokeDash",
    "encodeOpacity",
    "createErrorBarCap",
    "createErrorBarCap"
  ]);
  assert.deepEqual(interval.transform[0], {
    type: "interval",
    field: "Acceleration",
    groupBy: ["Origin"],
    center: "mean",
    extent: "ci",
    level: 0.95,
    as: {
      center: "__errorBar_center",
      lower: "__errorBar_lower",
      upper: "__errorBar_upper"
    }
  });
  assert.deepEqual(
    program.semanticSpec.layers.map(layer => layer.id),
    ["errorBar", "errorBarLowerCap", "errorBarUpperCap"]
  );
  for (const child of action.children.filter(node => node.op === "createErrorBarCap")) {
    assert.equal(child.children.at(-1).op, "materializeRuleSpan");
  }
});

test("infers a no-option overlay from the current encoded layer", () => {
  const base = encodedPoints();
  const program = base.createErrorBar();
  const transform = program.semanticSpec.datasets.at(-1).transform[0];
  const [point, main, lower, upper] = program.semanticSpec.layers;

  assert.deepEqual(transform.groupBy, ["Origin"]);
  assert.equal(transform.field, "Acceleration");
  assert.deepEqual(
    [main, lower, upper].map(layer => [
      layer.coordinate,
      layer.encoding.x.scale,
      layer.encoding.y.scale
    ]),
    [
      [point.coordinate, point.encoding.x.scale, point.encoding.y.scale],
      [point.coordinate, point.encoding.x.scale, point.encoding.y.scale],
      [point.coordinate, point.encoding.x.scale, point.encoding.y.scale]
    ]
  );
  assert.deepEqual(program.resolvedScales.y.domain, [8, 24.8]);
  assert.equal(base.semanticSpec.layers.length, 1);
});

test("infers explicit semantic grouping from another compatible mark type", () => {
  const rows = [
    { date: "2020-01-01", group: "A", value: 1 },
    { date: "2020-01-01", group: "A", value: 3 },
    { date: "2020-01-01", group: "B", value: 2 },
    { date: "2020-01-01", group: "B", value: 4 },
    { date: "2021-01-01", group: "A", value: 5 },
    { date: "2021-01-01", group: "A", value: 7 }
  ];
  const program = chart()
    .createCanvas(canvas)
    .createData({ values: rows })
    .createLineMark()
    .encodeX({ field: "date", fieldType: "temporal" })
    .encodeY({ field: "value", aggregate: "mean" })
    .encodeGroup({ field: "group" })
    .createErrorBar();

  assert.deepEqual(
    program.semanticSpec.datasets.at(-1).transform[0].groupBy,
    ["date", "group"]
  );
  assert.deepEqual(
    program.semanticSpec.datasets.at(-1).values.map(row => [row.date, row.group]),
    [
      ["2020-01-01", "A"],
      ["2020-01-01", "B"],
      ["2021-01-01", "A"]
    ]
  );
});

test("requires explicit choices for ambiguous sources and axis roles", () => {
  let ambiguous = chart()
    .createCanvas(canvas)
    .createData({ values: loadCars() })
    .createPointMark({ id: "first" })
    .encodeX({ target: "first", field: "Origin", fieldType: "ordinal" })
    .encodeY({ target: "first", field: "Acceleration" })
    .encodeRadius({ target: "first", value: 2 })
    .createPointMark({ id: "second" })
    .encodeX({ target: "second", field: "Origin", fieldType: "ordinal" })
    .encodeY({ target: "second", field: "Acceleration" })
    .encodeRadius({ target: "second", value: 2 })
    .createRuleMark({ id: "unencoded" });

  assert.throws(() => ambiguous.createErrorBar(), /target is ambiguous/);
  assert.equal(
    ambiguous.createErrorBar({ target: "first" })
      .semanticSpec.datasets.at(-1).source,
    "data"
  );

  const quantitative = chart()
    .createCanvas(canvas)
    .createData({ values: loadCars() })
    .createPointMark()
    .encodeX({ field: "Displacement" })
    .encodeY({ field: "Acceleration" })
    .encodeRadius({ value: 2 });
  assert.throws(
    () => quantitative.createErrorBar(),
    /requires a nominal, ordinal, or temporal x position/
  );
});

test("keeps fixed cap widths through scale and Canvas rematerialization", () => {
  const created = encodedPoints().createErrorBar();
  const resized = created.editCanvas({ width: 900 });

  for (const program of [created, resized]) {
    for (const id of ["errorBarLowerCap", "errorBarUpperCap"]) {
      for (const child of program.graphicSpec.objects[id].children) {
        assert.equal(child.properties.x2 - child.properties.x1, 8);
      }
    }
  }
  assert.notEqual(
    created.graphicSpec.objects.errorBar.children[0].properties.x1,
    resized.graphicSpec.objects.errorBar.children[0].properties.x1
  );
  assert.equal(
    created.graphicSpec.objects.errorBarLowerCap.children[0].properties.x1,
    176
  );
});

test("rejects unsupported staged options and duplicate default ownership atomically", () => {
  const base = encodedPoints();
  assert.throws(
    () => base.createErrorBar({ stroke: "red" }),
    /Unknown createErrorBar option/
  );
  const created = base.createErrorBar();
  assert.throws(() => created.createErrorBar(), /explicit error-bar id/);
  assert.equal(base.semanticSpec.datasets.length, 1);
  assert.equal(base.semanticSpec.layers.length, 1);
});
