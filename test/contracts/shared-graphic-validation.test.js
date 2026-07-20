import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../src/ChartProgram.js";
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

test("authoring and rendering share the structured rect fill contract", () => {
  const invalid = {
    type: "linear-gradient",
    from: { x: 0, y: 0 },
    to: { x: 1, y: 0 },
    stops: [
      { offset: 0.8, color: "red" },
      { offset: 0.2, color: "blue" }
    ]
  };
  const rect = chart().createGraphics({ id: "rect", type: "rect" });

  assert.throws(
    () => rect.editGraphics({ target: "rect", property: "fill", value: invalid }),
    /offsets must be nondecreasing/
  );
  assert.throws(
    () => render({
      graphicSpec: {
        objects: {
          canvas: {
            type: "canvas",
            properties: { width: 100, height: 80, background: "white" }
          },
          rect: {
            type: "rect",
            properties: {
              x: 10, y: 10, width: 20, height: 30,
              fill: invalid, stroke: "black", strokeWidth: 0
            }
          }
        },
        order: ["canvas", "rect"]
      }
    }, createMockCanvasContext()),
    /offsets must be nondecreasing/
  );
});
