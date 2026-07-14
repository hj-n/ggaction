import assert from "node:assert/strict";
import test from "node:test";

import {
  CATEGORICAL_LEGEND_CHANNELS,
  ENCODING_CHANNELS,
  LEGEND_CONFIG_KINDS,
  MARK_TYPES,
  POSITION_CHANNELS,
  SCALED_ENCODING_CHANNELS
} from "../../../src/core/vocabulary.js";

test("owns the implemented semantic and legend vocabularies in one module", () => {
  assert.deepEqual(MARK_TYPES, ["point", "line", "bar", "area"]);
  assert.deepEqual(POSITION_CHANNELS, ["x", "y"]);
  assert.deepEqual(CATEGORICAL_LEGEND_CHANNELS, [
    "color", "strokeDash", "shape"
  ]);
  assert.deepEqual(LEGEND_CONFIG_KINDS, [
    "series", "color", "size", "gradient", "opacity"
  ]);
  assert.equal(ENCODING_CHANNELS.includes("group"), true);
  assert.equal(SCALED_ENCODING_CHANNELS.includes("group"), false);
  for (const vocabulary of [
    MARK_TYPES,
    POSITION_CHANNELS,
    CATEGORICAL_LEGEND_CHANNELS,
    LEGEND_CONFIG_KINDS,
    ENCODING_CHANNELS,
    SCALED_ENCODING_CHANNELS
  ]) {
    assert.equal(Object.isFrozen(vocabulary), true);
  }
});
