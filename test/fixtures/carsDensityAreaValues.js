const SQRT_TWO_PI = Math.sqrt(2 * Math.PI);

function requireNonEmptyString(value, name) {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${name} must be a non-empty string.`);
  }
}

function quantile(sortedValues, probability) {
  const index = (sortedValues.length - 1) * probability;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sortedValues[lower];
  const ratio = index - lower;
  return sortedValues[lower] * (1 - ratio) + sortedValues[upper] * ratio;
}

function sampleDeviation(values) {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const sumSquares = values.reduce(
    (sum, value) => sum + (value - mean) ** 2,
    0
  );
  return Math.sqrt(sumSquares / (values.length - 1));
}

function estimateScottBandwidth(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const deviation = sampleDeviation(sorted);
  const interquartileRange = quantile(sorted, 0.75) - quantile(sorted, 0.25);
  const robustDeviation = interquartileRange / 1.34;
  const spread = robustDeviation > 0
    ? Math.min(deviation, robustDeviation)
    : deviation;
  const bandwidth = 1.06 * spread * sorted.length ** -0.2;

  if (!Number.isFinite(bandwidth) || bandwidth <= 0) {
    throw new Error("Density auto bandwidth requires varying finite values.");
  }
  return bandwidth;
}

function resolveBandwidth(option, values) {
  if (option === undefined || option === "auto") {
    return estimateScottBandwidth(values);
  }
  if (!Number.isFinite(option) || option <= 0) {
    throw new RangeError("Density bandwidth must be a positive finite number or auto.");
  }
  return option;
}

function resolveExtent(option, values) {
  if (option === undefined || option === "auto") {
    const extent = [Math.min(...values), Math.max(...values)];
    if (extent[0] === extent[1]) {
      throw new Error("Density observed extent requires varying finite values.");
    }
    return extent;
  }
  if (
    !Array.isArray(option) ||
    option.length !== 2 ||
    !option.every(Number.isFinite) ||
    option[0] >= option[1]
  ) {
    throw new RangeError("Density extent must be an ascending pair of finite numbers.");
  }
  return [...option];
}

function gaussianKernel(value) {
  return Math.exp(-0.5 * value ** 2) / SQRT_TWO_PI;
}

function estimateDensity(sample, values, bandwidth) {
  const kernelSum = values.reduce(
    (sum, value) => sum + gaussianKernel((sample - value) / bandwidth),
    0
  );
  return kernelSum / (values.length * bandwidth);
}

export function createCarsDensityAreaValues(
  cars,
  {
    field = "Acceleration",
    groupBy = "Origin",
    bandwidth = 0.6,
    extent = "auto",
    steps = 100,
    as = ["Acceleration_value", "Acceleration_density"]
  } = {}
) {
  if (!Array.isArray(cars)) {
    throw new TypeError("Cars must be an array.");
  }
  requireNonEmptyString(field, "Density field");
  requireNonEmptyString(groupBy, "Density groupBy");
  if (
    !Array.isArray(as) ||
    as.length !== 2 ||
    !as.every(value => typeof value === "string" && value.length > 0) ||
    as[0] === as[1] ||
    as.includes(groupBy)
  ) {
    throw new TypeError(
      "Density as must contain two distinct non-empty fields different from groupBy."
    );
  }
  if (!Number.isInteger(steps) || steps < 2) {
    throw new RangeError("Density steps must be an integer of at least 2.");
  }

  const validRows = cars
    .filter(row =>
      row !== null &&
      typeof row === "object" &&
      Number.isFinite(row[field]) &&
      typeof row[groupBy] === "string" &&
      row[groupBy].length > 0
    )
    .map(row => structuredClone(row));
  if (validRows.length === 0) {
    throw new Error("Density requires at least one valid field/group row.");
  }

  const sourceValues = validRows.map(row => row[field]);
  const resolvedBandwidth = resolveBandwidth(bandwidth, sourceValues);
  const resolvedExtent = resolveExtent(extent, sourceValues);
  const groupDomain = [...new Set(validRows.map(row => row[groupBy]))];
  const sampleStep = (resolvedExtent[1] - resolvedExtent[0]) / (steps - 1);
  const sampleValues = Array.from(
    { length: steps },
    (_, index) => index === steps - 1
      ? resolvedExtent[1]
      : resolvedExtent[0] + sampleStep * index
  );
  const groups = groupDomain.map(group => {
    const values = validRows
      .filter(row => row[groupBy] === group)
      .map(row => row[field]);
    const rows = sampleValues.map(sample => ({
      [groupBy]: group,
      [as[0]]: sample,
      [as[1]]: estimateDensity(sample, values, resolvedBandwidth)
    }));
    return {
      group,
      values: [...values],
      rows,
      peak: rows.reduce(
        (highest, row) => row[as[1]] > highest[as[1]] ? row : highest
      )
    };
  });

  return {
    validRows,
    fields: { source: field, group: groupBy, value: as[0], density: as[1] },
    bandwidth: resolvedBandwidth,
    extent: resolvedExtent,
    steps,
    sampleValues,
    groupDomain,
    groups,
    densityRows: groups.flatMap(group => group.rows.map(row => ({ ...row })))
  };
}
