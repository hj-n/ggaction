import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../../../src/index.js";

const rows = Object.freeze([
  Object.freeze({ group: "A", value: 1 }),
  Object.freeze({ group: "A", value: 3 }),
  Object.freeze({ group: "B", value: 2 }),
  Object.freeze({ group: "B", value: 6 })
]);

function errorBar(id = "errorBar") {
  return chart()
    .createCanvas({ width: 420, height: 300, margin: 50 })
    .createData({ values: rows })
    .createErrorBar({
      id,
      x: { field: "group", fieldType: "nominal" },
      y: { field: "value" }
    });
}

test("edits one error bar and reconciles its owned caps", () => {
  const before = errorBar();
  const withoutCaps = before.editErrorBar({
    caps: false,
    stroke: "#dc2626",
    strokeWidth: 3,
    strokeDash: [8, 4],
    opacity: 0.6
  });

  assert.equal(withoutCaps.semanticSpec.layers.some(
    layer => layer.id === "errorBarLowerCap"
  ), false);
  assert.equal(withoutCaps.graphicSpec.objects.errorBarLowerCap, undefined);
  assert.equal(before.graphicSpec.objects.errorBarLowerCap.type, "line");
  assert.deepEqual(
    withoutCaps.graphicSpec.objects.errorBar.items[0].properties.strokeDash,
    [8, 4]
  );
  assert.equal(withoutCaps.semanticSpec.datasets.at(-1).id, "errorBarIntervalData");

  const restored = withoutCaps.editErrorBar({
    caps: true,
    capSize: 14
  });
  const cap = restored.graphicSpec.objects.errorBarLowerCap.items[0].properties;
  assert.equal(cap.x2 - cap.x1, 14);
  assert.equal(cap.stroke, "#dc2626");
  assert.deepEqual(
    restored.trace.children.at(-1).children.map(child => child.op),
    ["rematerializeErrorBar"]
  );
});

test("resolves one owner and validates edits before changing state", () => {
  const single = errorBar("first");
  assert.equal(single.editErrorBar({ opacity: 0.5 }).markConfigs.first.errorBar.opacity, 0.5);
  assert.throws(() => single.editErrorBar({}), /requires at least one/);
  assert.throws(() => single.editErrorBar({ strokeWidth: -1 }), /strokeWidth/);
  assert.throws(() => single.editErrorBar({ unknown: true }), /Unknown editErrorBar option/);

  const two = single.createErrorBar({
    id: "second",
    data: "data",
    x: { field: "group", fieldType: "nominal", scale: { id: "x" } },
    y: { field: "value", scale: { id: "y" } }
  });
  assert.throws(() => two.editErrorBar({ opacity: 0.5 }), /ambiguous/);
  assert.equal(two.editErrorBar({ target: "second", opacity: 0.5 })
    .markConfigs.second.errorBar.opacity, 0.5);
});

test("revises statistical provenance and rebinds every error-bar consumer", () => {
  const before = errorBar();
  const after = before.editErrorBar({
    statistics: { center: "median", extent: "iqr" }
  });
  const revised = after.semanticSpec.datasets.find(
    dataset => dataset.id === "errorBarIntervalDataRevision1"
  );

  assert.deepEqual(revised.transform[0], {
    type: "interval",
    field: "value",
    groupBy: ["group"],
    center: "median",
    extent: "iqr",
    as: {
      center: "__errorBar_center",
      lower: "__errorBar_lower",
      upper: "__errorBar_upper"
    }
  });
  assert.deepEqual(
    after.semanticSpec.layers
      .filter(layer => layer.id.startsWith("errorBar"))
      .map(layer => layer.data),
    Array(3).fill("errorBarIntervalDataRevision1")
  );
  assert.equal(after.semanticSpec.datasets.some(
    dataset => dataset.id === "errorBarIntervalData"
  ), false);
  assert.equal(before.semanticSpec.layers[0].data, "errorBarIntervalData");
  assert.notDeepEqual(after.graphicSpec.objects.errorBar, before.graphicSpec.objects.errorBar);
});

test("rejects statistical edits for explicit error bars atomically", () => {
  const explicit = chart()
    .createCanvas({ width: 420, height: 300, margin: 50 })
    .createData({
      values: [{ group: "A", center: 2, lower: 1, upper: 3 }]
    })
    .createErrorBar({
      x: { field: "group", fieldType: "nominal" },
      y: { center: "center", lower: "lower", upper: "upper" }
    });
  assert.throws(
    () => explicit.editErrorBar({ statistics: { extent: "stdev" } }),
    /explicit interval fields cannot be converted/
  );
  assert.equal(explicit.semanticSpec.datasets.length, 1);
});
