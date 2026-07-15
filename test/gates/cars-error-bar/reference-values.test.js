import assert from "node:assert/strict";
import test from "node:test";

import {
  RULE_GEOMETRY_LAYOUT,
  createRuleGeometryReferenceValues
} from "./reference-values.js";

test("locks every accepted rule endpoint geometry class", () => {
  const values = createRuleGeometryReferenceValues();

  assert.deepEqual(values.bounds, {
    left: 80,
    right: 680,
    top: 90,
    bottom: 410
  });
  assert.deepEqual(
    values.rules.map(rule => Object.keys(rule.channels)),
    [
      ["x"],
      ["y"],
      ["x", "y", "y2"],
      ["y", "x", "x2"],
      ["x", "y", "x2", "y2"]
    ]
  );
  assert.deepEqual(
    values.rules.map(rule => [rule.x1, rule.y1, rule.x2, rule.y2]),
    [
      [170, 90, 170, 410],
      [80, 147.6, 680, 147.6],
      [308, 352.4, 308, 198.8],
      [392, 288.4, 608, 288.4],
      [440, 115.6, 632, 224.4]
    ]
  );
});

test("keeps full spans on plot bounds and bounded rules inside them", () => {
  const { bounds, rules } = createRuleGeometryReferenceValues();
  const [vertical, horizontal, ...bounded] = rules;

  assert.deepEqual([vertical.y1, vertical.y2], [bounds.top, bounds.bottom]);
  assert.deepEqual([horizontal.x1, horizontal.x2], [bounds.left, bounds.right]);
  for (const rule of bounded) {
    assert.equal(rule.x1 >= bounds.left && rule.x1 <= bounds.right, true);
    assert.equal(rule.x2 >= bounds.left && rule.x2 <= bounds.right, true);
    assert.equal(rule.y1 >= bounds.top && rule.y1 <= bounds.bottom, true);
    assert.equal(rule.y2 >= bounds.top && rule.y2 <= bounds.bottom, true);
  }
  assert.deepEqual(RULE_GEOMETRY_LAYOUT.domain, [0, 100]);
});
