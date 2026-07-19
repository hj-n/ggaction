import assert from "node:assert/strict";
import test from "node:test";

import { createProgramCompositionPrimitives } from "./primitive.program.js";

test("authors the composition example with concrete nested Canvas primitives", () => {
  const program = createProgramCompositionPrimitives();
  assert.deepEqual(program.graphicSpec.objects.canvas.properties, {
    width: 588,
    height: 244,
    background: "white"
  });
  assert.equal(program.graphicSpec.objects.canvas.children.length, 2);
  assert.equal(program.semanticSpec.layers.length, 0);
  const childCanvases = program.graphicSpec.objects.canvas.children.map(
    id => program.graphicSpec.objects[id]
  );
  assert.deepEqual(
    childCanvases.map(canvas => canvas.properties.background),
    ["#eff6ff", "#fff7ed"]
  );
  assert.deepEqual(
    childCanvases.map(canvas => canvas.children
      .map(id => program.graphicSpec.objects[id])
      .find(graphic => graphic.type === "text")?.properties.text),
    ["Observed points", "Replacement bars"]
  );
  assert.equal(
    Object.values(program.graphicSpec.objects).some(graphic => graphic.type === "circle"),
    true
  );
  assert.equal(
    Object.values(program.graphicSpec.objects).some(graphic => graphic.type === "rect"),
    true
  );
});
