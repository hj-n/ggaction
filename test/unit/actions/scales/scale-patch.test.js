import assert from "node:assert/strict";
import test from "node:test";

import {
  changedScaleEditPatch,
  scaleEditPatch
} from "../../../../src/actions/scales/patch.js";

test("builds one canonical public scale-edit argument subset", () => {
  assert.deepEqual(scaleEditPatch("x", {
    type: "linear",
    domain: [0, 10],
    range: [20, 100],
    internal: "ignored"
  }), {
    id: "x",
    type: "linear",
    domain: [0, 10],
    range: [20, 100]
  });
});

test("omits equivalent scale edits and retains changed nested values", () => {
  const current = {
    id: "color",
    type: "ordinal",
    domain: ["a", "b"],
    range: ["red", "blue"]
  };
  assert.equal(changedScaleEditPatch(current, { ...current }), undefined);
  assert.deepEqual(changedScaleEditPatch(current, {
    ...current,
    range: ["blue", "red"]
  }), {
    id: "color",
    type: "ordinal",
    domain: ["a", "b"],
    range: ["blue", "red"]
  });
});
