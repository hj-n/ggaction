import assert from "node:assert/strict";
import test from "node:test";

import { createWindowReference } from "../../oracles/window.js";

const rows = [
  { group: "A", score: 20, value: 4 },
  { group: "A", score: 10, value: 3 },
  { group: "B", score: 10, value: 5 },
  { group: "A", score: 20, value: 2 },
  { group: "B", score: 10, value: 1 },
  { group: "A", score: 30, value: 1 }
];

test("preserves source order across stable sequential window operations", () => {
  const output = createWindowReference(rows, {
    partitionBy: "group",
    sortBy: [{ field: "score", order: "ascending" }],
    operations: [
      { op: "rowNumber", as: "rowNumber" },
      { op: "rank", as: "rank" },
      { op: "denseRank", as: "denseRank" },
      { op: "cumulativeSum", field: "value", as: "running" },
      { op: "lag", field: "running", as: "previousRunning" },
      { op: "lead", field: "value", as: "nextValue", default: -1 }
    ]
  });

  assert.deepEqual(output.map(row => ({
    rowNumber: row.rowNumber,
    rank: row.rank,
    denseRank: row.denseRank,
    running: row.running,
    previousRunning: row.previousRunning,
    nextValue: row.nextValue
  })), [
    { rowNumber: 2, rank: 2, denseRank: 2, running: 7, previousRunning: 3, nextValue: 2 },
    { rowNumber: 1, rank: 1, denseRank: 1, running: 3, previousRunning: null, nextValue: 4 },
    { rowNumber: 1, rank: 1, denseRank: 1, running: 5, previousRunning: null, nextValue: 1 },
    { rowNumber: 3, rank: 2, denseRank: 2, running: 9, previousRunning: 7, nextValue: 1 },
    { rowNumber: 2, rank: 1, denseRank: 1, running: 6, previousRunning: 5, nextValue: -1 },
    { rowNumber: 4, rank: 4, denseRank: 3, running: 10, previousRunning: 9, nextValue: -1 }
  ]);
  assert.deepEqual(rows[0], { group: "A", score: 20, value: 4 });
});

test("rejects ambiguous ranking and output collisions", () => {
  assert.throws(
    () => createWindowReference([{ value: 1 }], {
      operations: [{ op: "rank", as: "rank" }]
    }),
    /rank requires a non-empty sortBy/
  );
  assert.throws(
    () => createWindowReference([{ value: 1 }], {
      operations: [{ op: "rowNumber", as: "value" }]
    }),
    /output field "value" already exists/
  );
});
