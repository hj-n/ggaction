import assert from "node:assert/strict";

import { render } from "../../src/index.js";
import { createMockCanvasContext } from "./canvas.js";

export function assertChartProgramsEquivalent({
  publicProgram,
  primitiveProgram
}) {
  const publicContext = createMockCanvasContext();
  const primitiveContext = createMockCanvasContext();

  render(publicProgram, publicContext);
  render(primitiveProgram, primitiveContext);

  assert.deepEqual(publicProgram.semanticSpec, primitiveProgram.semanticSpec);
  assert.deepEqual(publicProgram.graphicSpec, primitiveProgram.graphicSpec);
  assert.deepEqual(
    publicProgram.graphicSpec.order,
    primitiveProgram.graphicSpec.order
  );
  assert.deepEqual(publicContext.calls, primitiveContext.calls);
  assert.deepEqual(publicProgram.actionStack, []);
  assert.deepEqual(primitiveProgram.actionStack, []);
  for (const [label, program] of [
    ["public", publicProgram],
    ["primitive", primitiveProgram]
  ]) {
    assert.equal(Object.isFrozen(program.semanticSpec), true, `${label} semanticSpec`);
    assert.equal(Object.isFrozen(program.graphicSpec), true, `${label} graphicSpec`);
    assert.equal(Object.isFrozen(program.graphicSpec.order), true, `${label} order`);
  }
}
