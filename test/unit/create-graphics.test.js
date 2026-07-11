import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../src/core/ChartProgram.js";

test("creates a concrete canvas without visual properties", () => {
  const empty = chart();
  const program = empty.createGraphics({ id: "canvas", type: "canvas" });

  assert.deepEqual(empty.graphicSpec, { objects: {}, order: [] });
  assert.deepEqual(program.graphicSpec, {
    objects: {
      canvas: { type: "canvas", properties: {} }
    },
    order: ["canvas"]
  });
  assert.equal(program.semanticSpec, empty.semanticSpec);
  assert.equal(program.trace.children[0].op, "createGraphics");
});

test("creates a homogeneous drawable collection with generated child IDs", () => {
  const program = chart().createGraphics({
    id: "points",
    type: "circle",
    length: 2
  });

  assert.deepEqual(program.graphicSpec.objects.points, {
    type: "circle",
    children: [
      { id: "points:0", properties: {} },
      { id: "points:1", properties: {} }
    ]
  });
});

test("treats an equivalent repeated creation as idempotent", () => {
  const first = chart().createGraphics({
    id: "points",
    type: "circle",
    length: 2
  });
  const second = first.createGraphics({
    id: "points",
    type: "circle",
    length: 2
  });

  assert.equal(second.graphicSpec, first.graphicSpec);
  assert.equal(second.trace.children.length, 2);
});

test("rejects invalid and conflicting graphic definitions", () => {
  assert.throws(
    () => chart().createGraphics({ id: "points", type: "ellipse" }),
    /Unknown graphic type/
  );
  assert.throws(
    () => chart().createGraphics({ id: "bad id", type: "circle" }),
    /requires an id/
  );
  assert.throws(
    () => chart().createGraphics({ id: "canvas", type: "canvas", length: 1 }),
    /does not accept length/
  );
  assert.throws(
    () => chart().createGraphics({ id: "points", type: "circle", length: -1 }),
    /non-negative integer/
  );

  const program = chart().createGraphics({ id: "shape", type: "circle" });
  assert.throws(
    () => program.createGraphics({ id: "shape", type: "rect" }),
    /different definition/
  );
});
