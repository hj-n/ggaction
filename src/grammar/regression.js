import { cloneAndFreeze } from "../core/immutable.js";
import {
  readNominalField,
  readQuantitativeField
} from "./scales.js";

export const REGRESSION_LOWER_FIELD = "__regression_ci_lower";
export const REGRESSION_UPPER_FIELD = "__regression_ci_upper";

function requireField(field, label) {
  if (typeof field !== "string" || field.length === 0) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  return field;
}

function logGamma(value) {
  const coefficients = [
    676.5203681218851,
    -1259.1392167224028,
    771.3234287776531,
    -176.6150291621406,
    12.507343278686905,
    -0.13857109526572012,
    9.984369578019572e-6,
    1.5056327351493116e-7
  ];
  if (value < 0.5) {
    return Math.log(Math.PI) -
      Math.log(Math.sin(Math.PI * value)) -
      logGamma(1 - value);
  }
  const shifted = value - 1;
  let series = 0.9999999999998099;
  for (let index = 0; index < coefficients.length; index += 1) {
    series += coefficients[index] / (shifted + index + 1);
  }
  const base = shifted + coefficients.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) +
    (shifted + 0.5) * Math.log(base) - base + Math.log(series);
}

function betaContinuedFraction(a, b, x) {
  const maxIterations = 200;
  const epsilon = 3e-14;
  const minimum = 1e-300;
  const sum = a + b;
  const aPlusOne = a + 1;
  const aMinusOne = a - 1;
  let c = 1;
  let d = 1 - sum * x / aPlusOne;
  if (Math.abs(d) < minimum) d = minimum;
  d = 1 / d;
  let result = d;

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const even = iteration * 2;
    let numerator = iteration * (b - iteration) * x /
      ((aMinusOne + even) * (a + even));
    d = 1 + numerator * d;
    if (Math.abs(d) < minimum) d = minimum;
    c = 1 + numerator / c;
    if (Math.abs(c) < minimum) c = minimum;
    d = 1 / d;
    result *= d * c;

    numerator = -(a + iteration) * (sum + iteration) * x /
      ((a + even) * (aPlusOne + even));
    d = 1 + numerator * d;
    if (Math.abs(d) < minimum) d = minimum;
    c = 1 + numerator / c;
    if (Math.abs(c) < minimum) c = minimum;
    d = 1 / d;
    const delta = d * c;
    result *= delta;
    if (Math.abs(delta - 1) <= epsilon) return result;
  }
  throw new Error("Student-t calculation did not converge.");
}

function regularizedIncompleteBeta(value, a, b) {
  if (value === 0 || value === 1) return value;
  const factor = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) +
    a * Math.log(value) + b * Math.log1p(-value)
  );
  if (value < (a + 1) / (a + b + 2)) {
    return factor * betaContinuedFraction(a, b, value) / a;
  }
  return 1 - factor * betaContinuedFraction(b, a, 1 - value) / b;
}

function studentTCdf(value, degreesOfFreedom) {
  if (value === 0) return 0.5;
  const ratio = degreesOfFreedom /
    (degreesOfFreedom + value * value);
  const tail = regularizedIncompleteBeta(
    ratio,
    degreesOfFreedom / 2,
    0.5
  ) / 2;
  return value > 0 ? 1 - tail : tail;
}

export function studentTCritical(confidence, degreesOfFreedom) {
  if (!Number.isFinite(confidence) || confidence <= 0 || confidence >= 1) {
    throw new RangeError("Regression confidence must be between 0 and 1.");
  }
  if (!Number.isInteger(degreesOfFreedom) || degreesOfFreedom <= 0) {
    throw new RangeError("Student-t degrees of freedom must be positive.");
  }
  const probability = (1 + confidence) / 2;
  let low = 0;
  let high = 1;
  while (studentTCdf(high, degreesOfFreedom) < probability) high *= 2;
  for (let iteration = 0; iteration < 100; iteration += 1) {
    const midpoint = (low + high) / 2;
    if (studentTCdf(midpoint, degreesOfFreedom) < probability) low = midpoint;
    else high = midpoint;
  }
  return (low + high) / 2;
}

function fitGroup(rows, { x, y, group, confidence }) {
  const count = rows.length;
  const groupLabel = group === undefined ? "all" : String(group);
  if (count < 3) {
    throw new Error(
      `Regression group "${groupLabel}" requires at least three rows.`
    );
  }
  const meanX = rows.reduce((sum, row) => sum + row[x], 0) / count;
  const meanY = rows.reduce((sum, row) => sum + row[y], 0) / count;
  let sxx = 0;
  let sxy = 0;
  for (const row of rows) {
    const xDifference = row[x] - meanX;
    sxx += xDifference ** 2;
    sxy += xDifference * (row[y] - meanY);
  }
  if (sxx === 0) {
    throw new Error(
      `Regression group "${groupLabel}" requires varying x values.`
    );
  }
  const slope = sxy / sxx;
  const intercept = meanY - slope * meanX;
  const residualSumSquares = rows.reduce((sum, row) => {
    const residual = row[y] - (intercept + slope * row[x]);
    return sum + residual ** 2;
  }, 0);
  const degreesOfFreedom = count - 2;
  return {
    count,
    degreesOfFreedom,
    meanX,
    meanY,
    sxx,
    slope,
    intercept,
    residualSumSquares,
    residualStandardError: Math.sqrt(residualSumSquares / degreesOfFreedom),
    critical: studentTCritical(confidence, degreesOfFreedom)
  };
}

export function deriveLinearRegression(values, {
  x,
  y,
  groupBy,
  confidence = 0.95
} = {}) {
  if (!Array.isArray(values)) {
    throw new TypeError("Regression values must be an array.");
  }
  requireField(x, "Regression x field");
  requireField(y, "Regression y field");
  if (groupBy !== undefined) requireField(groupBy, "Regression groupBy field");
  if (!Number.isFinite(confidence) || confidence <= 0 || confidence >= 1) {
    throw new RangeError("Regression confidence must be between 0 and 1.");
  }
  readQuantitativeField(values, x);
  readQuantitativeField(values, y);
  if (groupBy !== undefined) readNominalField(values, groupBy);

  const groups = groupBy === undefined
    ? [undefined]
    : [...new Set(values.map(row => row[groupBy]))];
  const models = [];
  const rows = [];

  for (const group of groups) {
    const groupRows = groupBy === undefined
      ? values
      : values.filter(row => row[groupBy] === group);
    const model = fitGroup(groupRows, { x, y, group, confidence });
    const xValues = [...new Set(groupRows.map(row => row[x]))]
      .sort((left, right) => left - right);
    models.push({ ...(groupBy === undefined ? {} : { group }), ...model, xValues });

    for (const xValue of xValues) {
      const prediction = model.intercept + model.slope * xValue;
      const standardError = model.residualStandardError * Math.sqrt(
        1 / model.count + (xValue - model.meanX) ** 2 / model.sxx
      );
      const margin = model.critical * standardError;
      rows.push({
        ...(groupBy === undefined ? {} : { [groupBy]: group }),
        [x]: xValue,
        [y]: prediction,
        [REGRESSION_LOWER_FIELD]: prediction - margin,
        [REGRESSION_UPPER_FIELD]: prediction + margin
      });
    }
  }

  return cloneAndFreeze({
    fields: {
      x,
      y,
      ...(groupBy === undefined ? {} : { group: groupBy }),
      lower: REGRESSION_LOWER_FIELD,
      upper: REGRESSION_UPPER_FIELD
    },
    groups,
    models,
    values: rows
  });
}
