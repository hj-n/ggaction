import assert from "node:assert/strict";
import test from "node:test";

import { namespaceGraphicSnapshot } from
  "../../../src/materialization/compositionSnapshot.js";
import { walkGraphicTreeEvents } from
  "../../../src/grammar/schemas/graphicTree.js";

function childGraphicSpec() {
  return {
    objects: {
      canvas: {
        type: "canvas",
        properties: { width: 240, height: 160, background: "white" },
        children: ["plot-main"]
      },
      "plot-main": {
        type: "collection",
        items: [],
        children: ["points"]
      },
      points: {
        type: "circle",
        items: [
          { id: "points:0", properties: { x: 30, y: 40, radius: 3 } },
          { id: "points:1", properties: { x: 80, y: 90, radius: 4 } }
        ]
      },
      note: {
        type: "text",
        properties: { x: 12, y: 145, text: "source note" }
      }
    },
    order: ["canvas", "note"]
  };
}

test("namespaces every object, item, attachment, and root", () => {
  const source = childGraphicSpec();
  const snapshot = namespaceGraphicSnapshot(source, {
    namespace: "main",
    x: 18,
    y: 24
  });

  assert.deepEqual(snapshot.order, ["main::canvas"]);
  assert.deepEqual(Object.keys(snapshot.objects), [
    "main::canvas",
    "main::plot-main",
    "main::points",
    "main::note"
  ]);
  assert.deepEqual(snapshot.objects["main::canvas"], {
    type: "canvas",
    properties: {
      width: 240,
      height: 160,
      background: "white",
      x: 18,
      y: 24
    },
    children: ["main::plot-main", "main::note"]
  });
  assert.deepEqual(
    snapshot.objects["main::points"].items.map(item => item.id),
    ["main::points:0", "main::points:1"]
  );
  const visits = [];
  walkGraphicTreeEvents(snapshot, {
    enter: ({ id }) => visits.push(id),
    item: ({ id }) => visits.push(id)
  });
  assert.deepEqual(visits, [
    "main::canvas",
    "main::plot-main",
    "main::points",
    "main::points:0",
    "main::points:1",
    "main::note"
  ]);
});

test("preserves source ownership and allows equal local IDs in separate namespaces", () => {
  const source = childGraphicSpec();
  const original = structuredClone(source);
  const left = namespaceGraphicSnapshot(source, { namespace: "left" });
  const right = namespaceGraphicSnapshot(source, { namespace: "right" });

  assert.deepEqual(source, original);
  assert.equal(
    new Set([...Object.keys(left.objects), ...Object.keys(right.objects)]).size,
    Object.keys(left.objects).length + Object.keys(right.objects).length
  );
  assert.ok(Object.isFrozen(left));
  assert.ok(Object.isFrozen(left.objects));
  assert.ok(Object.isFrozen(left.objects["left::points"].items));
});

test("adds complete ancestry when a composition snapshot becomes a child", () => {
  const inner = namespaceGraphicSnapshot(childGraphicSpec(), {
    namespace: "inner",
    x: 5,
    y: 7
  });
  const outer = namespaceGraphicSnapshot(inner, {
    namespace: "outer",
    x: 11,
    y: 13
  });

  assert.deepEqual(outer.order, ["outer::inner::canvas"]);
  assert.deepEqual(
    outer.objects["outer::inner::canvas"].children,
    ["outer::inner::plot-main", "outer::inner::note"]
  );
  assert.equal(
    outer.objects["outer::inner::canvas"].properties.x,
    11
  );
  assert.equal(
    outer.objects["outer::inner::canvas"].properties.y,
    13
  );
});

test("rejects incomplete and malformed child trees before copying", () => {
  assert.throws(
    () => namespaceGraphicSnapshot({ objects: {}, order: [] }, { namespace: "empty" }),
    /exactly one ordered canvas/
  );
  assert.throws(
    () => namespaceGraphicSnapshot({
      objects: {
        canvas: { type: "canvas", properties: { width: 0, height: 20 } }
      },
      order: ["canvas"]
    }, { namespace: "bad" }),
    /width must be a positive finite number/
  );
  assert.throws(
    () => namespaceGraphicSnapshot(childGraphicSpec(), { namespace: "bad::name" }),
    /must not contain the internal/
  );
  const dangling = childGraphicSpec();
  dangling.objects.canvas.children.push("missing");
  assert.throws(
    () => namespaceGraphicSnapshot(dangling, { namespace: "dangling" }),
    /Unknown attached graphic/
  );
});

