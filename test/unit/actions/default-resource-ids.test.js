import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../../src/index.js";

test("authors a complete single-mark chart without resource IDs", () => {
  const program = chart()
    .createCanvas()
    .createData({ values: [{ x: 1, y: 4 }, { x: 2, y: 8 }] })
    .createPointMark()
    .encodeX({ field: "x" })
    .encodeY({ field: "y" })
    .encodeRadius({ value: 3 });

  assert.equal(program.semanticSpec.datasets[0].id, "data");
  assert.deepEqual(program.semanticSpec.layers.map(layer => layer.id), ["point"]);
  assert.equal(program.semanticSpec.layers[0].data, "data");
  assert.equal(program.context.currentData, "data");
  assert.equal(program.context.currentMark, "point");
  assert.equal(program.graphicSpec.objects.point.items.every(child =>
    Number.isFinite(child.properties.x) &&
    Number.isFinite(child.properties.y) &&
    child.properties.radius === 3
  ), true);
});

test("keeps different unnamed mark roles deterministic", () => {
  const program = chart()
    .createData({ values: [] })
    .createPointMark()
    .createLineMark()
    .createBarMark()
    .createAreaMark();

  assert.deepEqual(
    program.semanticSpec.layers.map(layer => layer.id),
    ["point", "line", "bar", "area"]
  );
});
