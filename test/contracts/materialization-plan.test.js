import assert from "node:assert/strict";
import test from "node:test";

import {
  applyMaterializationPlan
} from "../../src/materialization/dependencies.js";

test("executes materialization plans in order and deduplicates equivalent steps", () => {
  const calls = [];
  const program = {
    materialize(args) {
      calls.push(args.id);
      return this;
    },
    finish() {
      calls.push("finish");
      return this;
    }
  };

  const result = applyMaterializationPlan(program, [
    { op: "materialize", args: { id: "x" } },
    { op: "materialize", args: { id: "x" } },
    { op: "materialize", args: { id: "y" } },
    { op: "finish" },
    { op: "finish" }
  ]);

  assert.equal(result, program);
  assert.deepEqual(calls, ["x", "y", "finish"]);
});
