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

test("revises gradient source and roles with stable body, center, and guides", () => {
  const alternate = Object.freeze([
    Object.freeze({ team: "R", score: 3 }),
    Object.freeze({ team: "R", score: 5 }),
    Object.freeze({ team: "R", score: 8 }),
    Object.freeze({ team: "S", score: 4 }),
    Object.freeze({ team: "S", score: 7 }),
    Object.freeze({ team: "S", score: 11 })
  ]);
  const before = chart()
    .createCanvas({
      width: 420,
      height: 320,
      margin: { top: 40, right: 90, bottom: 60, left: 60 }
    })
    .createData({ id: "rows", values: rows })
    .createData({ id: "alternate", values: alternate })
    .createGradientPlot({
      id: "distribution",
      data: "rows",
      x: { field: "group", fieldType: "nominal" },
      y: { field: "value" }
    });
  const sourceEdited = before.editGradientPlot({
    data: "alternate",
    x: { field: "team", fieldType: "nominal" },
    y: { field: "score", fieldType: "quantitative" }
  });
  const flipped = sourceEdited.editGradientPlot({
    x: { field: "score", fieldType: "quantitative" },
    y: { field: "team", fieldType: "nominal" }
  });

  assert.equal(sourceEdited.markConfigs.distribution.gradientPlot.source, "alternate");
  assert.equal(
    sourceEdited.markConfigs.distribution.gradientPlot.profileId,
    "distributionProfileDataRevision1"
  );
  assert.equal(flipped.markConfigs.distribution.gradientPlot.orientation, "horizontal");
  assert.equal(
    flipped.markConfigs.distribution.gradientPlot.profileId,
    "distributionProfileDataRevision2"
  );
  assert.deepEqual(
    flipped.semanticSpec.layers.map(layer => layer.id),
    ["distribution", "distributionCenter"]
  );
  for (const id of ["distribution", "distributionCenter"]) {
    const layer = flipped.semanticSpec.layers.find(item => item.id === id);
    assert.equal(layer.data, "distributionProfileDataRevision2");
    assert.equal(layer.encoding.x.scale, "y");
    assert.equal(layer.encoding.y.scale, "x");
    assert.equal(flipped.graphicSpec.objects[id].items.length, 2);
  }
  assert.equal(flipped.semanticSpec.guides.axis.x.scale, "y");
  assert.equal(flipped.semanticSpec.guides.axis.x.title, "score");
  assert.equal(flipped.semanticSpec.guides.axis.y.scale, "x");
  assert.equal(flipped.semanticSpec.guides.axis.y.title, "team");
  assert.equal(flipped.semanticSpec.guides.grid.horizontal, undefined);
  assert.equal(flipped.semanticSpec.guides.grid.vertical.scale, "y");
  assert.equal(
    flipped.semanticSpec.datasets.some(dataset =>
      dataset.id === "distributionProfileData"
    ),
    false
  );
  assert.equal(before.markConfigs.distribution.gradientPlot.source, "rows");
});

test("replays compatible gradient highlights and rejects stale selectors atomically", () => {
  const highlighted = gradient().highlightMarks({
    select: { field: "group", op: "eq", value: "B" },
    opacity: 0.4,
    bringToFront: false
  });
  const flipped = highlighted.editGradientPlot({
    x: { field: "value", fieldType: "quantitative" },
    y: { field: "group", fieldType: "nominal" }
  });
  assert.deepEqual(
    flipped.graphicSpec.objects.gradientPlot.items.map(
      item => item.properties.opacity
    ),
    [1, 0.4]
  );
  assert.equal(
    flipped.materializationConfigs.highlights.gradientPlotSelection.target,
    "gradientPlot"
  );
  const staleSelection = chart()
    .createCanvas({ width: 420, height: 320 })
    .createData({
      id: "dual",
      values: rows.map(row => ({ ...row, team: `Team-${row.group}` }))
    })
    .createGradientPlot({
      data: "dual",
      x: { field: "group", fieldType: "nominal" },
      y: { field: "value" },
      guides: false
    })
    .highlightMarks({
      select: { field: "group", op: "eq", value: "B" },
      opacity: 0.4
    });
  assert.throws(
    () => staleSelection.editGradientPlot({
      x: { field: "value", fieldType: "quantitative" },
      y: { field: "team", fieldType: "nominal" }
    }),
    /not uniquely defined/
  );
  assert.equal(
    highlighted.markConfigs.gradientPlot.gradientPlot.orientation,
    "vertical"
  );
});

test("preflights invalid gradient role revisions and accepts equivalent calls", () => {
  const before = gradient();
  const equivalent = before.editGradientPlot({
    data: "rows",
    x: { field: "group", fieldType: "nominal" },
    y: { field: "value", fieldType: "quantitative" }
  });
  assert.deepEqual(
    equivalent.semanticSpec.datasets.map(dataset => dataset.id),
    before.semanticSpec.datasets.map(dataset => dataset.id)
  );
  assert.throws(
    () => before.editGradientPlot({
      x: { field: "group", fieldType: "nominal" },
      y: { field: "group", fieldType: "nominal" }
    }),
    /one categorical axis and one quantitative axis/
  );
  assert.throws(
    () => before.editGradientPlot({ data: "missing" }),
    /Unknown gradient-plot data/
  );
  assert.equal(
    before.markConfigs.gradientPlot.gradientPlot.profileId,
    "gradientPlotProfileData"
  );
});
