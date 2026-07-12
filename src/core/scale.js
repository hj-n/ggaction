import { cloneAndFreeze, isPlainObject } from "./immutable.js";

const POSITION_CHANNELS = new Set(["x", "y"]);

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

export function validateScaleType(type) {
  if (type !== "linear") {
    throw new Error(`Unsupported scale type "${type}".`);
  }

  return type;
}

export function validateScaleDomain(domain) {
  return domain === "auto" ? domain : validatePair(domain, "Scale domain");
}

export function validateScaleRange(range) {
  return range === "auto" ? range : validatePair(range, "Scale range");
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
