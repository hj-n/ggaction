import assert from "node:assert/strict";
import test from "node:test";

import {
  createMockCanvasContext,
  findCanvasCalls
} from "../../support/canvas.js";
import {
  createCarsLineChartPrimitives,
  renderCarsLineChartPrimitives
} from "./primitive.program.js";
import { createCarsLineChartValues } from "./reference-values.js";
import { loadCars } from "../../support/data.js";

const cars = loadCars();

test("locks the canonical row, series, aggregate, and guide policy", () => {
  const values = createCarsLineChartValues(cars, {
    width: 720,
    height: 460,
    margin: { top: 80, right: 170, bottom: 60, left: 80 }
  });
  const aggregateGrain = values.aggregates.map(
    value => `${value.origin}:${value.year}`
  );

  assert.equal(values.validCars.length, 406);
  assert.deepEqual(values.origins, ["USA", "Europe", "Japan"]);
  assert.equal(values.aggregates.length, 36);
  assert.equal(new Set(aggregateGrain).size, aggregateGrain.length);
  assert.deepEqual(values.series.map(series => series.points.length), [12, 12, 12]);
});

test("authors and renders the complete primitive cars line chart", () => {
  const program = createCarsLineChartPrimitives(cars);
  const context = createMockCanvasContext();

  renderCarsLineChartPrimitives(program, context);

  assert.equal(program.semanticSpec.datasets[0].values.length, 406);
  assert.deepEqual(program.semanticSpec.layers, [
    {
      id: "trends",
      mark: { type: "line" },
      data: "cars",
      coordinate: "main",
      encoding: {
        x: { field: "Year", fieldType: "temporal", scale: "x" },
        y: {
          field: "Acceleration",
          fieldType: "quantitative",
          aggregate: "mean",
          scale: "y"
        },
        color: { field: "Origin", fieldType: "nominal", scale: "color" },
        strokeDash: {
          field: "Origin",
          fieldType: "nominal",
          scale: "strokeDash"
        }
      }
    }
  ]);
  assert.deepEqual(program.semanticSpec.scales, [
    { id: "x", type: "time", domain: "auto", range: "auto", nice: true },
    {
      id: "y",
      type: "linear",
      domain: "auto",
      range: "auto",
      nice: true,
      zero: false
    },
    {
      id: "color",
      type: "ordinal",
      domain: "auto",
      range: { palette: "tableau10" }
    },
    {
      id: "strokeDash",
      type: "ordinal",
      domain: "auto",
      range: "auto"
    }
  ]);
  assert.deepEqual(program.semanticSpec.coordinates, [
    { id: "main", type: "cartesian" }
  ]);
  assert.deepEqual(program.semanticSpec.guides, {
    axis: {
      x: { scale: "x", coordinate: "main", title: "Year" },
      y: {
        scale: "y",
        coordinate: "main",
        title: "mean(Acceleration)"
      }
    },
    legend: {
      series: {
        channels: ["color", "strokeDash"],
        scales: ["color", "strokeDash"],
        title: "Origin"
      }
    },
    grid: {
      horizontal: { scale: "y", coordinate: "main" }
    }
  });
  assert.deepEqual(program.semanticSpec.title, {
    text: "The trend of acceleration by year",
    subtitle: "from 1970 to 1982"
  });

  const trends = program.graphicSpec.objects.trends;
  assert.equal(trends.type, "path");
  assert.equal(trends.items.length, 3);
  assert.deepEqual(trends.items.map(child => child.properties.commands.length), [
    12, 12, 12
  ]);
  assert.deepEqual(trends.items.map(child => child.properties.strokeDash), [
    [], [8, 4], [3, 3]
  ]);
  assert.deepEqual(
    program.graphicSpec.objects.seriesLegendLabels.items.map(
      child => child.properties.text
    ),
    ["USA", "Europe", "Japan"]
  );
  assert.deepEqual(
    program.graphicSpec.objects.seriesLegendSymbols.items.map(
      child => child.properties.strokeDash
    ),
    [[], [8, 4], [3, 3]]
  );
  assert.equal(program.graphicSpec.objects.chartTitle.properties.text,
    "The trend of acceleration by year");
  assert.equal(program.graphicSpec.objects.chartSubtitle.properties.text,
    "from 1970 to 1982");
  assert.deepEqual(program.graphicSpec.order, [
    "canvas",
    "horizontalGridLines",
    "trends",
    "xAxisLine",
    "xAxisTicks",
    "xAxisLabels",
    "xAxisTitle",
    "yAxisLine",
    "yAxisTicks",
    "yAxisLabels",
    "yAxisTitle",
    "seriesLegendSymbols",
    "seriesLegendLabels",
    "seriesLegendTitle",
    "chartTitle",
    "chartSubtitle"
  ]);

  assert.equal(findCanvasCalls(context, "stroke").length, 27);
  assert.equal(findCanvasCalls(context, "fillText").length, 21);
  assert.equal(findCanvasCalls(context, "moveTo").length, 27);
  assert.equal(findCanvasCalls(context, "lineTo").length, 57);
  assert.deepEqual(
    findCanvasCalls(context, "setLineDash").slice(6, 9).map(call => call.value),
    [[], [8, 4], [3, 3]]
  );

  const topLevelOps = new Set(program.trace.children.map(node => node.op));
  assert.deepEqual([...topLevelOps], [
    "createCanvas",
    "createData",
    "editSemantic",
    "createGraphics",
    "editGraphics"
  ]);
  assert.equal(program.trace.children.some(node =>
    ["createLineMark", "createGuides", "createLegend", "createTitle"].includes(node.op)
  ), false);
  assert.deepEqual(program.actionStack, []);
  assert.equal(Object.isFrozen(program.semanticSpec.title), true);
  assert.equal(Object.isFrozen(trends.items[0].properties.commands), true);
});

test("owns primitive chart input and renders from graphicSpec alone", () => {
  const input = structuredClone(cars);
  const program = createCarsLineChartPrimitives(input);
  const storedAcceleration = program.semanticSpec.datasets[0].values[0].Acceleration;

  input[0].Acceleration = -999;

  assert.equal(
    program.semanticSpec.datasets[0].values[0].Acceleration,
    storedAcceleration
  );
  const context = createMockCanvasContext();
  renderCarsLineChartPrimitives({ graphicSpec: program.graphicSpec }, context);
  assert.equal(findCanvasCalls(context, "stroke").length, 27);
  assert.equal(findCanvasCalls(context, "fillText").length, 21);
});
