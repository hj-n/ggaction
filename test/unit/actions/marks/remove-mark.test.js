import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../../../src/index.js";

const rows = Object.freeze([
  Object.freeze({ category: "A", x: 1, y: 2 }),
  Object.freeze({ category: "B", x: 2, y: 4 }),
  Object.freeze({ category: "A", x: 3, y: 5 })
]);

function layeredProgram() {
  return chart()
    .createCanvas({ width: 360, height: 240, margin: 50 })
    .createData({ id: "rows", values: rows })
    .createBarMark({ id: "bars" })
    .encodeX({ field: "category", fieldType: "nominal" })
    .encodeY({ field: "y", aggregate: "mean" })
    .createPointMark({ id: "points" })
    .createGuides();
}

test("removes one ordinary layer while preserving shared resources", () => {
  const before = layeredProgram();
  const after = before.removeMark({ target: "points" });

  assert.deepEqual(after.semanticSpec.layers.map(layer => layer.id), ["bars"]);
  assert.equal(after.graphicSpec.objects.points, undefined);
  assert.ok(after.graphicSpec.objects.bars);
  assert.ok(after.graphicSpec.objects.xAxisLine);
  assert.ok(after.graphicSpec.objects.yAxisLine);
  assert.ok(after.semanticSpec.datasets.find(dataset => dataset.id === "rows"));
  assert.ok(after.semanticSpec.scales.find(scale => scale.id === "x"));
  assert.ok(after.semanticSpec.scales.find(scale => scale.id === "y"));
  assert.deepEqual(before.semanticSpec.layers.map(layer => layer.id), ["bars", "points"]);
});

test("removes a composite owner, owned children, and unreferenced generated data", () => {
  const before = chart()
    .createCanvas({ width: 420, height: 280, margin: 50 })
    .createData({ id: "rows", values: rows })
    .createPointMark({ id: "points" })
    .encodeX({ field: "x" })
    .encodeY({ field: "y" })
    .encodeRadius({ value: 5 })
    .createRegression();
  const childIds = ["pointsRegressionBands", "pointsRegressionLines"];
  const after = before.removeMark({ target: "points" });

  assert.deepEqual(after.semanticSpec.layers, []);
  assert.equal(
    after.semanticSpec.datasets.some(dataset => dataset.id === "pointsRegressionData"),
    false
  );
  assert.ok(after.semanticSpec.datasets.find(dataset => dataset.id === "rows"));
  for (const id of ["points", ...childIds]) {
    assert.equal(after.graphicSpec.objects[id], undefined);
    assert.equal(after.markConfigs[id], undefined);
  }
  assert.throws(
    () => before.removeMark({ target: "pointsRegressionLines" }),
    /owned by "points"/
  );
});

test("cleans selection and highlight ownership with the removed mark", () => {
  const selected = chart()
    .createCanvas({ width: 320, height: 220, margin: 40 })
    .createData({ id: "rows", values: rows })
    .createPointMark({ id: "points" })
    .encodeX({ field: "x" })
    .encodeY({ field: "y" })
    .encodeRadius({ value: 5 })
    .selectMarks({ id: "high", property: "radius", op: "gte", value: 4 })
    .highlightMarks({ selection: "high", color: "#ef4444" });
  const after = selected.removeMark();

  assert.equal(after.materializationConfigs.selections, undefined);
  assert.equal(after.materializationConfigs.highlights, undefined);
  assert.equal(after.context.currentMark, undefined);
  assert.equal(after.context.currentSelection, undefined);
});

test("requires a stable unambiguous owner", () => {
  const program = layeredProgram();
  assert.throws(() => program.removeMark({ target: "missing" }), /Unknown mark target/);
  assert.deepEqual(program.removeMark().semanticSpec.layers.map(layer => layer.id), ["bars"]);
  assert.deepEqual(program.semanticSpec.layers.map(layer => layer.id), ["bars", "points"]);
});
