import assert from "node:assert/strict";
import test from "node:test";

import { createCarsDensityArea } from
  "../../../examples/cars-density-area/program.js";
import { render } from "../../../src/index.js";
import { loadCars } from "../../support/data.js";
import { createMockCanvasContext } from "../../support/canvas.js";
import { createCarsDensityAreaPrimitives } from
  "./primitive.program.js";

const cars = loadCars();

test("builds the final public density area chart contract", () => {
  const program = createCarsDensityArea(cars);

  assert.deepEqual(program.trace.children.map(node => node.op), [
    "createCanvas",
    "createData",
    "createAreaMark",
    "encodeDensity",
    "encodeColor",
    "createGuides",
    "createTitle"
  ]);
  assert.deepEqual(
    program.trace.children[3].children.map(node => node.op),
    [
      "createDensityData",
      "editSemantic",
      "encodeX",
      "encodeY",
      "encodeGroup",
      "rematerializeAreaMark"
    ]
  );
  assert.deepEqual(
    program.trace.children[5].children.map(node => node.op),
    ["createAxes", "createGrid", "createLegend"]
  );
  assert.equal(program.semanticSpec.datasets[1].values.length, 300);
  assert.equal(program.graphicSpec.objects.densities.children.length, 3);
  assert.equal(program.graphicSpec.objects.densities.children[0].properties.commands.length, 103);
  assert.equal(program.semanticSpec.guides.axis.x.title, "Acceleration");
  assert.equal(program.semanticSpec.guides.axis.y.title, "Density");
});

test("matches primitive semantics, graphics, and Canvas calls exactly", () => {
  const publicProgram = createCarsDensityArea(cars);
  const primitiveProgram = createCarsDensityAreaPrimitives(cars);
  const publicContext = createMockCanvasContext();
  const primitiveContext = createMockCanvasContext();

  assert.deepEqual(publicProgram.semanticSpec, primitiveProgram.semanticSpec);
  assert.deepEqual(publicProgram.graphicSpec, primitiveProgram.graphicSpec);
  render(publicProgram, publicContext);
  render(primitiveProgram, primitiveContext);
  assert.deepEqual(publicContext.calls, primitiveContext.calls);
});

test("owns caller data and leaves earlier programs unchanged", () => {
  const input = loadCars();
  const before = structuredClone(input);
  const program = createCarsDensityArea(input);

  input[0].Acceleration = -999;
  assert.deepEqual(program.semanticSpec.datasets[0].values, before);
  assert.equal(Object.isFrozen(program.semanticSpec.datasets[1].values), true);
  assert.equal(Object.isFrozen(program.graphicSpec.objects.densities.children), true);
});
