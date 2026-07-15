import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../../../src/index.js";
import { loadGapminder } from "../../../support/data.js";

const canvas = Object.freeze({
  width: 760,
  height: 480,
  margin: Object.freeze({ top: 90, right: 150, bottom: 70, left: 80 })
});

function directBand() {
  return chart()
    .createCanvas(canvas)
    .createData({ values: loadGapminder() })
    .createErrorBand({
      x: { field: "year", fieldType: "temporal" },
      y: { field: "life_expect" },
      groupBy: "cluster"
    });
}

test("creates one grouped statistical area through wrapped interval actions", () => {
  const program = directBand();
  const action = program.trace.children.at(-1);
  const interval = program.semanticSpec.datasets.at(-1);
  const layer = program.semanticSpec.layers[0];

  assert.deepEqual(action.children.map(child => child.op), [
    "createIntervalData",
    "createAreaMark",
    "encodeX",
    "encodeYRange",
    "encodeGroup"
  ]);
  assert.deepEqual(
    action.children.find(child => child.op === "encodeYRange")
      .children.map(child => child.op),
    ["encodeY", "encodeY2"]
  );
  assert.deepEqual(interval.transform[0], {
    type: "interval",
    field: "life_expect",
    groupBy: ["year", "cluster"],
    center: "mean",
    extent: "ci",
    level: 0.95,
    as: {
      center: "__errorBand_center",
      lower: "__errorBand_lower",
      upper: "__errorBand_upper"
    }
  });
  assert.deepEqual(layer.encoding, {
    x: { field: "year", fieldType: "temporal", scale: "x" },
    y: {
      field: "__errorBand_lower",
      fieldType: "quantitative",
      scale: "y"
    },
    y2: {
      field: "__errorBand_upper",
      fieldType: "quantitative",
      scale: "y"
    },
    group: { field: "cluster", fieldType: "nominal" }
  });
  assert.equal(interval.values.length, 66);
  assert.equal(program.graphicSpec.objects.errorBand.children.length, 6);
  assert.deepEqual(program.resolvedScales.y.domain, [30, 90]);
});

test("infers the source layer, channels, scales, coordinate, and grouping", () => {
  const base = chart()
    .createCanvas(canvas)
    .createData({ values: loadGapminder() })
    .createPointMark()
    .encodeX({ field: "year", fieldType: "temporal" })
    .encodeY({ field: "life_expect", scale: { nice: true, zero: false } })
    .createLineMark({ id: "trend" })
    .encodeX({ target: "trend", field: "year", fieldType: "temporal" })
    .encodeY({ target: "trend", field: "life_expect", aggregate: "mean" })
    .encodeGroup({ target: "trend", field: "cluster" });
  const program = base.createErrorBand();
  const source = base.semanticSpec.layers.find(layer => layer.id === "trend");
  const band = program.semanticSpec.layers.find(layer => layer.id === "errorBand");

  assert.equal(program.semanticSpec.datasets.at(-1).source, source.data);
  assert.deepEqual(program.semanticSpec.datasets.at(-1).transform[0].groupBy, [
    "year",
    "cluster"
  ]);
  assert.equal(band.coordinate, source.coordinate);
  assert.equal(band.encoding.x.scale, source.encoding.x.scale);
  assert.equal(band.encoding.y.scale, source.encoding.y.scale);
  assert.equal(band.encoding.group.field, "cluster");
});

test("explicit and statistical rows converge on the same concrete band", () => {
  const statistical = directBand();
  const rows = statistical.semanticSpec.datasets.at(-1).values;
  const explicit = chart()
    .createCanvas(canvas)
    .createData({ values: rows })
    .createErrorBand({
      x: { field: "year", fieldType: "temporal" },
      y: {
        center: "__errorBand_center",
        lower: "__errorBand_lower",
        upper: "__errorBand_upper"
      },
      groupBy: "cluster"
    });

  assert.equal(explicit.semanticSpec.datasets.length, 1);
  assert.equal(explicit.semanticSpec.layers[0].encoding.y.title, "__errorBand_center");
  assert.deepEqual(
    explicit.graphicSpec.objects.errorBand,
    statistical.graphicSpec.objects.errorBand
  );
  assert.deepEqual(explicit.resolvedScales, statistical.resolvedScales);
});

test("reassigns both vertical bounds atomically without mutating earlier programs", () => {
  const rows = [
    { year: 2000, low: 1, high: 4, nextLow: 2, nextHigh: 5 },
    { year: 2001, low: 2, high: 5, nextLow: 3, nextHigh: 7 }
  ];
  const before = chart()
    .createCanvas(canvas)
    .createData({ values: rows })
    .createAreaMark()
    .encodeX({ field: "year", fieldType: "temporal" })
    .encodeYRange({ lower: "low", upper: "high" });
  const after = before.encodeYRange({ lower: "nextLow", upper: "nextHigh" });

  assert.equal(before.semanticSpec.layers[0].encoding.y.field, "low");
  assert.equal(before.semanticSpec.layers[0].encoding.y2.field, "high");
  assert.equal(after.semanticSpec.layers[0].encoding.y.field, "nextLow");
  assert.equal(after.semanticSpec.layers[0].encoding.y2.field, "nextHigh");
  assert.notDeepEqual(after.graphicSpec.objects.area, before.graphicSpec.objects.area);
  assert.deepEqual(
    after.trace.children.at(-1).children.map(child => child.op),
    ["encodeY", "encodeY2"]
  );
});

test("rematerializes temporal area paths after Canvas edits", () => {
  const before = directBand();
  const after = before.editCanvas({ width: 860 });

  assert.notDeepEqual(
    after.graphicSpec.objects.errorBand,
    before.graphicSpec.objects.errorBand
  );
  assert.equal(
    after.trace.children.at(-1).children.some(
      child => child.op === "rematerializeAreaMark"
    ),
    true
  );
});

test("forwards constant area appearance through the owned mark action", () => {
  const program = chart()
    .createCanvas(canvas)
    .createData({ values: loadGapminder() })
    .createErrorBand({
      x: { field: "year", fieldType: "temporal" },
      y: { field: "life_expect" },
      fill: "#d9485f",
      opacity: 0.4
    });

  const child = program.graphicSpec.objects.errorBand.children[0];
  assert.equal(child.properties.fill, "#d9485f");
  assert.equal(child.properties.opacity, 0.4);
  assert.throws(() => chart()
    .createCanvas(canvas)
    .createData({ values: loadGapminder() })
    .createErrorBand({
      x: { field: "year", fieldType: "temporal" },
      y: { field: "life_expect" },
      opacity: 2
    }), /from 0 to 1/);
});

test("rejects ambiguous roles, occupied defaults, unsupported orientation, and invalid options", () => {
  const quantitative = chart()
    .createCanvas(canvas)
    .createData({ values: loadGapminder() })
    .createPointMark()
    .encodeX({ field: "fertility" })
    .encodeY({ field: "life_expect" });
  assert.throws(
    () => quantitative.createErrorBand(),
    /cannot infer the interval axis/
  );

  const created = directBand();
  assert.throws(() => created.createErrorBand({
    data: "data",
    x: { field: "year", fieldType: "temporal" },
    y: { field: "life_expect" }
  }), /explicit error-band id/);
  assert.throws(() => chart()
    .createCanvas(canvas)
    .createData({ values: loadGapminder() })
    .createErrorBand({
      x: { field: "life_expect", extent: "ci" },
      y: { field: "year", fieldType: "temporal" }
    }), /horizontal intervals require encodeXRange/);
  assert.throws(() => chart()
    .createCanvas(canvas)
    .createData({ values: loadGapminder() })
    .createErrorBand({
      x: { field: "year", fieldType: "temporal" },
      y: { field: "life_expect" },
      boundaries: true
    }), /Unknown createErrorBand option/);
  assert.throws(() => chart()
    .createCanvas(canvas)
    .createData({ values: loadGapminder() })
    .createErrorBand({
      x: { field: "year", fieldType: "temporal" },
      y: { field: "life_expect" },
      groupBy: "year"
    }), /must differ from the independent position field/);
});
