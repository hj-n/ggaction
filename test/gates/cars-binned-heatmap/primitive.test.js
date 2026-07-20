import assert from "node:assert/strict";
import test from "node:test";

import { loadCars } from "../../support/data.js";
import {
  BINNED_HEATMAP_FIELDS,
  createCarsBinnedHeatmapReference
} from "./fixture.js";
import { createCarsBinnedHeatmapPrimitives } from "./primitive.program.js";

test("authors 80 ranged rects from the fixed Cars 2D-bin reference", () => {
  const cars = loadCars();
  const reference = createCarsBinnedHeatmapReference(cars);
  const program = createCarsBinnedHeatmapPrimitives(cars);
  const items = program.graphicSpec.objects.heatmap.items;

  assert.equal(items.length, 80);
  assert.equal(reference.eligibleCount, 398);
  assert.equal(reference.occupiedCount, 38);
  assert.deepEqual(
    program.semanticSpec.layers[0].encoding,
    {
      x: {
        field: BINNED_HEATMAP_FIELDS.x0,
        fieldType: "quantitative",
        scale: "x"
      },
      x2: {
        field: BINNED_HEATMAP_FIELDS.x1,
        fieldType: "quantitative",
        scale: "x"
      },
      y: {
        field: BINNED_HEATMAP_FIELDS.y0,
        fieldType: "quantitative",
        scale: "y"
      },
      y2: {
        field: BINNED_HEATMAP_FIELDS.y1,
        fieldType: "quantitative",
        scale: "y"
      },
      color: {
        field: BINNED_HEATMAP_FIELDS.count,
        fieldType: "quantitative",
        scale: "color"
      }
    }
  );
  assert.equal(items.every(item => item.properties.width > 0), true);
  assert.equal(items.every(item => item.properties.height > 0), true);
});

test("keeps the primitive numeric baseline independent from createBin2DData", () => {
  const program = createCarsBinnedHeatmapPrimitives(loadCars());

  assert.equal(typeof program.createWindowData, "function");
  assert.equal(typeof program.createBin2DData, "function");
  assert.equal(
    program.trace.children.some(node => node.op === "createBin2DData"),
    false
  );
});
