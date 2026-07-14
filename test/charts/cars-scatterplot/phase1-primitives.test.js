import assert from "node:assert/strict";
import test from "node:test";

import { loadCars } from "../../support/data.js";
import {
  createCategoricalPalettePrimitives,
  createPointShapeDiamondPrimitives,
  createScaleReversePrimitives,
  createShapeVocabularyPrimitives
} from "./phase1-primitives.program.js";
import {
  POINT_SHAPES,
  SET2_COLORS,
  createDiamondPrimitiveValues,
  createScaleReversePrimitiveValues,
  createShapeVocabularyPrimitiveValues
} from "./phase1-reference-values.js";

const cars = loadCars();

function polygonArea(points) {
  return Math.abs(points.reduce((sum, point, index) => {
    const next = points[(index + 1) % points.length];
    return sum + point.x * next.y - next.x * point.y;
  }, 0)) / 2;
}

function graphicArea(graphic) {
  if (graphic.type === "circle") {
    return Math.PI * graphic.properties.radius ** 2;
  }
  if (graphic.type === "rect") {
    return graphic.properties.width * graphic.properties.height;
  }
  return polygonArea(graphic.properties.points);
}

test("derives reversed positions without changing the baseline domain", () => {
  const values = createScaleReversePrimitiveValues(cars);
  const program = createScaleReversePrimitives(cars);
  const points = program.graphicSpec.objects.points.children;
  const labels = program.graphicSpec.objects.xAxisLabels.children;

  assert.equal(values.x.every((value, index) =>
    value + values.baseline.x[index] ===
      values.baseline.bounds.left + values.baseline.bounds.right
  ), true);
  assert.deepEqual(
    points.map(point => point.properties.x),
    values.x
  );
  assert.deepEqual(
    labels.map(label => label.properties.x),
    values.xTicks
  );
  assert.deepEqual(program.semanticSpec.scales.find(scale => scale.id === "x"), {
    id: "x",
    type: "linear",
    domain: "auto",
    range: [610, 70]
  });
});

test("materializes the constant diamond as equal-area concrete paths", () => {
  const values = createDiamondPrimitiveValues(cars);
  const program = createPointShapeDiamondPrimitives(cars);
  const points = program.graphicSpec.objects.points.children;

  assert.equal(program.graphicSpec.objects.points.type, "collection");
  assert.equal(points.length, 392);
  assert.equal(points.every(point => point.type === "path"), true);
  assert.equal(points.every(point => point.properties.closed === true), true);
  assert.equal(
    points.every(point =>
      Math.abs(graphicArea(point) - Math.PI * 3 ** 2) < 1e-9
    ),
    true
  );
  assert.deepEqual(points[0].properties, values.children[0].properties);
});

test("builds one normalized symbol for every planned point shape", () => {
  const values = createShapeVocabularyPrimitiveValues(cars);
  const program = createShapeVocabularyPrimitives(cars);
  const points = program.graphicSpec.objects.points.children;
  const symbols = program.graphicSpec.objects.shapeLegendSymbols.children;
  const labels = program.graphicSpec.objects.shapeLegendLabels.children;

  assert.deepEqual(values.shapes, POINT_SHAPES);
  assert.equal(values.rows.length, 12);
  assert.equal(new Set(values.rows.map(row => row.ShapeCategory)).size, 12);
  assert.deepEqual(
    points.map(point => point.type),
    ["circle", "rect", ...Array(10).fill("path")]
  );
  assert.equal(
    points.every(point => Math.abs(graphicArea(point) - Math.PI * 7 ** 2) < 1e-9),
    true
  );
  assert.equal(
    symbols.every(symbol => Math.abs(graphicArea(symbol) - Math.PI * 5 ** 2) < 1e-9),
    true
  );
  assert.deepEqual(labels.map(label => label.properties.text), POINT_SHAPES);
  assert.equal(program.graphicSpec.objects.canvas.properties.width, 860);
});

test("applies set2 colors consistently to points and a color-only legend", () => {
  const program = createCategoricalPalettePrimitives(cars);
  const scale = program.semanticSpec.scales.find(candidate =>
    candidate.id === "color"
  );
  const pointColors = new Set(
    program.graphicSpec.objects.points.children.map(point =>
      point.properties.fill
    )
  );
  const symbolColors = program.graphicSpec.objects.colorLegendSymbols.children
    .map(symbol => symbol.properties.fill);
  const labels = program.graphicSpec.objects.colorLegendLabels.children
    .map(label => label.properties.text);

  assert.deepEqual(scale.domain, ["USA", "Japan", "Europe"]);
  assert.deepEqual(scale.range, SET2_COLORS.slice(0, 3));
  assert.deepEqual(pointColors, new Set(SET2_COLORS.slice(0, 3)));
  assert.deepEqual(symbolColors, SET2_COLORS.slice(0, 3));
  assert.deepEqual(labels, ["USA", "Japan", "Europe"]);
  assert.equal(program.graphicSpec.objects.canvas.properties.width, 760);
});
