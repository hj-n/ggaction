import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../../../src/index.js";

const rows = Object.freeze([
  Object.freeze({ category: "A", value: 2 }),
  Object.freeze({ category: "B", value: 4 })
]);

test("creates an unnamed arc with a stable role id and empty path collection", () => {
  const before = chart().createData({ values: rows });
  const program = before.createArcMark();

  assert.deepEqual(program.semanticSpec.layers, [
    { id: "arc", mark: { type: "arc" }, data: "data" }
  ]);
  assert.deepEqual(program.graphicSpec.objects.arc, {
    type: "path",
    items: []
  });
  assert.deepEqual(program.markConfigs.arc, {
    innerRadius: 0,
    padAngle: 0,
    opacity: 1,
    stroke: "#ffffff",
    strokeWidth: 1
  });
  assert.equal(program.context.currentMark, "arc");
  assert.equal(before.semanticSpec.layers.length, 0);
  assert.deepEqual(program.trace.children.at(-1).children.map(node => node.op), [
    "editSemantic",
    "editSemantic",
    "createGraphics"
  ]);
});

test("validates arc geometry options and preserves earlier programs", () => {
  const base = chart().createData({ values: rows });
  const program = base.createArcMark({
    innerRadius: 0.4,
    padAngle: 2,
    opacity: 0.7,
    strokeWidth: 0.5
  });

  assert.equal(program.markConfigs.arc.innerRadius, 0.4);
  assert.equal(program.markConfigs.arc.padAngle, 2);
  assert.equal(program.markConfigs.arc.opacity, 0.7);
  assert.equal(program.markConfigs.arc.strokeWidth, 0.5);
  assert.equal(base.markConfigs.arc, undefined);
  assert.throws(
    () => base.createArcMark({ innerRadius: 1 }),
    /less than 1|exclusive/
  );
  assert.throws(
    () => base.createArcMark({ padAngle: -1 }),
    /non-negative/
  );
});

test("requires an explicit id for another arc role", () => {
  const program = chart()
    .createData({ values: rows })
    .createArcMark({ id: "first" });

  assert.throws(
    () => program.createArcMark(),
    /requires an explicit arc mark id because its default is ambiguous/
  );
  assert.equal(program.createArcMark({ id: "second" }).context.currentMark, "second");
});
