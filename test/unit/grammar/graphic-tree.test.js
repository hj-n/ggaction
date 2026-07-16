import assert from "node:assert/strict";
import test from "node:test";

import {
  findGraphic,
  findGraphicParent,
  graphicSiblings,
  walkGraphicDrawOrder
} from "../../../src/grammar/schemas/graphicTree.js";
import {
  resolveConcreteGraphicBounds,
  unionConcreteGraphicBounds
} from "../../../src/grammar/schemas/graphicBounds.js";

function tree() {
  return {
    objects: {
      canvas: { type: "canvas", properties: {}, children: ["plot"] },
      plot: { type: "collection", items: [], children: ["points", "path"] },
      points: {
        type: "circle",
        items: [
          { id: "points:0", properties: { x: 10, y: 20, radius: 3, strokeWidth: 2 } },
          { id: "points:1", properties: { x: 30, y: 40, radius: 4 } }
        ]
      },
      path: {
        type: "path",
        properties: {
          commands: [{ op: "M", x: 0, y: 5 }, { op: "L", x: 50, y: 25 }],
          strokeWidth: 2
        }
      }
    },
    order: ["canvas"]
  };
}

test("finds named graphics, generated items, parents, and siblings globally", () => {
  const spec = tree();
  assert.equal(findGraphic(spec, "path").kind, "object");
  assert.equal(findGraphic(spec, "points:1").ownerId, "points");
  assert.equal(findGraphicParent(spec, "points").id, "plot");
  assert.equal(findGraphicParent(spec, "points:0").id, "points");
  assert.deepEqual(graphicSiblings(spec, "path"), ["points", "path"]);
});

test("walks attached named graphics in deterministic depth-first order", () => {
  const ids = [];
  walkGraphicDrawOrder(tree(), ({ id }) => ids.push(id));
  assert.deepEqual(ids, ["canvas", "plot", "points", "path"]);
});

test("resolves item, path, and subtree bounds through one shared policy", () => {
  const spec = tree();
  assert.deepEqual(resolveConcreteGraphicBounds(spec, "points:0"), {
    left: 6,
    right: 14,
    top: 16,
    bottom: 24
  });
  assert.deepEqual(resolveConcreteGraphicBounds(spec, "path"), {
    left: -1,
    right: 51,
    top: 4,
    bottom: 26
  });
  assert.deepEqual(unionConcreteGraphicBounds(spec, ["points", "path"]), {
    left: -1,
    right: 51,
    top: 4,
    bottom: 44
  });
});

test("rejects cycles, duplicate attachment, and orphaned named graphics", () => {
  const cycle = tree();
  cycle.objects.path.children = ["plot"];
  assert.throws(() => walkGraphicDrawOrder(cycle, () => {}), /cycle/);

  const duplicate = tree();
  duplicate.order.push("path");
  assert.throws(() => walkGraphicDrawOrder(duplicate, () => {}), /more than once/);

  const orphan = tree();
  orphan.objects.orphan = { type: "rect", properties: {} };
  assert.throws(() => walkGraphicDrawOrder(orphan, () => {}), /not attached/);
});
