import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../../../src/index.js";

test("creates an unnamed area with a stable role id", () => {
  const before = chart().createData({ values: [] });
  const program = before.createAreaMark();

  assert.deepEqual(program.semanticSpec.layers, [
    { id: "area", mark: { type: "area" }, data: "data" }
  ]);
  assert.deepEqual(program.graphicSpec.objects.area, {
    type: "path",
    children: []
  });
  assert.deepEqual(program.markConfigs.area, {
    fill: "#4c78a8",
    opacity: 0.2
  });
  assert.equal(program.context.currentMark, "area");
  assert.deepEqual(program.trace.children.at(-1).args, {});
  assert.deepEqual(before.semanticSpec.layers, []);
});

test("requires an explicit id for another area role", () => {
  const program = chart()
    .createData({ values: [] })
    .createAreaMark({ id: "first" });

  assert.throws(
    () => program.createAreaMark(),
    /requires an explicit area mark id because its default is ambiguous/
  );
  assert.equal(program.createAreaMark({ id: "second" }).context.currentMark, "second");
});
