import assert from "node:assert/strict";
import test from "node:test";

import { render } from "../../../src/index.js";
import { createCarsLineChart } from "../../../examples/cars-line-chart/program.js";
import { createMockCanvasContext } from "../../support/canvas.js";
import { loadCars } from "../../support/data.js";
import { createJapanLineHighlightGatePrimitive } from "./primitive.program.js";
import {
  LINE_HIGHLIGHT_LAYOUT,
  LINE_HIGHLIGHT_TARGET,
  selectJapanLineSeries
} from "./reference-values.js";

function flattenActions(node) {
  return [node, ...(node.children ?? []).flatMap(flattenActions)];
}

test("authors Gate C as one selected-last complete path", () => {
  const cars = loadCars();
  const base = createCarsLineChart(cars);
  const program = createJapanLineHighlightGatePrimitive(cars);
  const { target } = selectJapanLineSeries(cars);
  const baseChildren = base.graphicSpec.objects.trends.children;
  const children = program.graphicSpec.objects.trends.children;
  const selected = children.at(-1);

  assert.equal(program.graphicSpec.objects.trends.type, "path");
  assert.equal(children.length, baseChildren.length);
  assert.deepEqual(program.semanticSpec, base.semanticSpec);
  assert.deepEqual(
    children.slice(0, -1).map(child => child.properties.commands),
    baseChildren
      .filter((_, index) => index !== target.index)
      .map(child => child.properties.commands)
  );
  assert.equal(children.slice(0, -1).every(child =>
    child.properties.opacity === LINE_HIGHLIGHT_TARGET.dimOpacity
  ), true);
  assert.deepEqual(selected.properties.commands, baseChildren[target.index].properties.commands);
  assert.equal(selected.properties.commands[0].op, "M");
  assert.equal(selected.properties.commands.length, target.pointCount);
  assert.equal(selected.properties.stroke, LINE_HIGHLIGHT_TARGET.stroke);
  assert.equal(selected.properties.strokeWidth, LINE_HIGHLIGHT_TARGET.strokeWidth);
  assert.deepEqual(selected.properties.strokeDash, LINE_HIGHLIGHT_TARGET.strokeDash);
  assert.equal(selected.properties.opacity, LINE_HIGHLIGHT_TARGET.opacity);
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(program.graphicSpec.objects).filter(([id]) => id !== "trends")
    ),
    Object.fromEntries(
      Object.entries(base.graphicSpec.objects).filter(([id]) => id !== "trends")
    )
  );

  const operations = flattenActions(program.trace).map(node => node.op);
  assert.equal(operations.includes("selectMarks"), false);
  assert.equal(operations.includes("highlightMarks"), false);
  assert.equal(operations.at(-1), "editGraphics");
});

test("renders the selected series with approved path appearance", () => {
  const program = createJapanLineHighlightGatePrimitive(loadCars());
  const context = createMockCanvasContext();
  assert.doesNotThrow(() => render(program, context));
  assert.equal(context.canvas.width, LINE_HIGHLIGHT_LAYOUT.width);
  assert.equal(context.canvas.height, LINE_HIGHLIGHT_LAYOUT.height);
  assert.equal(context.calls.some(call =>
    call.op === "setStrokeStyle" &&
    call.value === LINE_HIGHLIGHT_TARGET.stroke
  ), true);
  assert.equal(context.calls.some(call =>
    call.op === "setLineWidth" &&
    call.value === LINE_HIGHLIGHT_TARGET.strokeWidth
  ), true);
});

test("reauthors the same semantic series after Canvas-only resize", () => {
  const cars = loadCars();
  const width = LINE_HIGHLIGHT_LAYOUT.width + 120;
  const base = createCarsLineChart(cars).editCanvas({ width });
  const program = createJapanLineHighlightGatePrimitive(cars, { width });
  const target = selectJapanLineSeries(cars, { width }).target;

  assert.equal(program.graphicSpec.objects.trends.children.at(-1).properties.stroke,
    LINE_HIGHLIGHT_TARGET.stroke);
  assert.deepEqual(
    program.graphicSpec.objects.trends.children.at(-1).properties.commands,
    base.graphicSpec.objects.trends.children[target.index].properties.commands
  );
  assert.equal(target.key, "trends/series/2");
});
