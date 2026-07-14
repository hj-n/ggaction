import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../../../src/index.js";
import { SCALAR_AGGREGATE_OPERATIONS } from "../../../../src/grammar/aggregate.js";

const lineRows = [
  { year: "2020-01-01", value: 1, category: "A" },
  { year: "2020-01-01", value: 3, category: "B" },
  { year: "2020-01-01", value: 100, category: "B" },
  { year: "2021-01-01", value: 2, category: "A" },
  { year: "2021-01-01", value: 6, category: "A" },
  { year: "2021-01-01", value: 8, category: "B" }
];

function xEncodedLine(rows = lineRows) {
  return chart()
    .createCanvas({ width: 280, height: 180, margin: 20 })
    .createData({ id: "data", values: rows })
    .createLineMark({ id: "trends" })
    .encodeX({ field: "year", fieldType: "temporal" });
}

test("materializes every scalar aggregate through encodeY", () => {
  for (const aggregate of SCALAR_AGGREGATE_OPERATIONS) {
    const program = xEncodedLine().encodeY({ field: "value", aggregate });

    assert.equal(program.semanticSpec.layers[0].encoding.y.aggregate, aggregate);
    assert.equal(program.graphicSpec.objects.trends.children.length, 1);
    assert.equal(
      program.graphicSpec.objects.trends.children[0].properties.commands.every(
        command => Number.isFinite(command.x) && Number.isFinite(command.y)
      ),
      true,
      aggregate
    );
  }
});

test("supports nominal count operations with a quantitative output scale", () => {
  for (const aggregate of ["count", "distinct", "valid", "missing"]) {
    const program = xEncodedLine().encodeY({
      field: "category",
      fieldType: "nominal",
      aggregate
    });

    assert.equal(program.semanticSpec.layers[0].encoding.y.fieldType, "nominal");
    assert.equal(program.semanticSpec.scales[1].type, "linear");
    assert.equal(program.resolvedScales.y.type, "linear");
  }
});

test("omits incomplete aggregate groups without synthesizing points", () => {
  const rows = [
    { year: "2020-01-01", value: 1 },
    { year: "2021-01-01", value: null },
    { year: "2022-01-01", value: 5 }
  ];
  const program = xEncodedLine(rows).encodeY({ field: "value", aggregate: "mean" });
  const commands = program.graphicSpec.objects.trends.children[0].properties.commands;

  assert.equal(commands.length, 2);
  assert.deepEqual(
    commands.map(command => command.x),
    [20, 260]
  );
});

test("replaces aggregate semantics and rematerializes inferred guide text atomically", () => {
  const mean = xEncodedLine()
    .encodeY({ field: "value", aggregate: "mean", scale: { nice: true } })
    .createGuides();
  const median = mean.encodeY({ field: "value", aggregate: "median" });

  assert.equal(mean.semanticSpec.layers[0].encoding.y.aggregate, "mean");
  assert.equal(mean.semanticSpec.guides.axis.y.title, "mean(value)");
  assert.equal(median.semanticSpec.layers[0].encoding.y.aggregate, "median");
  assert.equal(median.semanticSpec.guides.axis.y.title, "median(value)");
  assert.equal(
    median.graphicSpec.objects.yAxisTitle.properties.text,
    "median(value)"
  );
  assert.notDeepEqual(
    median.graphicSpec.objects.horizontalGridLines.children.map(child => child.properties.y1),
    mean.graphicSpec.objects.horizontalGridLines.children.map(child => child.properties.y1)
  );
  assert.notDeepEqual(
    median.graphicSpec.objects.yAxisLabels.children.map(child => child.properties.text),
    mean.graphicSpec.objects.yAxisLabels.children.map(child => child.properties.text)
  );

  const custom = mean
    .editYAxisTitle({ text: "Custom summary" })
    .encodeY({ field: "value", aggregate: "stdev" });
  assert.equal(custom.semanticSpec.guides.axis.y.title, "Custom summary");
  assert.equal(custom.graphicSpec.objects.yAxisTitle.properties.text, "Custom summary");

  assert.throws(
    () => median.encodeY({
      field: "value",
      aggregate: { op: "quantile", probability: 0.75 }
    }),
    /supported scalar aggregate/
  );
  assert.equal(median.semanticSpec.layers[0].encoding.y.aggregate, "median");
});

test("materializes scalar aggregate grouped bars at the final category grain", () => {
  const rows = [
    { year: 2020, group: "A", value: 1 },
    { year: 2020, group: "A", value: 5 },
    { year: 2020, group: "B", value: 8 },
    { year: 2021, group: "A", value: 2 },
    { year: 2021, group: "B", value: 4 },
    { year: 2021, group: "B", value: 10 }
  ];
  const program = chart()
    .createCanvas({ width: 420, height: 300, margin: 40 })
    .createData({ id: "data", values: rows })
    .createBarMark({ id: "bars" })
    .encodeX({ field: "year", fieldType: "ordinal" })
    .encodeY({ field: "value", aggregate: "median" })
    .encodeColor({ field: "group", layout: "group" })
    .encodeBarWidth();

  assert.equal(program.semanticSpec.layers[0].encoding.y.aggregate, "median");
  assert.deepEqual(program.resolvedScales.y.domain, [2, 8]);
  assert.equal(program.graphicSpec.objects.bars.children.length, 4);
  assert.equal(
    program.graphicSpec.objects.bars.children.every(child =>
      Number.isFinite(child.properties.x) && Number.isFinite(child.properties.y)
    ),
    true
  );
});
