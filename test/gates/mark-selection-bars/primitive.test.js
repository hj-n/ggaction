import assert from "node:assert/strict";
import test from "node:test";

import { render } from "../../../src/index.js";
import { createCarsHistogram } from "../../../examples/cars-histogram/program.js";
import { createMockCanvasContext } from "../../support/canvas.js";
import { loadCars } from "../../support/data.js";
import { createLongestHistogramBarGatePrimitive } from "./primitive.program.js";
import {
  BAR_HIGHLIGHT_LAYOUT,
  BAR_HIGHLIGHT_TARGET,
  selectLongestHistogramBar
} from "./reference-values.js";

function assertPrimitiveTarget(program, base, target) {
  const baseChildren = base.graphicSpec.objects.bars.children;
  const children = program.graphicSpec.objects.bars.children;
  const selected = children.at(-1);

  assert.deepEqual(program.semanticSpec, base.semanticSpec);
  assert.deepEqual(
    children.slice(0, -1).map(child => child.properties),
    baseChildren
      .filter((_, index) => index !== target.index)
      .map(child => child.properties)
  );
  assert.deepEqual(
    {
      x: selected.properties.x,
      y: selected.properties.y,
      width: selected.properties.width,
      height: selected.properties.height
    },
    target.concrete
  );
  assert.equal(selected.properties.fill, BAR_HIGHLIGHT_TARGET.fill);
  assert.equal(selected.properties.stroke, BAR_HIGHLIGHT_TARGET.stroke);
  assert.equal(selected.properties.strokeWidth, BAR_HIGHLIGHT_TARGET.strokeWidth);
  assert.equal(selected.properties.opacity, BAR_HIGHLIGHT_TARGET.opacity);
}

test("authors Gate B with one selected-last raw rect edit", () => {
  const cars = loadCars();
  const base = createCarsHistogram(cars);
  const program = createLongestHistogramBarGatePrimitive(cars);
  const { target } = selectLongestHistogramBar(cars);

  assertPrimitiveTarget(program, base, target);
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(program.graphicSpec.objects).filter(([id]) => id !== "bars")
    ),
    Object.fromEntries(
      Object.entries(base.graphicSpec.objects).filter(([id]) => id !== "bars")
    )
  );
  assert.equal(
    program.trace.children.some(node =>
      ["selectMarks", "highlightMarks", "editBarMark"].includes(node.op)
    ),
    false
  );
  assert.equal(program.trace.children.at(-1).op, "editGraphics");

  const context = createMockCanvasContext();
  assert.doesNotThrow(() => render(program, context));
  assert.equal(
    context.calls.some(call =>
      call.op === "fillRect" && call.fillStyle === BAR_HIGHLIGHT_TARGET.fill
    ),
    true
  );
});

test("reauthors the same semantic target after a Canvas-only resize", () => {
  const cars = loadCars();
  const height = BAR_HIGHLIGHT_LAYOUT.height + 120;
  const base = createCarsHistogram(cars).editCanvas({ height });
  const program = createLongestHistogramBarGatePrimitive(cars, { height });
  const { target } = selectLongestHistogramBar(cars, { height });

  assertPrimitiveTarget(program, base, target);
  assert.equal(target.key, "bars/histogram/2");
  assert.equal(target.count, 47);
});
