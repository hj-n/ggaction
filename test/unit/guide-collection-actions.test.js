import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../src/core/ChartProgram.js";

const rows = [
  { year: "2020-01-01", value: 2, origin: "A" },
  { year: "2021-01-01", value: 10, origin: "A" },
  { year: "2020-01-01", value: 6, origin: "B" },
  { year: "2021-01-01", value: 14, origin: "B" }
];

function createSeriesLine() {
  return chart()
    .createCanvas({
      width: 500,
      height: 280,
      margin: { top: 30, right: 140, bottom: 60, left: 60 }
    })
    .createData({ id: "data", values: rows })
    .createLineMark({ id: "trends" })
    .encodeX({ field: "year", fieldType: "temporal" })
    .encodeY({ field: "value", aggregate: "mean" })
    .encodeColor({ field: "origin" })
    .encodeStrokeDash({ field: "origin" });
}

test("automatically creates axes and a line-series legend", () => {
  const program = createSeriesLine().createGuides();
  const node = program.trace.children.at(-1);

  assert.deepEqual(node.children.map(child => child.op), [
    "createAxes",
    "createLegend"
  ]);
  assert.deepEqual(program.semanticSpec.guides.legend.series.channels, [
    "color",
    "strokeDash"
  ]);
  assert.equal(program.semanticSpec.guides.axis.x.scale, "x");
  assert.equal(program.semanticSpec.guides.axis.y.scale, "y");
  assert.equal(program.graphicSpec.objects.seriesLegendTitle.type, "text");
});

test("forwards explicit child options", () => {
  const program = createSeriesLine().createGuides({
    axes: {
      x: false,
      y: { ticksAndLabels: { count: 3 } }
    },
    legend: {
      title: "Series",
      border: true
    }
  });

  assert.equal(program.semanticSpec.guides.axis.x, undefined);
  assert.equal(program.semanticSpec.guides.axis.y.scale, "y");
  assert.equal(program.semanticSpec.guides.legend.series.title, "Series");
  assert.equal(program.graphicSpec.objects.seriesLegendBackground.type, "rect");
  assert.equal(program.guideConfigs.axis.y.ticks.count, 3);
});

test("supports explicit axes and legend opt-out", () => {
  const axesOnly = createSeriesLine().createGuides({ legend: false });
  const legendOnly = createSeriesLine().createGuides({ axes: false });

  assert.equal(axesOnly.semanticSpec.guides.axis.x.scale, "x");
  assert.equal(axesOnly.semanticSpec.guides.legend, undefined);
  assert.equal(legendOnly.semanticSpec.guides.axis, undefined);
  assert.deepEqual(legendOnly.semanticSpec.guides.legend.series.scales, [
    "color",
    "strokeDash"
  ]);
});

test("does not infer the unsupported point legend", () => {
  const program = chart()
    .createCanvas({ width: 400, height: 260 })
    .createData({
      id: "pointsData",
      values: [
        { x: 1, y: 2, group: "A" },
        { x: 2, y: 3, group: "B" }
      ]
    })
    .createPointMark({ id: "points" })
    .encodeX({ field: "x" })
    .encodeY({ field: "y" })
    .encodeColor({ field: "group" })
    .createGuides();

  assert.equal(program.semanticSpec.guides.axis.x.scale, "x");
  assert.equal(program.semanticSpec.guides.axis.y.scale, "y");
  assert.equal(program.semanticSpec.guides.legend, undefined);
  assert.deepEqual(program.trace.children.at(-1).children.map(child => child.op), [
    "createAxes"
  ]);
});

test("validates options and requires a selected guide", () => {
  assert.throws(() => chart().createGuides(), /at least one selected guide/);
  assert.throws(
    () => createSeriesLine().createGuides({ axes: false, legend: false }),
    /at least one selected guide/
  );
  assert.throws(
    () => createSeriesLine().createGuides({ axes: "auto" }),
    /false or a plain object/
  );
  assert.throws(
    () => createSeriesLine().createGuides({ legend: null }),
    /false or a plain object/
  );
  assert.throws(
    () => createSeriesLine().createGuides({ title: {} }),
    /Unknown createGuides option/
  );
});
