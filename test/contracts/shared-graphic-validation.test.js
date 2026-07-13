import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../src/core/ChartProgram.js";
import { render } from "../../src/renderers/canvas/index.js";
import { createMockCanvasContext } from "../support/canvas.js";

function invalidCircleProgram(properties) {
  return {
    graphicSpec: {
      objects: {
        canvas: {
          type: "canvas",
          properties: { width: 100, height: 80, background: "white" }
        },
        point: { type: "circle", properties }
      },
      order: ["canvas", "point"]
    }
  };
}

test("graphical editing and rendering share concrete value validation", () => {
  const point = chart().createGraphics({ id: "point", type: "circle" });

  assert.throws(
    () => point.editGraphics({
      target: "point",
      property: "fill",
      value: 3
    }),
    /circle\.fill must be a non-empty string/
  );

  assert.throws(
    () => render(
      invalidCircleProgram({ x: 10, y: 20, radius: 3, fill: 3 }),
      createMockCanvasContext()
    ),
    /circle\.fill must be a non-empty string/
  );
});

test("renderers may add completeness checks without changing value rules", () => {
  assert.throws(
    () => render(
      invalidCircleProgram({ x: 10, y: 20, fill: "red" }),
      createMockCanvasContext()
    ),
    /requires a finite radius/
  );
});
