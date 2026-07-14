import assert from "node:assert/strict";
import test from "node:test";

import { createCarsLineChart } from "../../../examples/cars-line-chart/program.js";
import { render } from "../../../src/index.js";
import { createMockCanvasContext } from "../../support/canvas.js";
import { loadCars } from "../../support/data.js";
import { createCarsLineChartPrimitives } from "./primitive.program.js";

const cars = loadCars();

test("builds the public cars line-chart example with chart actions", () => {
  const program = createCarsLineChart(cars);

  assert.equal(program.semanticSpec.layers[0].mark.type, "line");
  assert.equal(program.graphicSpec.objects.trends.children.length, 3);
  assert.deepEqual(program.semanticSpec.guides.legend.series.channels, [
    "color",
    "strokeDash"
  ]);
  assert.equal(
    program.graphicSpec.objects.chartTitle.properties.text,
    "The trend of acceleration by year"
  );
  assert.deepEqual(program.trace.children.map(node => node.op), [
    "createCanvas",
    "createData",
    "createLineMark",
    "encodeX",
    "encodeY",
    "encodeColor",
    "encodeStrokeDash",
    "createGuides",
    "createTitle"
  ]);
});

test("exactly matches the canonical primitive baseline", () => {
  const program = createCarsLineChart(cars);
  const primitive = createCarsLineChartPrimitives(cars);
  const context = createMockCanvasContext();
  const primitiveContext = createMockCanvasContext();

  render(program, context);
  render(primitive, primitiveContext);

  assert.deepEqual(program.semanticSpec, primitive.semanticSpec);
  assert.deepEqual(program.graphicSpec, primitive.graphicSpec);
  assert.deepEqual(program.graphicSpec.order, primitive.graphicSpec.order);
  assert.deepEqual(context.calls, primitiveContext.calls);
});
