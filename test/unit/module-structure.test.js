import assert from "node:assert/strict";
import test from "node:test";

import { chart, render } from "../../src/index.js";

test("exports the public module boundaries", () => {
  assert.equal(typeof chart, "function");
  assert.equal(typeof render, "function");
});
