import { cloneAndFreeze, isPlainObject } from "./immutable.js";

const POSITION_CHANNELS = new Set(["x", "y"]);

export const TABLEAU10 = cloneAndFreeze([
  "#4c78a8",
  "#f58518",
  "#e45756",
  "#72b7b2",
  "#54a24b",
  "#eeca3b",
  "#b279a2",
  "#ff9da6",
  "#9d755d",
  "#bab0ac"
]);

function validatePair(value, label) {
  if (
    !Array.isArray(value) ||
    value.length !== 2 ||
    !value.every(Number.isFinite)
  ) {
    throw new TypeError(`${label} must be "auto" or two finite numbers.`);
  }

  return cloneAndFreeze(value);
}

export function validatePositionChannel(channel) {
  if (!POSITION_CHANNELS.has(channel)) {
    throw new Error(`Unknown position channel "${channel}".`);
  }

  return channel;
}

export function validateFieldType(fieldType) {
  if (fieldType !== "quantitative") {
    throw new Error(`Unsupported field type "${fieldType}".`);
  }

  return fieldType;
}

export function validateNominalFieldType(fieldType) {
  if (fieldType !== "nominal") {
    throw new Error(`Unsupported color field type "${fieldType}".`);
  }

  return fieldType;
}

export function validateScaleType(type) {
  if (type !== "linear" && type !== "ordinal") {
    throw new Error(`Unsupported scale type "${type}".`);
  }

  return type;
}

export function validateSemanticScaleType(type) {
  if (type !== "linear" && type !== "ordinal" && type !== "time") {
    throw new Error(`Unsupported scale type "${type}".`);
  }

  return type;
}

export function validateSemanticFieldType(fieldType) {
  if (!new Set(["quantitative", "nominal", "temporal"]).has(fieldType)) {
    throw new Error(`Unsupported semantic field type "${fieldType}".`);
  }

  return fieldType;
}

export function validateLinearScaleType(type) {
  if (type !== "linear") {
    throw new Error(`Unsupported position scale type "${type}".`);
  }

  return type;
}

export function validateOrdinalScaleType(type) {
  if (type !== "ordinal") {
    throw new Error(`Unsupported color scale type "${type}".`);
  }

  return type;
}

export function validateScaleDomain(domain) {
  return domain === "auto" ? domain : validatePair(domain, "Scale domain");
}

export function validateScaleRange(range) {
  return range === "auto" ? range : validatePair(range, "Scale range");
}

function isNominalValue(value) {
  return (
    typeof value === "string" ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  );
}

export function validateOrdinalDomain(domain) {
  if (domain === "auto") {
    return domain;
  }

  if (
    !Array.isArray(domain) ||
    domain.length === 0 ||
    !domain.every(isNominalValue) ||
    new Set(domain).size !== domain.length
  ) {
    throw new TypeError(
      "Ordinal domain must be \"auto\" or unique nominal values."
    );
  }

  return cloneAndFreeze(domain);
}

export function validateColorRange(range) {
  if (range === "auto") {
    return range;
  }

  if (Array.isArray(range)) {
    if (
      range.length === 0 ||
      !range.every(color => typeof color === "string" && color.length > 0)
    ) {
      throw new TypeError("Color range must contain non-empty color strings.");
    }

    return cloneAndFreeze(range);
  }

  if (
    !isPlainObject(range) ||
    Object.keys(range).length !== 1 ||
    range.palette !== "tableau10"
  ) {
    throw new Error('Color range palette must be "tableau10".');
  }

  return cloneAndFreeze(range);
}

export function validateSemanticScaleDomain(domain) {
  if (domain === "auto") {
    return domain;
  }

  if (!Array.isArray(domain) || domain.length === 0) {
    throw new TypeError("Scale domain must be \"auto\" or a non-empty array.");
  }

  return cloneAndFreeze(domain);
}

export function validateSemanticScaleRange(range) {
  if (range === "auto") {
    return range;
  }

  if (Array.isArray(range) && range.length > 0) {
    return cloneAndFreeze(range);
  }

  if (isPlainObject(range) && range.palette === "tableau10") {
    return cloneAndFreeze(range);
  }

  throw new TypeError("Scale range has an unsupported value.");
}

export function readQuantitativeField(rows, field) {
  if (typeof field !== "string" || field.length === 0) {
    throw new TypeError("Encoding field must be a non-empty string.");
  }

  return cloneAndFreeze(
    rows.map((row, index) => {
      if (!Object.hasOwn(row, field) || !Number.isFinite(row[field])) {
        throw new TypeError(
          `Field "${field}" must contain a finite number at row ${index}.`
        );
      }

      return row[field];
    })
  );
}

export function readNominalField(rows, field) {
  if (typeof field !== "string" || field.length === 0) {
    throw new TypeError("Encoding field must be a non-empty string.");
  }

  return cloneAndFreeze(
    rows.map((row, index) => {
      if (!Object.hasOwn(row, field) || !isNominalValue(row[field])) {
        throw new TypeError(
          `Field "${field}" must contain a nominal value at row ${index}.`
        );
      }

      return row[field];
    })
  );
}

export function resolveOrdinalDomain(domain, values) {
  const validated = validateOrdinalDomain(domain);

  if (validated !== "auto") {
    return validated;
  }

  if (values.length === 0) {
    throw new Error("Cannot infer an automatic ordinal domain from no values.");
  }

  return cloneAndFreeze([...new Set(values)]);
}

export function resolveColorRange(range) {
  const validated = validateColorRange(range);

  if (validated === "auto" || !Array.isArray(validated)) {
    return TABLEAU10;
  }

  return validated;
}

export function mapOrdinalValues(values, domain, range) {
  const indices = new Map(domain.map((value, index) => [value, index]));

  return cloneAndFreeze(
    values.map(value => {
      const index = indices.get(value);

      if (index === undefined) {
        throw new Error(`Value "${value}" is outside the ordinal domain.`);
      }

      return range[index % range.length];
    })
  );
}

export function resolveScaleDomain(domain, values) {
  const validated = validateScaleDomain(domain);

  if (validated !== "auto") {
    return validated;
  }

  if (values.length === 0) {
    throw new Error("Cannot infer an automatic scale domain from no values.");
  }

  let minimum = values[0];
  let maximum = values[0];

  for (const value of values.slice(1)) {
    minimum = Math.min(minimum, value);
    maximum = Math.max(maximum, value);
  }

  return cloneAndFreeze([minimum, maximum]);
}

export function resolveScaleRange(range, channel, bounds) {
  const validated = validateScaleRange(range);
  validatePositionChannel(channel);

  if (validated !== "auto") {
    return validated;
  }

  if (
    !isPlainObject(bounds) ||
    ![bounds.x, bounds.y, bounds.width, bounds.height].every(Number.isFinite)
  ) {
    throw new Error("Automatic position range requires graphical bounds.");
  }

  if (channel === "x") {
    return cloneAndFreeze([bounds.x, bounds.x + bounds.width]);
  }

  return cloneAndFreeze([bounds.y + bounds.height, bounds.y]);
}

export function mapLinearValues(values, domain, range) {
  const [domainStart, domainEnd] = validatePair(domain, "Resolved domain");
  const [rangeStart, rangeEnd] = validatePair(range, "Resolved range");

  if (!values.every(Number.isFinite)) {
    throw new TypeError("Linear scale values must be finite numbers.");
  }

  if (domainStart === domainEnd) {
    const midpoint = (rangeStart + rangeEnd) / 2;
    return cloneAndFreeze(values.map(() => midpoint));
  }

  const domainSpan = domainEnd - domainStart;
  const rangeSpan = rangeEnd - rangeStart;

  return cloneAndFreeze(
    values.map(
      value => rangeStart + ((value - domainStart) / domainSpan) * rangeSpan
    )
  );
}
