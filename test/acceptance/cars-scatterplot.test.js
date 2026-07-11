import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  createMockCanvasContext,
  findCanvasCalls
} from "../helpers/mockCanvasContext.js";
import {
  createCarsScatterplot,
  renderCarsScatterplot
} from "../programs/carsScatterplot.js";

const cars = JSON.parse(
  readFileSync(new URL("../../data/cars.json", import.meta.url), "utf8")
);

test.skip("renders the cars scatterplot from a user program", () => {
  const program = createCarsScatterplot(cars);

  const dataset = program.semanticSpec.datasets.find(item => item.id === "cars");
  const layer = program.semanticSpec.layers.find(item => item.id === "points");
  const canvas = program.graphicSpec.objects.canvas;
  const points = program.graphicSpec.objects.points;

  assert.equal(dataset.values.length, 392);
  assert.equal(layer.mark.type, "point");
  assert.equal(layer.data, "cars");
  assert.deepEqual(canvas.properties, {
    width: 640,
    height: 400,
    background: "white"
  });
  assert.equal(points.type, "circle");
  assert.equal(points.children.length, 392);
  assert.deepEqual(program.graphicSpec.order, ["canvas", "points"]);

  for (const child of points.children) {
    assert.equal(Number.isFinite(child.properties.x), true);
    assert.equal(Number.isFinite(child.properties.y), true);
    assert.equal(typeof child.properties.fill, "string");
    assert.equal(child.properties.radius, 3);
  }

  assert.deepEqual(
    program.trace.children.map(node => node.op),
    [
      "editSemantic",
      "editSemantic",
      "editSemantic",
      "createGraphics",
      "editGraphics",
      "editGraphics",
      "editGraphics",
      "createGraphics",
      "editGraphics",
      "editGraphics",
      "editGraphics",
      "editGraphics"
    ]
  );
  assert.equal(program.trace.children[0].args.property, "dataset[cars].values");
  assert.equal(program.trace.children[0].args.valueCount, 392);
  assert.equal("value" in program.trace.children[0].args, false);
  assert.equal(program.trace.children[8].args.valueCount, 392);
  assert.equal("value" in program.trace.children[8].args, false);
  assert.deepEqual(program.actionStack, []);

  const graphicSnapshot = structuredClone(program.graphicSpec);
  const context = createMockCanvasContext();
  renderCarsScatterplot(program, context);

  assert.deepEqual(program.graphicSpec, graphicSnapshot);
  assert.equal(context.canvas.width, 640);
  assert.equal(context.canvas.height, 400);
  assert.equal(findCanvasCalls(context, "arc").length, 392);
  assert.deepEqual(
    new Set(findCanvasCalls(context, "fill").map(call => call.fillStyle)),
    new Set(["#4c78a8", "#f58518", "#54a24b"])
  );
});
