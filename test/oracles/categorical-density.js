import { quantile } from "./numeric.js";

const SQRT_TWO_PI = Math.sqrt(2 * Math.PI);

const KERNELS = Object.freeze({
  gaussian(value) {
    return Math.exp(-0.5 * value ** 2) / SQRT_TWO_PI;
  },
  epanechnikov(value) {
    return Math.abs(value) <= 1 ? 0.75 * (1 - value ** 2) : 0;
  },
  uniform(value) {
    return Math.abs(value) <= 1 ? 0.5 : 0;
  },
  triangular(value) {
    return Math.abs(value) <= 1 ? 1 - Math.abs(value) : 0;
  }
});

function unique(values) {
  const result = [];
  for (const value of values) {
    if (!result.some(candidate => Object.is(candidate, value))) result.push(value);
  }
  return result;
}

function sampleDeviation(values) {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.sqrt(values.reduce(
    (sum, value) => sum + (value - mean) ** 2,
    0
  ) / (values.length - 1));
}

function autoBandwidth(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const deviation = sampleDeviation(sorted);
  const robust = (quantile(sorted, 0.75) - quantile(sorted, 0.25)) / 1.34;
  const spread = robust > 0 ? Math.min(deviation, robust) : deviation;
  const value = 1.06 * spread * sorted.length ** -0.2;
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Categorical density auto bandwidth requires varying values.");
  }
  return value;
}

function normalizeExtent(extent, values) {
  if (extent === undefined || extent === "auto") {
    const lower = Math.min(...values);
    const upper = Math.max(...values);
    if (lower === upper) {
      throw new Error("Categorical density extent requires varying values.");
    }
    return Object.freeze([lower, upper]);
  }
  if (
    !Array.isArray(extent) ||
    extent.length !== 2 ||
    !extent.every(Number.isFinite) ||
    extent[0] >= extent[1]
  ) {
    throw new RangeError("Categorical density extent must be an ascending finite pair.");
  }
  return Object.freeze([...extent]);
}

function normalizeBandwidth(bandwidth, values) {
  if (bandwidth === undefined || bandwidth === "auto") {
    return autoBandwidth(values);
  }
  if (!Number.isFinite(bandwidth) || bandwidth <= 0) {
    throw new RangeError("Categorical density bandwidth must be positive or auto.");
  }
  return bandwidth;
}

function normalizeSplitDomain(rows, splitField, splitDomain) {
  if (splitField === undefined) {
    if (splitDomain !== undefined) {
      throw new Error("Categorical density splitDomain requires splitField.");
    }
    return undefined;
  }
  const observed = unique(rows.map(row => row[splitField]));
  const domain = splitDomain === undefined ? observed : [...splitDomain];
  if (domain.length !== 2 || Object.is(domain[0], domain[1])) {
    throw new Error("Categorical density split requires exactly two distinct values.");
  }
  if (observed.some(value => !domain.some(candidate => Object.is(candidate, value)))) {
    throw new Error("Categorical density split domain must include every observed value.");
  }
  return Object.freeze(domain);
}

function estimate(sample, values, bandwidth, kernel, normalization) {
  const total = values.reduce((sum, value) =>
    sum + KERNELS[kernel]((sample - value) / bandwidth), 0);
  return total / (bandwidth * (normalization === "unit" ? values.length : 1));
}

export function calculateCategoricalDensity(rows, {
  valueField,
  categoryField,
  splitField,
  splitDomain,
  bandwidth = "auto",
  extent = "auto",
  steps = 80,
  kernel = "gaussian",
  normalization = "unit"
} = {}) {
  if (!Array.isArray(rows)) {
    throw new TypeError("Categorical density rows must be an array.");
  }
  if (typeof valueField !== "string" || valueField.length === 0) {
    throw new TypeError("Categorical density valueField must be a non-empty string.");
  }
  if (categoryField !== undefined && (
    typeof categoryField !== "string" || categoryField.length === 0
  )) {
    throw new TypeError("Categorical density categoryField must be a non-empty string.");
  }
  if (splitField !== undefined && (
    typeof splitField !== "string" || splitField.length === 0
  )) {
    throw new TypeError("Categorical density splitField must be a non-empty string.");
  }
  if (!Number.isInteger(steps) || steps < 2) {
    throw new RangeError("Categorical density steps must be an integer of at least 2.");
  }
  if (!Object.hasOwn(KERNELS, kernel)) {
    throw new Error(`Unknown categorical density kernel "${kernel}".`);
  }
  if (!["unit", "count"].includes(normalization)) {
    throw new Error(`Unknown categorical density normalization "${normalization}".`);
  }

  const eligible = rows.filter(row => Number.isFinite(row?.[valueField]));
  if (eligible.length === 0) {
    throw new Error("Categorical density requires at least one finite value.");
  }
  const values = eligible.map(row => row[valueField]);
  const resolvedExtent = normalizeExtent(extent, values);
  const resolvedBandwidth = normalizeBandwidth(bandwidth, values);
  const categories = categoryField === undefined
    ? Object.freeze([undefined])
    : Object.freeze(unique(eligible.map(row => row[categoryField])));
  const resolvedSplitDomain = normalizeSplitDomain(
    eligible,
    splitField,
    splitDomain
  );
  const samples = Object.freeze(Array.from({ length: steps }, (_, index) =>
    resolvedExtent[0] +
      (resolvedExtent[1] - resolvedExtent[0]) * index / (steps - 1)
  ));
  const splitValues = resolvedSplitDomain ?? [undefined];
  const profiles = [];

  for (const category of categories) {
    for (const split of splitValues) {
      const groupValues = eligible.filter(row =>
        (categoryField === undefined || Object.is(row[categoryField], category)) &&
        (splitField === undefined || Object.is(row[splitField], split))
      ).map(row => row[valueField]);
      if (groupValues.length === 0) continue;
      profiles.push(Object.freeze({
        category,
        split,
        count: groupValues.length,
        samples: Object.freeze(samples.map(value => Object.freeze({
          value,
          density: estimate(
            value,
            groupValues,
            resolvedBandwidth,
            kernel,
            normalization
          )
        })))
      }));
    }
  }

  return Object.freeze({
    bandwidth: resolvedBandwidth,
    categories,
    eligibleCount: eligible.length,
    extent: resolvedExtent,
    kernel,
    normalization,
    profiles: Object.freeze(profiles),
    splitDomain: resolvedSplitDomain,
    steps
  });
}
