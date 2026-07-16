import assert from "node:assert/strict";
import test from "node:test";

import { PUBLIC_CHARTS } from "../../examples/registry.js";
import {
  findGraphicParent,
  walkGraphicDrawOrder
} from "../../src/grammar/schemas/graphicTree.js";
import { loadCars, loadGapminder, loadJobs } from "../support/data.js";

const LOADERS = Object.freeze({
  cars: loadCars,
  gapminder: loadGapminder,
  jobs: loadJobs
});

const CURRENT_FLAT_ROOTS = Object.freeze({
  "cars-scatterplot": [
    "canvas", "horizontalGridLines", "points",
    "xAxisLine", "xAxisTicks", "xAxisLabels", "xAxisTitle",
    "yAxisLine", "yAxisTicks", "yAxisLabels", "yAxisTitle"
  ],
  "cars-line-chart": [
    "canvas", "horizontalGridLines", "trends",
    "xAxisLine", "xAxisTicks", "xAxisLabels", "xAxisTitle",
    "yAxisLine", "yAxisTicks", "yAxisLabels", "yAxisTitle",
    "seriesLegendSymbols", "seriesLegendLabels", "seriesLegendTitle",
    "chartTitle", "chartSubtitle"
  ],
  "cars-histogram": [
    "canvas", "horizontalGridLines", "bars",
    "xAxisLine", "xAxisTicks", "xAxisLabels", "xAxisTitle",
    "yAxisLine", "yAxisTicks", "yAxisLabels", "yAxisTitle",
    "colorLegendSymbols", "colorLegendLabels", "colorLegendTitle",
    "chartTitle", "chartSubtitle"
  ],
  "jobs-grouped-bar": [
    "canvas", "horizontalGridLines", "bars",
    "xAxisLine", "xAxisTicks", "xAxisLabels", "xAxisTitle",
    "yAxisLine", "yAxisTicks", "yAxisLabels", "yAxisTitle",
    "colorLegendSymbols", "colorLegendLabels", "colorLegendTitle"
  ],
  "cars-regression-scatterplot": [
    "canvas", "horizontalGridLines", "points", "pointsRegressionBands",
    "pointsRegressionLines", "xAxisLine", "xAxisTicks", "xAxisLabels",
    "xAxisTitle", "yAxisLine", "yAxisTicks", "yAxisLabels", "yAxisTitle",
    "seriesLegendSymbolLines", "seriesLegendSymbolPoints",
    "seriesLegendLabels", "seriesLegendTitle", "sizeLegendSymbols",
    "sizeLegendLabels", "sizeLegendTitle"
  ],
  "cars-density-area": [
    "canvas", "horizontalGridLines", "verticalGridLines", "densities",
    "xAxisLine", "xAxisTicks", "xAxisLabels", "xAxisTitle",
    "yAxisLine", "yAxisTicks", "yAxisLabels", "yAxisTitle",
    "colorLegendSymbols", "colorLegendLabels", "colorLegendTitle",
    "chartTitle", "chartSubtitle"
  ],
  "cars-error-bar": [
    "canvas", "horizontalGridLines", "point", "errorBar",
    "errorBarLowerCap", "errorBarUpperCap",
    "xAxisLine", "xAxisTicks", "xAxisLabels", "xAxisTitle",
    "yAxisLine", "yAxisTicks", "yAxisLabels", "yAxisTitle",
    "chartTitle", "chartSubtitle"
  ],
  "cars-box-plot": [
    "canvas", "horizontalGridLines", "boxPlotWhisker",
    "boxPlotWhiskerLowerCap", "boxPlotWhiskerUpperCap", "boxPlot",
    "boxPlotMedian", "boxPlotOutliers",
    "xAxisLine", "xAxisTicks", "xAxisLabels", "xAxisTitle",
    "yAxisLine", "yAxisTicks", "yAxisLabels", "yAxisTitle",
    "chartTitle", "chartSubtitle"
  ],
  "gapminder-error-band": [
    "canvas", "horizontalGridLines", "errorBand", "errorBandLowerBoundary",
    "errorBandUpperBoundary", "xAxisLine", "xAxisTicks", "xAxisLabels",
    "xAxisTitle", "yAxisLine", "yAxisTicks", "yAxisLabels", "yAxisTitle",
    "colorLegendSymbols", "colorLegendLabels", "colorLegendTitle",
    "chartTitle", "chartSubtitle"
  ],
  "gapminder-continuous-color-bars": [
    "canvas", "horizontalGridLines", "bar", "colorGradientStrips",
    "xAxisLine", "xAxisTicks", "xAxisLabels", "xAxisTitle",
    "yAxisLine", "yAxisTicks", "yAxisLabels", "yAxisTitle",
    "colorGradientTicks", "colorGradientLabels", "colorGradientTitle",
    "chartTitle", "chartSubtitle"
  ],
  "gapminder-discretized-color-scales": [
    "canvas", "horizontalGridLines", "verticalGridLines", "point",
    "xAxisLine", "xAxisTicks", "xAxisLabels", "xAxisTitle",
    "yAxisLine", "yAxisTicks", "yAxisLabels", "yAxisTitle",
    "colorLegendSymbols", "colorLegendLabels", "colorLegendTitle",
    "chartTitle", "chartSubtitle"
  ],
  "gapminder-temporal-discrete-scales": [
    "canvas", "horizontalGridLines", "bar", "point",
    "xAxisLine", "xAxisTicks", "xAxisLabels", "xAxisTitle",
    "yAxisLine", "yAxisTicks", "yAxisLabels", "yAxisTitle",
    "chartTitle", "chartSubtitle"
  ],
  "gapminder-transformed-scales": [
    "canvas", "horizontalGridLines", "verticalGridLines", "point",
    "colorGradientStrips", "xAxisLine", "xAxisTicks", "xAxisLabels",
    "xAxisTitle", "yAxisLine", "yAxisTicks", "yAxisLabels", "yAxisTitle",
    "colorGradientTicks", "colorGradientLabels", "colorGradientTitle",
    "chartTitle", "chartSubtitle"
  ],
  "mark-selection-points": [
    "canvas", "horizontalGridLines", "points",
    "xAxisLine", "xAxisTicks", "xAxisLabels", "xAxisTitle",
    "yAxisLine", "yAxisTicks", "yAxisLabels", "yAxisTitle",
    "colorLegendSymbols", "colorLegendLabels", "colorLegendTitle",
    "chartTitle", "chartSubtitle"
  ],
  "mark-selection-bars": [
    "canvas", "horizontalGridLines", "bars",
    "xAxisLine", "xAxisTicks", "xAxisLabels", "xAxisTitle",
    "yAxisLine", "yAxisTicks", "yAxisLabels", "yAxisTitle",
    "colorLegendSymbols", "colorLegendLabels", "colorLegendTitle",
    "chartTitle", "chartSubtitle"
  ],
  "mark-selection-lines": [
    "canvas", "horizontalGridLines", "trends",
    "xAxisLine", "xAxisTicks", "xAxisLabels", "xAxisTitle",
    "yAxisLine", "yAxisTicks", "yAxisLabels", "yAxisTitle",
    "seriesLegendSymbols", "seriesLegendLabels", "seriesLegendTitle",
    "chartTitle", "chartSubtitle"
  ]
});

test("locks the complete pre-migration public graphic-root inventory", () => {
  assert.deepEqual(
    Object.keys(CURRENT_FLAT_ROOTS).sort(),
    PUBLIC_CHARTS.map(chart => chart.id).sort()
  );

  for (const chart of PUBLIC_CHARTS) {
    const program = chart.createProgram(LOADERS[chart.data]());
    const drawOrder = [];
    walkGraphicDrawOrder(program.graphicSpec, ({ id }) => drawOrder.push(id));

    assert.deepEqual(program.graphicSpec.order, CURRENT_FLAT_ROOTS[chart.id]);
    assert.deepEqual(drawOrder, CURRENT_FLAT_ROOTS[chart.id]);
    assert.equal(program.graphicSpec.objects.canvas.type, "canvas");
    for (const id of program.graphicSpec.order) {
      assert.equal(findGraphicParent(program.graphicSpec, id), undefined);
    }
  }
});
