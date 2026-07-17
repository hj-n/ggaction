import assert from "node:assert/strict";
import test from "node:test";

import { createProgramCompositionPrimitives } from "./primitive.program.js";

test("authors the composition example with concrete nested Canvas primitives", () => {
  const program = createProgramCompositionPrimitives();
  assert.deepEqual(program.graphicSpec.objects.canvas.properties, {
    width: 528,
    height: 224,
    background: "white"
  });
  assert.equal(program.graphicSpec.objects.canvas.children.length, 2);
  assert.equal(program.semanticSpec.layers.length, 0);
});
