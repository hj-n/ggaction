import assert from "node:assert/strict";
import test from "node:test";

import { chart, render } from "../../src/index.js";

test("공개 module 경계를 제공한다", () => {
  assert.equal(typeof chart, "function");
  assert.equal(typeof render, "function");
});
