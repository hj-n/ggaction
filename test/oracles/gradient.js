const SQRT_TWO_PI = Math.sqrt(2 * Math.PI);

export const REFERENCE_BLUES = Object.freeze([
  "#cfe1f2", "#bed8ec", "#a8cee5", "#8fc1de", "#74b2d7",
  "#5ba3cf", "#4592c6", "#3181bd", "#206fb2", "#125ca4", "#0a4a90"
]);

function quantile(sortedValues, probability) {
  const index = (sortedValues.length - 1) * probability;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sortedValues[lower];
  const amount = index - lower;
  return sortedValues[lower] * (1 - amount) + sortedValues[upper] * amount;
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
  const bandwidth = 1.06 * spread * sorted.length ** -0.2;
  if (!Number.isFinite(bandwidth) || bandwidth <= 0) {
    throw new Error("Gradient density reference requires varying finite values.");
  }
  return bandwidth;
}

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

function estimate(sample, values, bandwidth, kernel, normalization) {
  const total = values.reduce(
    (sum, value) => sum + KERNELS[kernel]((sample - value) / bandwidth),
    0
  );
  return total / (bandwidth * (normalization === "unit" ? values.length : 1));
}

function median(values) {
  return quantile([...values].sort((left, right) => left - right), 0.5);
}

export function createGroupedDensityProfileReference(rows, {
  category,
  value,
  bandwidth = "auto",
  extent = "auto",
  steps = 64,
  kernel = "gaussian",
  normalization = "unit"
} = {}) {
  if (!Array.isArray(rows)) throw new TypeError("Gradient reference rows must be an array.");
  if (typeof category !== "string" || category.length === 0) {
    throw new TypeError("Gradient reference category must be a non-empty string.");
  }
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError("Gradient reference value must be a non-empty string.");
  }
  if (!Number.isInteger(steps) || steps < 2) {
    throw new RangeError("Gradient reference steps must be at least 2.");
  }
  if (!Object.hasOwn(KERNELS, kernel)) throw new Error(`Unknown reference kernel "${kernel}".`);
  if (!new Set(["unit", "count"]).has(normalization)) {
    throw new Error(`Unknown reference normalization "${normalization}".`);
  }
  const valid = rows.filter(row =>
    row !== null && typeof row === "object" &&
    ["string", "number", "boolean"].includes(typeof row[category]) &&
    Number.isFinite(row[value])
  );
  if (valid.length === 0) throw new Error("Gradient reference requires valid category/value rows.");
  const sourceValues = valid.map(row => row[value]);
  const resolvedBandwidth = bandwidth === "auto"
    ? autoBandwidth(sourceValues)
    : bandwidth;
  if (!Number.isFinite(resolvedBandwidth) || resolvedBandwidth <= 0) {
    throw new RangeError("Gradient reference bandwidth must be positive.");
  }
  const resolvedExtent = extent === "auto"
    ? [Math.min(...sourceValues), Math.max(...sourceValues)]
    : [...extent];
  if (
    resolvedExtent.length !== 2 ||
    !resolvedExtent.every(Number.isFinite) ||
    resolvedExtent[0] >= resolvedExtent[1]
  ) {
    throw new RangeError("Gradient reference extent must be ascending and finite.");
  }
  const sampleStep = (resolvedExtent[1] - resolvedExtent[0]) / (steps - 1);
  const samples = Array.from({ length: steps }, (_, index) =>
    index === steps - 1
      ? resolvedExtent[1]
      : resolvedExtent[0] + sampleStep * index
  );
  const categories = [...new Set(valid.map(row => row[category]))];
  const profiles = categories.map(categoryValue => {
    const groupValues = valid
      .filter(row => row[category] === categoryValue)
      .map(row => row[value]);
    return {
      category: categoryValue,
      values: [...samples],
      intensities: samples.map(sample => estimate(
        sample,
        groupValues,
        resolvedBandwidth,
        kernel,
        normalization
      )),
      lower: resolvedExtent[0],
      upper: resolvedExtent[1],
      center: median(groupValues),
      count: groupValues.length
    };
  });
  const maximumIntensity = Math.max(
    ...profiles.flatMap(profile => profile.intensities)
  );
  return {
    categories,
    profiles,
    bandwidth: resolvedBandwidth,
    extent: resolvedExtent,
    steps,
    maximumIntensity
  };
}

function parseHex(color) {
  const match = color.match(/^#([0-9a-f]{6})$/i);
  if (!match) throw new Error(`Reference palette requires six-digit hex colors, received "${color}".`);
  return [0, 2, 4].map(offset => Number.parseInt(match[1].slice(offset, offset + 2), 16));
}

function interpolatePalette(palette, position) {
  const bounded = Math.max(0, Math.min(1, position));
  const scaled = bounded * (palette.length - 1);
  const left = Math.floor(scaled);
  const right = Math.min(palette.length - 1, left + 1);
  const amount = scaled - left;
  const a = parseHex(palette[left]);
  const b = parseHex(palette[right]);
  return a.map((channel, index) => Math.round(
    channel + (b[index] - channel) * amount
  ));
}

function alphaColor(rgb, opacity) {
  const alpha = Number(opacity.toFixed(6));
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

export function createDensityPaintReference(profile, {
  extent,
  maximumIntensity,
  orientation = "vertical",
  reverse = false,
  palette = REFERENCE_BLUES,
  opacity = [0, 1]
} = {}) {
  if (!profile || !Array.isArray(profile.values) || !Array.isArray(profile.intensities)) {
    throw new TypeError("Density paint reference requires one profile.");
  }
  if (profile.values.length !== profile.intensities.length || profile.values.length < 2) {
    throw new Error("Density paint reference requires matching sample vectors.");
  }
  const [minimumValue, maximumValue] = extent;
  const [minimumOpacity, maximumOpacity] = opacity;
  const start = orientation === "vertical"
    ? { x: 0.5, y: 1 }
    : { x: 0, y: 0.5 };
  const end = orientation === "vertical"
    ? { x: 0.5, y: 0 }
    : { x: 1, y: 0.5 };
  const stops = profile.values.map((sample, index) => {
    const offset = (sample - minimumValue) / (maximumValue - minimumValue);
    const intensity = profile.intensities[index] / maximumIntensity;
    const rgb = interpolatePalette(palette, intensity);
    return {
      offset,
      color: alphaColor(
        rgb,
        minimumOpacity + (maximumOpacity - minimumOpacity) * intensity
      )
    };
  });
  return {
    type: "linear-gradient",
    from: reverse ? end : start,
    to: reverse ? start : end,
    stops
  };
}

export function createLegendPaintReference({
  orientation = "vertical",
  reverse = false,
  palette = REFERENCE_BLUES,
  opacity = [0, 1]
} = {}) {
  const values = palette.map((_, index) => index / (palette.length - 1));
  return createDensityPaintReference({ values, intensities: values }, {
    extent: [0, 1],
    maximumIntensity: 1,
    orientation,
    reverse,
    palette,
    opacity
  });
}
