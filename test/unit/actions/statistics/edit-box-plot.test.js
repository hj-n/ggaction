import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../../../src/index.js";
import { loadCars } from "../../../support/data.js";

function base() {
  return chart()
    .createCanvas({
      width: 360,
      height: 460,
      margin: { top: 140, right: 40, bottom: 70, left: 80 }
    })
    .createData({ values: loadCars() })
    .createBoxPlot({
      x: { field: "Origin", fieldType: "nominal" },
      y: { field: "Miles_per_Gallon" }
    });
}

const editOptions = Object.freeze({
  whisker: { type: "tukey", factor: 1 },
  width: { band: 0.5 },
  box: {
    fill: "#f28e2b",
    opacity: 0.82,
    stroke: "#9a3412",
    strokeWidth: 2
  },
  median: { stroke: "#431407", strokeWidth: 3 },
  outlier: { shape: "diamond", radius: 4, opacity: 0.9 }
});

test("revises one box summary and rebinds every owned component", () => {
  const before = base();
  const edited = before.editBoxPlot(editOptions);
  const direct = chart()
    .createCanvas({
      width: 360,
      height: 460,
      margin: { top: 140, right: 40, bottom: 70, left: 80 }
    })
    .createData({ values: loadCars() })
    .createBoxPlot({
      x: { field: "Origin", fieldType: "nominal" },
      y: { field: "Miles_per_Gallon" },
      ...editOptions
    });
  const summaryId = "boxPlotSummaryDataRevision1";
  const outlierId = "boxPlotOutlierDataRevision1";

  assert.equal(
    edited.semanticSpec.datasets.some(dataset => dataset.id === "boxPlotSummaryData"),
    false
  );
  assert.equal(
    edited.semanticSpec.datasets.some(dataset => dataset.id === "boxPlotOutlierData"),
    false
  );
  for (const id of [
    "boxPlot",
    "boxPlotWhisker",
    "boxPlotWhiskerLowerCap",
    "boxPlotWhiskerUpperCap",
    "boxPlotMedian"
  ]) {
    assert.equal(
      edited.semanticSpec.layers.find(layer => layer.id === id).data,
      summaryId
    );
  }
  assert.equal(
    edited.semanticSpec.layers.find(layer => layer.id === "boxPlotOutliers").data,
    outlierId
  );
  for (const id of ["boxPlot", "boxPlotWhisker", "boxPlotMedian", "boxPlotOutliers"]) {
    assert.deepEqual(edited.graphicSpec.objects[id], direct.graphicSpec.objects[id]);
  }
  assert.equal(before.markConfigs.boxPlot.boxPlot.whisker.factor, 1.5);
});

test("retains derived data for appearance and width-only edits", () => {
  const before = base();
  const edited = before.editBoxPlot({
    width: { band: 0.5 },
    box: { opacity: 0.6 },
    median: { strokeWidth: 2 },
    outlier: { radius: 5 }
  });

  assert.deepEqual(
    edited.semanticSpec.datasets.map(dataset => dataset.id),
    before.semanticSpec.datasets.map(dataset => dataset.id)
  );
  assert.ok(edited.graphicSpec.objects.boxPlot.items.every(
    item => item.properties.opacity === 0.6
  ));
  assert.deepEqual(
    edited.graphicSpec.objects.boxPlotMedian.items.map(item => item.properties.strokeWidth),
    [2, 2, 2]
  );
  assert.notDeepEqual(
    edited.graphicSpec.objects.boxPlot.items.map(item => item.properties.width),
    before.graphicSpec.objects.boxPlot.items.map(item => item.properties.width)
  );
});

test("reconciles outlier topology and validates the whole patch first", () => {
  const before = base();
  const hidden = before.editBoxPlot({ outliers: false });
  assert.equal(hidden.graphicSpec.objects.boxPlotOutliers, undefined);
  assert.equal(
    hidden.semanticSpec.layers.some(layer => layer.id === "boxPlotOutliers"),
    false
  );
  const restored = hidden.editBoxPlot({ outliers: true });
  assert.ok(restored.graphicSpec.objects.boxPlotOutliers);

  assert.throws(
    () => before.editBoxPlot({ whisker: { type: "minmax", factor: 1 } }),
    /do not accept factor/
  );
  assert.throws(
    () => before.editBoxPlot({ box: { opacity: 2 } }),
    /opacity/
  );
  assert.throws(
    () => before.editBoxPlot({ target: "missing", width: { band: 0.5 } }),
    /Unknown box-plot owner/
  );
  assert.equal(before.semanticSpec.datasets.at(-1).id, "boxPlotOutlierData");
});
