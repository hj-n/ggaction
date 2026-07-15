import assert from "node:assert/strict";
import test from "node:test";

import {
  createMockCanvasContext,
  findCanvasCalls
} from "../../support/canvas.js";
import {
  createRuleGeometryPrimitives,
  renderRuleGeometryPrimitives
} from "./primitive.program.js";
import {
  createRuleGeometryReferenceValues
} from "./reference-values.js";
import { createRuleGeometryProgram } from "./public.program.js";
import { assertChartProgramsEquivalent } from
  "../../support/chart-equivalence.js";

test("authors the rule geometry gate with raw graphical primitives", () => {
  const values = createRuleGeometryReferenceValues();
  const program = createRuleGeometryPrimitives();

  assert.equal(program.semanticSpec.datasets.length, 1);
  assert.equal(program.semanticSpec.datasets[0].id, "data");
  assert.deepEqual(program.semanticSpec.datasets[0].values, values.rows);
  assert.deepEqual(
    program.semanticSpec.layers.map(layer => layer.mark.type),
    values.rules.map(() => "rule")
  );
  assert.deepEqual(
    program.graphicSpec.order.slice(1, 6),
    values.rules.map(rule => rule.id)
  );
  for (const rule of values.rules) {
    assert.deepEqual(
      program.graphicSpec.objects[rule.id].children[0].properties,
      {
        x1: rule.x1,
        y1: rule.y1,
        x2: rule.x2,
        y2: rule.y2,
        stroke: rule.stroke,
        strokeWidth: 3,
        strokeDash: [],
        opacity: 1
      }
    );
  }
  const ops = program.trace.children.map(node => node.op);
  for (const futureAction of [
    "createRuleMark",
    "encodeX2",
    "encodeStroke",
    "encodeStrokeWidth"
  ]) {
    assert.equal(ops.includes(futureAction), false, futureAction);
  }
});

test("matches the approved rule primitive with public rule actions", () => {
  assertChartProgramsEquivalent({
    primitiveProgram: createRuleGeometryPrimitives(),
    publicProgram: createRuleGeometryProgram()
  });
});

test("renders exact concrete rule endpoints through the shared line renderer", () => {
  const values = createRuleGeometryReferenceValues();
  const context = createMockCanvasContext();

  renderRuleGeometryPrimitives(context);

  assert.deepEqual(
    findCanvasCalls(context, "moveTo").slice(0, 5).map(call => call.args),
    values.rules.map(rule => [rule.x1, rule.y1])
  );
  assert.deepEqual(
    findCanvasCalls(context, "lineTo").slice(0, 5).map(call => call.args),
    values.rules.map(rule => [rule.x2, rule.y2])
  );
  assert.deepEqual(
    findCanvasCalls(context, "stroke").slice(0, 5).map(call => call.strokeStyle),
    values.rules.map(rule => rule.stroke)
  );
});
