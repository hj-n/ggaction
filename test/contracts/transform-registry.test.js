import assert from "node:assert/strict";
import test from "node:test";

import {
  findTransformValidator,
  validateDatasetTransforms
} from "../../src/grammar/transforms.js";

test("keeps every stored dataset transform in the grammar registry", () => {
  for (const type of [
    "filter",
    "markFilter",
    "regression",
    "density",
    "interval",
    "boxSummary",
    "boxOutlier"
  ]) {
    assert.equal(typeof findTransformValidator(type), "function");
  }
  assert.equal(findTransformValidator("unknown"), undefined);
  assert.throws(
    () => validateDatasetTransforms([{ type: "unknown" }]),
    /Unsupported dataset transform/
  );
});
