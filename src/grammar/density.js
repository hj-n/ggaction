import { cloneAndFreeze, isPlainObject } from "../core/immutable.js";
import { isNominalValue } from "./scales/index.js";

const SQRT_TWO_PI = Math.sqrt(2 * Math.PI);

export const DENSITY_KERNELS = Object.freeze([
  "gaussian",
  "epanechnikov",
  "uniform",
  "triangular"
]);
export const DENSITY_NORMALIZATIONS = Object.freeze(["unit", "count"]);
export const DENSITY_PLACEMENT_SIDES = Object.freeze([
  "both", "left", "right", "top", "bottom"
]);
export const DENSITY_WIDTH_RESOLUTIONS = Object.freeze([
  "shared", "independent"
]);

export function validateDensityKernel(value) {
  if (!DENSITY_KERNELS.includes(value)) {
    throw new Error(`Unsupported density kernel "${value}".`);
  }
  return value;
}

export function validateDensityNormalization(value) {
  if (!DENSITY_NORMALIZATIONS.includes(value)) {
    throw new Error(`Unsupported density normalization "${value}".`);
  }
  return value;
}

function requireField(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  return value;
}

function validateSplitDomain(value) {
  if (
    !Array.isArray(value) ||
    value.length !== 2 ||
    !value.every(isNominalValue) ||
    Object.is(value[0], value[1])
  ) {
    throw new TypeError(
      "Density split domain must contain two distinct nominal values."
    );
  }
  return [...value];
}

function validatePlacementWidth(value = {}) {
  if (!isPlainObject(value)) {
    throw new TypeError("Density placement width must be a plain object.");
  }
  const unknown = Object.keys(value).find(key => !["band", "resolve"].includes(key));
  if (unknown !== undefined) {
    throw new Error(`Unknown density placement width property "${unknown}".`);
  }
  const band = value.band ?? 0.8;
  if (!Number.isFinite(band) || band <= 0 || band > 1) {
    throw new RangeError("Density placement width band must be in (0, 1].");
  }
  const resolve = value.resolve ?? "shared";
  if (!DENSITY_WIDTH_RESOLUTIONS.includes(resolve)) {
    throw new Error(`Unsupported density width resolve "${resolve}".`);
  }
  return { band, resolve };
}

export function normalizeDensityPlacement(value, {
  densityChannel = "x",
  groupBy,
  categoryField
} = {}) {
  if (!isPlainObject(value)) {
    throw new TypeError("Density placement must be a plain object.");
  }
  const unknown = Object.keys(value).find(
    key => !["type", "side", "width", "split", "scale"].includes(key)
  );
  if (unknown !== undefined) {
    throw new Error(`Unknown density placement property "${unknown}".`);
  }
  if (value.type === "baseline") return undefined;
  if (value.type !== "category") {
    throw new Error(`Unsupported density placement type "${value.type}".`);
  }
  if (!["x", "y"].includes(densityChannel)) {
    throw new Error(`Unsupported densityChannel "${densityChannel}".`);
  }
  const resolvedCategoryField = requireField(
    categoryField ?? groupBy,
    "Density placement category field"
  );
  const width = validatePlacementWidth(value.width);
  let split;
  if (value.split !== undefined) {
    if (!isPlainObject(value.split)) {
      throw new TypeError("Density placement split must be a plain object.");
    }
    const splitUnknown = Object.keys(value.split).find(
      key => !["field", "domain"].includes(key)
    );
    if (splitUnknown !== undefined) {
      throw new Error(`Unknown density split property "${splitUnknown}".`);
    }
    const field = requireField(value.split.field, "Density split field");
    if (field === groupBy) {
      throw new Error("Density split field must differ from groupBy.");
    }
    split = {
      field,
      ...(value.split.domain === undefined
        ? {}
        : { domain: validateSplitDomain(value.split.domain) })
    };
  }
  if (split !== undefined && Object.hasOwn(value, "side")) {
    throw new Error("Density split placement cannot also specify side.");
  }
  const side = split === undefined ? value.side ?? "both" : undefined;
  if (side !== undefined && !DENSITY_PLACEMENT_SIDES.includes(side)) {
    throw new Error(`Unsupported density placement side "${side}".`);
  }
  const horizontalWidth = densityChannel === "x";
  if (
    side !== undefined &&
    !(
      horizontalWidth
        ? ["both", "left", "right"].includes(side)
        : ["both", "top", "bottom"].includes(side)
    )
  ) {
    throw new Error(
      `Density ${densityChannel} placement does not support side "${side}".`
    );
  }
  return cloneAndFreeze({
    type: "category",
    channel: densityChannel,
    categoryField: resolvedCategoryField,
    ...(side === undefined ? {} : { side }),
    width,
    ...(split === undefined ? {} : { split })
  });
}

function validateStoredDensityPlacement(value, groupBy) {
  if (!isPlainObject(value)) {
    throw new TypeError("Density placement provenance must be a plain object.");
  }
  const unknown = Object.keys(value).find(
    key => !["type", "channel", "categoryField", "side", "width", "split"].includes(key)
  );
  if (unknown !== undefined) {
    throw new Error(`Unknown density placement provenance property "${unknown}".`);
  }
  const normalized = normalizeDensityPlacement({
    type: value.type,
    ...(value.side === undefined ? {} : { side: value.side }),
    width: value.width,
    ...(value.split === undefined ? {} : { split: value.split })
  }, {
    densityChannel: value.channel,
    groupBy,
    categoryField: value.categoryField
  });
  const sameSplit = normalized.split === undefined
    ? value.split === undefined
    : value.split !== undefined &&
      normalized.split.field === value.split.field &&
      (
        normalized.split.domain === undefined
          ? value.split.domain === undefined
          : value.split.domain !== undefined &&
            normalized.split.domain.length === value.split.domain.length &&
            normalized.split.domain.every((item, index) =>
              Object.is(item, value.split.domain[index])
            )
      );
  if (
    normalized.type !== value.type ||
    normalized.channel !== value.channel ||
    normalized.categoryField !== value.categoryField ||
    normalized.side !== value.side ||
    value.width === undefined ||
    normalized.width.band !== value.width.band ||
    normalized.width.resolve !== value.width.resolve ||
    !sameSplit
  ) {
    throw new Error("Density placement provenance must be fully normalized.");
  }
  return value;
}

export function validateDensityTransform(transform) {
  const supported = [
    "type", "field", "groupBy", "bandwidth", "extent", "steps", "as",
    "resolve", "kernel", "normalization", "placement", "resolved"
  ];
  const unknown = Object.keys(transform).find(key => !supported.includes(key));
  if (unknown !== undefined) {
    throw new Error(`Unknown density transform property "${unknown}".`);
  }
  if (transform.type !== "density") {
    throw new Error(`Unsupported density transform "${transform.type}".`);
  }
  requireField(transform.field, "Density field");
  if (transform.groupBy !== undefined) {
    requireField(transform.groupBy, "Density groupBy");
  }
  if (transform.placement !== undefined) {
    validateStoredDensityPlacement(transform.placement, transform.groupBy);
  }
  validateDensityKernel(transform.kernel ?? "gaussian");
  validateDensityNormalization(transform.normalization ?? "unit");
  if (
    transform.bandwidth !== "auto" &&
    (!Number.isFinite(transform.bandwidth) || transform.bandwidth <= 0)
  ) {
    throw new RangeError(
      "Density bandwidth must be a positive finite number or auto."
    );
  }
  if (
    transform.extent !== "auto" &&
    (!Array.isArray(transform.extent) ||
      transform.extent.length !== 2 ||
      !transform.extent.every(Number.isFinite) ||
      transform.extent[0] >= transform.extent[1])
  ) {
    throw new RangeError(
      "Density extent must be an ascending pair of finite numbers or auto."
    );
  }
  if (!Number.isInteger(transform.steps) || transform.steps < 2) {
    throw new RangeError("Density steps must be an integer of at least 2.");
  }
  if (
    !Array.isArray(transform.as) ||
    transform.as.length !== 2 ||
    !transform.as.every(value => typeof value === "string" && value.length > 0) ||
    transform.as[0] === transform.as[1]
  ) {
    throw new TypeError("Density as must contain two distinct non-empty fields.");
  }
  const collisions = new Set([
    transform.field,
    transform.groupBy,
    transform.placement?.categoryField,
    transform.placement?.split?.field
  ].filter(Boolean));
  if (transform.as.some(value => collisions.has(value))) {
    throw new Error(
      "Density output fields must not collide with source or group fields."
    );
  }
  if (transform.resolve !== "shared") {
    throw new Error(`Unsupported density resolve "${transform.resolve}".`);
  }
  if (transform.resolved !== undefined) {
    const resolved = transform.resolved;
    if (
      resolved === null ||
      typeof resolved !== "object" ||
      Array.isArray(resolved) ||
      Object.keys(resolved).some(
        key => !["bandwidth", "extent", "splitDomain"].includes(key)
      ) ||
      !Number.isFinite(resolved.bandwidth) ||
      resolved.bandwidth <= 0 ||
      !Array.isArray(resolved.extent) ||
      resolved.extent.length !== 2 ||
      !resolved.extent.every(Number.isFinite) ||
      resolved.extent[0] >= resolved.extent[1] ||
      (resolved.splitDomain !== undefined && (() => {
        try {
          validateSplitDomain(resolved.splitDomain);
          return transform.placement?.split === undefined;
        } catch {
          return true;
        }
      })())
    ) {
      throw new TypeError(
        "Density resolved provenance requires a positive bandwidth, ascending finite extent, and optional two-value split domain."
      );
    }
  }
  return transform;
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

export function estimateDensityBandwidth(values) {
  if (!Array.isArray(values) || !values.every(Number.isFinite)) {
    throw new TypeError("Density bandwidth values must be finite numbers.");
  }
  if (values.length < 2) {
    throw new Error("Density auto bandwidth requires at least two values.");
  }
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

function resolveBandwidth(value, sourceValues) {
  if (value === undefined || value === "auto") {
    return estimateDensityBandwidth(sourceValues);
  }
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(
      "Density bandwidth must be a positive finite number or auto."
    );
  }
  return value;
}

function resolveExtent(value, sourceValues) {
  if (value === undefined || value === "auto") {
    const extent = [Math.min(...sourceValues), Math.max(...sourceValues)];
    if (extent[0] === extent[1]) {
      throw new Error("Density observed extent requires varying finite values.");
    }
    return extent;
  }
  if (
    !Array.isArray(value) ||
    value.length !== 2 ||
    !value.every(Number.isFinite) ||
    value[0] >= value[1]
  ) {
    throw new RangeError(
      "Density extent must be an ascending pair of finite numbers or auto."
    );
  }
  return [...value];
}

function resolveOutputFields(as, field, groupBy, placement) {
  const resolved = as ?? [`${field}_value`, `${field}_density`];
  if (
    !Array.isArray(resolved) ||
    resolved.length !== 2 ||
    !resolved.every(value => typeof value === "string" && value.length > 0) ||
    resolved[0] === resolved[1]
  ) {
    throw new TypeError("Density as must contain two distinct non-empty fields.");
  }
  const collisions = new Set([
    field,
    groupBy,
    placement?.categoryField,
    placement?.split?.field
  ].filter(Boolean));
  if (resolved.some(value => collisions.has(value))) {
    throw new Error("Density output fields must not collide with source or group fields.");
  }
  return [...resolved];
}

const KERNEL_FUNCTIONS = Object.freeze({
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

function estimateAt(sample, values, bandwidth, kernel, normalization) {
  const sum = values.reduce(
    (total, value) => total + KERNEL_FUNCTIONS[kernel](
      (sample - value) / bandwidth
    ),
    0
  );
  const denominator = normalization === "unit"
    ? values.length * bandwidth
    : bandwidth;
  return sum / denominator;
}

export function deriveKernelDensity(values, {
  field,
  groupBy,
  bandwidth = "auto",
  extent = "auto",
  steps = 100,
  kernel = "gaussian",
  normalization = "unit",
  as,
  placement
} = {}) {
  if (!Array.isArray(values)) {
    throw new TypeError("Density values must be an array.");
  }
  const sourceField = requireField(field, "Density field");
  const groupField = groupBy === undefined
    ? undefined
    : requireField(groupBy, "Density groupBy");
  if (!Number.isInteger(steps) || steps < 2) {
    throw new RangeError("Density steps must be an integer of at least 2.");
  }
  if (placement !== undefined) {
    validateStoredDensityPlacement(placement, groupField);
  }
  const outputFields = resolveOutputFields(as, sourceField, groupField, placement);
  const resolvedKernel = validateDensityKernel(kernel);
  const resolvedNormalization = validateDensityNormalization(normalization);
  const validRows = values.filter(row =>
    row !== null &&
    typeof row === "object" &&
    Number.isFinite(row[sourceField]) &&
    (groupField === undefined || isNominalValue(row[groupField])) &&
    (placement?.split === undefined || isNominalValue(row[placement.split.field]))
  );
  if (validRows.length === 0) {
    throw new Error("Density requires at least one valid field/group row.");
  }
  const sourceValues = validRows.map(row => row[sourceField]);
  const resolvedBandwidth = resolveBandwidth(bandwidth, sourceValues);
  const resolvedExtent = resolveExtent(extent, sourceValues);
  const groups = groupField === undefined
    ? [undefined]
    : [...new Set(validRows.map(row => row[groupField]))];
  const observedSplits = placement?.split === undefined
    ? []
    : [...new Set(validRows.map(row => row[placement.split.field]))];
  let splitDomain;
  if (placement?.split !== undefined) {
    splitDomain = placement.split.domain === undefined
      ? observedSplits
      : validateSplitDomain(placement.split.domain);
    if (splitDomain.length !== 2) {
      throw new Error(
        "Density split inference requires exactly two observed values."
      );
    }
    if (observedSplits.some(value => !splitDomain.some(item => Object.is(item, value)))) {
      throw new Error("Density split domain must include every observed split value.");
    }
  }
  const sampleStep = (resolvedExtent[1] - resolvedExtent[0]) / (steps - 1);
  const samples = Array.from(
    { length: steps },
    (_, index) => index === steps - 1
      ? resolvedExtent[1]
      : placement === undefined
        ? resolvedExtent[0] + sampleStep * index
        : resolvedExtent[0] +
          (resolvedExtent[1] - resolvedExtent[0]) * index / (steps - 1)
  );
  const rows = [];
  for (const group of groups) {
    const splits = splitDomain ?? [undefined];
    for (const split of splits) {
      const groupValues = validRows
        .filter(row =>
          (groupField === undefined || Object.is(row[groupField], group)) &&
          (placement?.split === undefined ||
            Object.is(row[placement.split.field], split))
        )
        .map(row => row[sourceField]);
      if (groupValues.length === 0) continue;
      for (const sample of samples) {
        rows.push({
          ...(groupField === undefined
            ? placement === undefined
              ? {}
              : { [placement.categoryField]: "density" }
            : { [groupField]: group }),
          ...(placement?.split === undefined
            ? {}
            : { [placement.split.field]: split }),
          [outputFields[0]]: sample,
          [outputFields[1]]: estimateAt(
            sample,
            groupValues,
            resolvedBandwidth,
            resolvedKernel,
            resolvedNormalization
          )
        });
      }
    }
  }
  return cloneAndFreeze({
    fields: {
      source: sourceField,
      ...(groupField === undefined ? {} : { group: groupField }),
      value: outputFields[0],
      density: outputFields[1]
    },
    groups,
    ...(splitDomain === undefined ? {} : { splitDomain }),
    bandwidth: resolvedBandwidth,
    kernel: resolvedKernel,
    normalization: resolvedNormalization,
    extent: resolvedExtent,
    steps,
    samples,
    values: rows
  });
}
