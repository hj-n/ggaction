import assert from "node:assert/strict";
import test from "node:test";

import {
  aggregateScalarValues,
  SCALAR_AGGREGATE_OPERATIONS,
  validateAggregate,
  validateAggregateFieldValues,
  validateScalarAggregateFieldType
} from "../../../../src/grammar/aggregate.js";

test("computes the complete scalar aggregate vocabulary", () => {
  const values = [1, 2, 3, 4];
  const expected = {
    count: 4,
    sum: 10,
    mean: 2.5,
    median: 2.5,
    min: 1,
    max: 4,
    distinct: 4,
    valid: 4,
    missing: 0,
    variance: 5 / 3,
    varianceP: 1.25,
    stdev: Math.sqrt(5 / 3),
    stdevP: Math.sqrt(1.25),
    stderr: Math.sqrt(5 / 3) / 2,
    q1: 1.75,
    q3: 3.25,
    ciLower: 2.5 - 1.96 * Math.sqrt(5 / 3) / 2,
    ciUpper: 2.5 + 1.96 * Math.sqrt(5 / 3) / 2
  };

  assert.deepEqual([...SCALAR_AGGREGATE_OPERATIONS].sort(), Object.keys(expected).sort());
  for (const [operation, value] of Object.entries(expected)) {
    assert.equal(aggregateScalarValues(values, operation), value, operation);
  }
});

test("applies missing, distinct, and finite quantitative policies", () => {
  const values = [1, 1, null, undefined, NaN, Infinity, "1", false];

  assert.equal(aggregateScalarValues(values, "count"), 8);
  assert.equal(aggregateScalarValues(values, "valid"), 5);
  assert.equal(aggregateScalarValues(values, "missing"), 3);
  assert.equal(aggregateScalarValues(values, "distinct"), 4);
  assert.equal(aggregateScalarValues(values, "sum"), 2);
  assert.equal(aggregateScalarValues(values, "mean"), 1);
});

test("omits operations without their required valid sample", () => {
  const missing = [null, undefined, NaN, Infinity, "bad"];

  for (const operation of [
    "sum", "mean", "median", "min", "max", "variance", "varianceP",
    "stdev", "stdevP", "stderr", "q1", "q3", "ciLower", "ciUpper"
  ]) {
    assert.equal(aggregateScalarValues(missing, operation), undefined, operation);
  }
  for (const operation of ["variance", "stdev", "stderr", "ciLower", "ciUpper"]) {
    assert.equal(aggregateScalarValues([4], operation), undefined, operation);
  }
  assert.equal(aggregateScalarValues([4], "varianceP"), 0);
  assert.equal(aggregateScalarValues([4], "stdevP"), 0);
});

test("validates scalar field compatibility and parameter aggregate schemas", () => {
  for (const operation of ["count", "distinct", "valid", "missing"]) {
    assert.equal(validateScalarAggregateFieldType(operation, "nominal"), "nominal");
  }
  assert.equal(validateScalarAggregateFieldType("median", "quantitative"), "quantitative");
  assert.throws(
    () => validateScalarAggregateFieldType("median", "nominal"),
    /does not support field type/
  );
  assert.throws(
    () => validateScalarAggregateFieldType("mean", "temporal"),
    /does not support field type/
  );
  assert.deepEqual(
    validateAggregate({ op: "quantile", probability: 0.75 }),
    { op: "quantile", probability: 0.75 }
  );
  assert.throws(() => validateAggregate("mode"), /Unsupported aggregate/);
  assert.throws(() => aggregateScalarValues({}, "mean"), /must be an array/);
  assert.doesNotThrow(() => validateAggregateFieldValues(
    [{ value: 1 }, { value: null }, { value: NaN }],
    "value",
    "quantitative"
  ));
  assert.doesNotThrow(() => validateAggregateFieldValues(
    [{ value: "A" }, { value: false }, { value: 2 }, {}],
    "value",
    "nominal"
  ));
  assert.throws(
    () => validateAggregateFieldValues([{ value: "1" }], "value", "quantitative"),
    /numeric or missing/
  );
  assert.throws(
    () => validateAggregateFieldValues([{ value: {} }], "value", "nominal"),
    /nominal or missing/
  );
});
