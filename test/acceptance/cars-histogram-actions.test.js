import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { createMockCanvasContext } from "../helpers/mockCanvasContext.js";
import {
  createCarsHistogramActions,
  renderCarsHistogramActions
} from "../programs/carsHistogramActions.js";
import {
  createCarsHistogramEncodings,
  renderCarsHistogramEncodings
} from "../programs/carsHistogramEncodings.js";

const cars = JSON.parse(
  readFileSync(new URL("../../data/cars.json", import.meta.url), "utf8")
);

test("replaces explicit x/y calls with encodeHistogram", () => {
  const explicit = createCarsHistogramEncodings(cars);
  const program = createCarsHistogramActions(cars);

  assert.deepEqual(program.semanticSpec, explicit.semanticSpec);
  assert.deepEqual(program.resolvedScales, explicit.resolvedScales);
  assert.deepEqual(program.graphicSpec, explicit.graphicSpec);
  assert.deepEqual(
    program.trace.children.slice(0, 4).map(node => node.op),
    ["createCanvas", "createData", "createBarMark", "encodeHistogram"]
  );

  const histogram = program.trace.children.find(
    node => node.op === "encodeHistogram"
  );
  assert.deepEqual(histogram.args, {
    field: "Displacement",
    maxBins: 10,
    xScale: { nice: true, zero: false }
  });
  assert.deepEqual(histogram.children.map(node => node.op), [
    "encodeX",
    "encodeY"
  ]);
  assert.equal(
    program.trace.children.some(
      node => node.op === "encodeX" || node.op === "encodeY"
    ),
    false
  );
  assert.equal(Object.isFrozen(program.semanticSpec.layers[0].encoding), true);
  assert.equal(Object.isFrozen(program.graphicSpec.objects.bars.children), true);
  assert.deepEqual(program.actionStack, []);
});

test("renders the atomic histogram progression identically", () => {
  const explicit = createCarsHistogramEncodings(cars);
  const program = createCarsHistogramActions(cars);
  const explicitContext = createMockCanvasContext();
  const context = createMockCanvasContext();

  renderCarsHistogramEncodings(explicit, explicitContext);
  renderCarsHistogramActions(program, context);

  assert.deepEqual(context.calls, explicitContext.calls);
});
