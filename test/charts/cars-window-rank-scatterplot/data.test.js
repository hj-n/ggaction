import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../../src/index.js";
import { createWindowReference } from "../../oracles/window.js";

const rows = Object.freeze([
  Object.freeze({ group: "A", score: 20, value: 4 }),
  Object.freeze({ group: "A", score: 10, value: 3 }),
  Object.freeze({ group: "B", score: 10, value: 5 }),
  Object.freeze({ group: "A", score: 20, value: 2 }),
  Object.freeze({ group: "B", score: 10, value: 1 }),
  Object.freeze({ group: "A", score: 30, value: 1 })
]);

const options = Object.freeze({
  partitionBy: "group",
  sortBy: Object.freeze([{ field: "score", order: "ascending" }]),
  operations: Object.freeze([
    { op: "rowNumber", as: "rowNumber" },
    { op: "rank", as: "rank" },
    { op: "denseRank", as: "denseRank" },
    { op: "cumulativeSum", field: "value", as: "running" },
    { op: "lag", field: "running", as: "previousRunning" },
    { op: "lead", field: "value", as: "nextValue", default: -1 }
  ])
});

test("public createWindowData exactly matches the independent window oracle", () => {
  const expected = createWindowReference(rows, options);
  const program = chart()
    .createData({ id: "source", values: rows })
    .createWindowData({ id: "windowed", ...options });

  assert.deepEqual(program.semanticSpec.datasets[1].values, expected);
  assert.deepEqual(
    program.trace.children.at(-1).children.map(node => node.op),
    ["createDerivedData", "materializeWindowData"]
  );
});
