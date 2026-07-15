import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../../../src/index.js";

const rows = [
  { id: "a1", category: "A", x: 1, y: 10 },
  { id: "b1", category: "B", x: 2, y: 20 },
  { id: "a2", category: "A", x: 3, y: 30 },
  { id: "b2", category: "B", x: 4, y: 40 }
];

function encodedPointProgram() {
  return chart()
    .createCanvas({ width: 400, height: 300, margin: 30 })
    .createData({ id: "rows", values: rows })
    .createPointMark({ id: "points" })
    .encodeX({
      field: "x",
      scale: { nice: false, zero: false }
    })
    .encodeY({
      field: "y",
      scale: { nice: false, zero: false }
    });
}

test("supports the shortest call immediately after point creation", () => {
  const program = chart()
    .createData({ id: "rows", values: rows })
    .createPointMark({ id: "points" })
    .filterMark({ field: "category", oneOf: ["A"] });

  assert.equal(program.semanticSpec.layers[0].data, "pointsFilteredData");
  assert.equal(program.graphicSpec.objects.points.children.length, 2);
  assert.deepEqual(
    program.trace.children.at(-1).children.map(node => node.op),
    ["filterData", "editSemantic", "rematerializePointMark"]
  );
});

test("filters the current mark through an immutable derived dataset", () => {
  const before = encodedPointProgram();
  const program = before.filterMark({
    field: "category",
    oneOf: ["A"]
  });

  assert.deepEqual(program.semanticSpec.datasets[0], {
    id: "rows",
    values: rows
  });
  assert.deepEqual(program.semanticSpec.datasets[1], {
    id: "pointsFilteredData",
    source: "rows",
    transform: [{ type: "filter", field: "category", oneOf: ["A"] }],
    values: [rows[0], rows[2]]
  });
  assert.equal(program.semanticSpec.layers[0].data, "pointsFilteredData");
  assert.equal(program.context.currentData, "pointsFilteredData");
  assert.deepEqual(program.resolvedScales.x.domain, [1, 3]);
  assert.deepEqual(program.resolvedScales.y.domain, [10, 30]);
  assert.equal(program.graphicSpec.objects.points.children.length, 2);
  assert.equal(before.semanticSpec.layers[0].data, "rows");
  assert.equal(before.graphicSpec.objects.points.children.length, 4);

  assert.deepEqual(
    program.trace.children.at(-1).children.map(node => node.op),
    ["filterData", "editSemantic", "rematerializeScale", "rematerializeScale"]
  );
});

test("supports explicit targets and comparison or range modes", () => {
  const base = encodedPointProgram();
  const compared = base.filterMark({
    target: "points",
    field: "x",
    predicate: { op: "gte", value: 3 }
  });
  const ranged = base.filterMark({
    target: "points",
    field: "x",
    range: { min: 2, max: 3, inclusive: true }
  });

  assert.deepEqual(
    compared.semanticSpec.datasets[1].values.map(row => row.id),
    ["a2", "b2"]
  );
  assert.deepEqual(
    ranged.semanticSpec.datasets[1].values.map(row => row.id),
    ["b1", "a2"]
  );
});

test("rematerializes connected axes and grids from the filtered scale domains", () => {
  const before = encodedPointProgram().createGuides({ legend: false });
  const after = before.filterMark({
    field: "category",
    oneOf: ["A"]
  });

  assert.deepEqual(
    before.graphicSpec.objects.xAxisLabels.children.map(
      child => child.properties.text
    ),
    ["1", "2", "3", "4"]
  );
  assert.deepEqual(
    after.graphicSpec.objects.xAxisLabels.children.map(
      child => child.properties.text
    ),
    ["1", "1.5", "2", "2.5", "3"]
  );
  assert.notDeepEqual(
    after.graphicSpec.objects.horizontalGridLines,
    before.graphicSpec.objects.horizontalGridLines
  );
});

test("validates mark selection and filter application atomically", () => {
  const base = encodedPointProgram();
  assert.throws(
    () => base.filterMark({ target: "missing", field: "x", oneOf: [1] }),
    /Unknown filter mark target/
  );
  assert.throws(
    () => base.filterMark({ field: "x", oneOf: [1], range: { min: 1, max: 2 } }),
    /exactly one/
  );
  const filtered = base.filterMark({ field: "category", oneOf: ["A"] });
  assert.throws(
    () => filtered.filterMark({ field: "category", oneOf: ["B"] }),
    /already exists/
  );
  assert.equal(base.semanticSpec.datasets.length, 1);
  assert.equal(base.semanticSpec.layers[0].data, "rows");
});
