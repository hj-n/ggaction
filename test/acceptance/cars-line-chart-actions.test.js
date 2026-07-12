import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  createMockCanvasContext,
  findCanvasCalls
} from "../helpers/mockCanvasContext.js";
import {
  createCarsLineChartActions,
  renderCarsLineChartActions
} from "../programs/carsLineChartActions.js";

const cars = JSON.parse(
  readFileSync(new URL("../../data/cars.json", import.meta.url), "utf8")
);

test("authors and renders the cars line chart with the line mark action", () => {
  const program = createCarsLineChartActions(cars);
  const context = createMockCanvasContext();

  renderCarsLineChartActions(program, context);

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
    }
  });
  assert.deepEqual(program.semanticSpec.title, {
    text: "The trend of acceleration by year",
    subtitle: "from 1970 to 1982"
  });
  assert.deepEqual(program.resolvedScales.x, {
    type: "time",
    domain: [Date.UTC(1970, 0, 1), Date.UTC(1982, 0, 1)],
    range: [80, 550]
  });
  assert.deepEqual(program.resolvedScales.y, {
    type: "linear",
    domain: [10, 20],
    range: [400, 80]
  });

  const trends = program.graphicSpec.objects.trends;
  assert.equal(trends.type, "path");
  assert.equal(trends.children.length, 3);
  assert.deepEqual(trends.children.map(child => child.properties.points.length), [
    12, 12, 12
  ]);
  assert.deepEqual(trends.children.map(child => child.properties.strokeDash), [
    [], [8, 4], [3, 3]
  ]);
  assert.deepEqual(
    program.graphicSpec.objects.seriesLegendLabels.children.map(
      child => child.properties.text
    ),
    ["USA", "Europe", "Japan"]
  );
  assert.deepEqual(
    program.graphicSpec.objects.seriesLegendSymbols.children.map(
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

  assert.equal(findCanvasCalls(context, "stroke").length, 21);
  assert.equal(findCanvasCalls(context, "fillText").length, 21);
  assert.equal(findCanvasCalls(context, "moveTo").length, 21);
  assert.equal(findCanvasCalls(context, "lineTo").length, 51);
  assert.deepEqual(
    findCanvasCalls(context, "setLineDash").slice(0, 3).map(call => call.value),
    [[], [8, 4], [3, 3]]
  );

  const topLevelOps = new Set(program.trace.children.map(node => node.op));
  assert.deepEqual([...topLevelOps], [
    "createCanvas",
    "createData",
    "createLineMark",
    "encodeX",
    "encodeY",
    "encodeColor",
    "encodeStrokeDash",
    "createAxes",
    "createLegend",
    "editSemantic",
    "createGraphics",
    "editGraphics"
  ]);
  assert.equal(program.trace.children.some(node =>
    ["createGuides", "createTitle"].includes(node.op)
  ), false);
  const createLineMark = program.trace.children.find(
    node => node.op === "createLineMark"
  );
  assert.deepEqual(createLineMark.children.map(node => node.op), [
    "editSemantic",
    "editSemantic",
    "createGraphics"
  ]);
  const encodeY = program.trace.children.find(node => node.op === "encodeY");
  assert.deepEqual(encodeY.children.map(node => node.op), [
    "createCoordinate",
    "editSemantic",
    "editSemantic",
    "editSemantic",
    "editSemantic",
    "createScale",
    "rematerializeLineMark"
  ]);
  assert.equal(
    program.trace.children.some(
      node => node.op === "editGraphics" && node.args.target === "trends"
    ),
    false
  );
  const axisGraphics = new Set([
    "xAxisLine",
    "xAxisTicks",
    "xAxisLabels",
    "xAxisTitle",
    "yAxisLine",
    "yAxisTicks",
    "yAxisLabels",
    "yAxisTitle"
  ]);
  assert.equal(
    program.trace.children.some(
      node => node.op === "createGraphics" && axisGraphics.has(node.args.id)
    ),
    false
  );
  const legendGraphics = new Set([
    "seriesLegendSymbols",
    "seriesLegendLabels",
    "seriesLegendTitle"
  ]);
  assert.equal(
    program.trace.children.some(
      node => node.op === "createGraphics" && legendGraphics.has(node.args.id)
    ),
    false
  );
  assert.deepEqual(program.actionStack, []);
  assert.equal(Object.isFrozen(program.semanticSpec.title), true);
  assert.equal(Object.isFrozen(trends.children[0].properties.points), true);
});

test("owns line-chart action input and renders from graphicSpec alone", () => {
  const input = structuredClone(cars);
  const program = createCarsLineChartActions(input);
  const storedAcceleration = program.semanticSpec.datasets[0].values[0].Acceleration;

  input[0].Acceleration = -999;

  assert.equal(
    program.semanticSpec.datasets[0].values[0].Acceleration,
    storedAcceleration
  );
  const context = createMockCanvasContext();
  renderCarsLineChartActions({ graphicSpec: program.graphicSpec }, context);
  assert.equal(findCanvasCalls(context, "stroke").length, 21);
  assert.equal(findCanvasCalls(context, "fillText").length, 21);
});
