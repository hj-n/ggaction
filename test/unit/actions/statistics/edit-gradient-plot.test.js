import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../../../src/index.js";

const rows = Object.freeze([
  Object.freeze({ group: "A", value: 1 }),
  Object.freeze({ group: "A", value: 2 }),
  Object.freeze({ group: "A", value: 3 }),
  Object.freeze({ group: "B", value: 2 }),
  Object.freeze({ group: "B", value: 4 }),
  Object.freeze({ group: "B", value: 6 })
]);

function gradient() {
  return chart()
    .createCanvas({
      width: 420,
      height: 320,
      margin: { top: 40, right: 90, bottom: 60, left: 60 }
    })
    .createData({ id: "rows", values: rows })
    .createGradientPlot({
      x: { field: "group", fieldType: "nominal" },
      y: { field: "value" },
      density: { bandwidth: 0.5, steps: 8 },
      guides: false
    });
}

test("retains profile identity for appearance-only edits", () => {
  const original = gradient();
  const profileId = original.markConfigs.gradientPlot.gradientPlot.profileId;
  const edited = original.editGradientPlot({
    width: { band: 0.5 },
    gradient: { opacity: [0.2, 0.8] },
    center: { stroke: "#ff0000", strokeWidth: 2 }
  });

  assert.equal(edited.markConfigs.gradientPlot.gradientPlot.profileId, profileId);
  assert.equal(edited.semanticSpec.datasets.filter(item =>
    item.transform?.[0]?.type === "gradientProfile"
  ).length, 1);
  assert.equal(
    edited.graphicSpec.objects.gradientPlotCenter.items.every(
      item => item.properties.stroke === "#ff0000" &&
        item.properties.strokeWidth === 2
    ),
    true
  );
  assert.equal(
    edited.graphicSpec.objects.gradientPlot.items[0].properties.width <
      original.graphicSpec.objects.gradientPlot.items[0].properties.width,
    true
  );
  assert.equal(original.graphicSpec.objects.gradientPlotCenter.items[0].properties.strokeWidth, 1.5);
});

test("creates one raw-source profile revision and releases the orphan", () => {
  const original = gradient();
  const previousId = original.markConfigs.gradientPlot.gradientPlot.profileId;
  const edited = original.editGradientPlot({
    density: { bandwidth: 0.8, steps: 10 },
    center: { type: "mean" }
  });
  const config = edited.markConfigs.gradientPlot.gradientPlot;
  const profiles = edited.semanticSpec.datasets.filter(item =>
    item.transform?.[0]?.type === "gradientProfile"
  );

  assert.notEqual(config.profileId, previousId);
  assert.equal(profiles.length, 1);
  assert.equal(profiles[0].source, "rows");
  assert.equal(profiles[0].transform[0].steps, 10);
  assert.equal(profiles[0].transform[0].center, "mean");
  assert.equal(edited.semanticSpec.layers.every(layer =>
    layer.data === config.profileId
  ), true);
  assert.equal(original.semanticSpec.datasets.some(item => item.id === previousId), true);
});

test("removes and restores the complete optional center resource", () => {
  const original = gradient();
  const removed = original.editGradientPlot({ center: false });
  assert.equal(removed.semanticSpec.layers.some(layer => layer.id === "gradientPlotCenter"), false);
  assert.equal(removed.graphicSpec.objects.gradientPlotCenter, undefined);
  assert.equal(removed.markConfigs.gradientPlotCenter, undefined);

  const restored = removed.editGradientPlot({ center: {} });
  assert.equal(restored.semanticSpec.layers.some(layer => layer.id === "gradientPlotCenter"), true);
  assert.equal(restored.graphicSpec.objects.gradientPlotCenter.items.length, 2);
  assert.equal(restored.markConfigs.gradientPlot.gradientPlot.center.type, "median");
});

test("rejects empty edits and preserves caller-owned options", () => {
  const program = gradient();
  const options = { density: { steps: 9 } };
  const edited = program.editGradientPlot(options);

  options.density.steps = 20;
  assert.equal(edited.markConfigs.gradientPlot.gradientPlot.density.steps, 9);
  assert.throws(() => program.editGradientPlot({}), /requires at least one/);
  assert.throws(
    () => program.editGradientPlot({ center: { type: "mode" } }),
    /mean or median/
  );
});
