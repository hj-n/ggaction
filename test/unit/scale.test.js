import assert from "node:assert/strict";
import test from "node:test";

import {
  mapLinearValues,
  readQuantitativeField,
  resolveScaleDomain,
  resolveScaleRange,
  validateFieldType,
  validatePositionChannel,
  validateScaleDomain,
  validateScaleRange,
  validateScaleType
} from "../../src/core/scale.js";

test("reads finite quantitative field values", () => {
  const values = readQuantitativeField([{ value: 1 }, { value: 4 }], "value");

  assert.deepEqual(values, [1, 4]);
  assert.equal(Object.isFrozen(values), true);
  assert.throws(
    () => readQuantitativeField([{ value: 1 }, {}], "value"),
    /finite number at row 1/
  );
});

test("resolves automatic domains and positional ranges", () => {
  const bounds = { x: 70, y: 30, width: 540, height: 310 };

  assert.deepEqual(resolveScaleDomain("auto", [4, 1, 9]), [1, 9]);
  assert.deepEqual(resolveScaleRange("auto", "x", bounds), [70, 610]);
  assert.deepEqual(resolveScaleRange("auto", "y", bounds), [340, 30]);
  assert.deepEqual(resolveScaleDomain([0, 10], []), [0, 10]);
  assert.deepEqual(resolveScaleRange([5, 15], "x", undefined), [5, 15]);
});

test("maps linear values and centers a constant domain", () => {
  assert.deepEqual(mapLinearValues([0, 5, 10], [0, 10], [20, 100]), [
    20,
    60,
    100
  ]);
  assert.deepEqual(mapLinearValues([2, 2], [2, 2], [10, 20]), [15, 15]);
  assert.throws(
    () => mapLinearValues([NaN], [2, 2], [10, 20]),
    /finite numbers/
  );
});

test("validates the STEP6 scale vocabulary and bounds", () => {
  assert.equal(validatePositionChannel("x"), "x");
  assert.equal(validateFieldType("quantitative"), "quantitative");
  assert.equal(validateScaleType("linear"), "linear");
  assert.equal(validateScaleDomain("auto"), "auto");
  assert.equal(validateScaleRange("auto"), "auto");

  assert.throws(() => validatePositionChannel("color"), /Unknown/);
  assert.throws(() => validateFieldType("nominal"), /Unsupported/);
  assert.throws(() => validateScaleType("log"), /Unsupported/);
  assert.throws(() => validateScaleDomain([0]), /two finite numbers/);
  assert.throws(() => validateScaleRange([0, Infinity]), /two finite numbers/);
  assert.throws(
    () => resolveScaleDomain("auto", []),
    /infer an automatic scale domain/
  );
  assert.throws(
    () => resolveScaleRange("auto", "x", undefined),
    /requires graphical bounds/
  );
});
