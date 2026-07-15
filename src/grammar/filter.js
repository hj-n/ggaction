import { cloneAndFreeze, isPlainObject } from "../core/immutable.js";

export const FILTER_COMPARISON_OPERATORS = Object.freeze([
  "eq", "neq", "lt", "lte", "gt", "gte"
]);

function isFiniteOrString(value) {
  return typeof value === "string" || Number.isFinite(value);
}

function validatePredicate(predicate) {
  if (!isPlainObject(predicate)) {
    throw new TypeError("Filter predicate must be a plain object.");
  }
  const unknown = Object.keys(predicate).find(
    key => !["op", "value"].includes(key)
  );
  if (unknown !== undefined) {
    throw new Error(`Unknown filter predicate property "${unknown}".`);
  }
  if (!FILTER_COMPARISON_OPERATORS.includes(predicate.op)) {
    throw new Error(`Unsupported filter comparison operator "${predicate.op}".`);
  }
  if (!Object.hasOwn(predicate, "value")) {
    throw new TypeError("Filter predicate requires a value.");
  }
  if (
    !["eq", "neq"].includes(predicate.op) &&
    !isFiniteOrString(predicate.value)
  ) {
    throw new TypeError(
      "Ordered filter comparison values must be finite numbers or strings."
    );
  }
}

function validateRange(range) {
  if (!isPlainObject(range)) {
    throw new TypeError("Filter range must be a plain object.");
  }
  const unknown = Object.keys(range).find(
    key => !["min", "max", "inclusive"].includes(key)
  );
  if (unknown !== undefined) {
    throw new Error(`Unknown filter range property "${unknown}".`);
  }
  if (
    !isFiniteOrString(range.min) ||
    !isFiniteOrString(range.max) ||
    typeof range.min !== typeof range.max
  ) {
    throw new TypeError(
      "Filter range endpoints must be finite numbers or strings of one type."
    );
  }
  if (range.min > range.max) {
    throw new RangeError("Filter range min must not exceed max.");
  }
  if (range.inclusive !== undefined && typeof range.inclusive !== "boolean") {
    throw new TypeError("Filter range inclusive must be a boolean.");
  }
}

export function validateFilterTransform(transform) {
  if (!isPlainObject(transform)) {
    throw new TypeError("Filter transform must be a plain object.");
  }
  const supported = ["type", "field", "oneOf", "predicate", "range"];
  const unknown = Object.keys(transform).find(key => !supported.includes(key));
  if (unknown !== undefined) {
    throw new Error(`Unknown filter transform property "${unknown}".`);
  }
  if (typeof transform.field !== "string" || transform.field.length === 0) {
    throw new TypeError("Filter field must be a non-empty field string.");
  }
  const modes = ["oneOf", "predicate", "range"].filter(
    key => Object.hasOwn(transform, key)
  );
  if (modes.length !== 1) {
    throw new Error(
      "Filter transform requires exactly one of oneOf, predicate, or range."
    );
  }
  if (modes[0] === "predicate") {
    validatePredicate(transform.predicate);
    return;
  }
  if (modes[0] === "range") {
    validateRange(transform.range);
    return;
  }
  if (
    !Array.isArray(transform.oneOf) ||
    transform.oneOf.length === 0 ||
    transform.oneOf.some(value =>
      value !== null &&
      typeof value !== "string" &&
      typeof value !== "boolean" &&
      !(typeof value === "number" && Number.isFinite(value))
    )
  ) {
    throw new TypeError("Filter oneOf must be a non-empty array of scalar values.");
  }
}

export function normalizeFilterTransform({
  field,
  oneOf,
  predicate,
  range
}) {
  const modes = { oneOf, predicate, range };
  const selected = Object.keys(modes).filter(key => modes[key] !== undefined);
  const transform = {
    type: "filter",
    field,
    ...(selected[0] === "oneOf" ? { oneOf } : {}),
    ...(selected[0] === "predicate" ? { predicate } : {}),
    ...(selected[0] === "range"
      ? { range: { ...range, inclusive: range?.inclusive ?? true } }
      : {})
  };
  if (selected.length !== 1) {
    throw new Error(
      "filterData requires exactly one of oneOf, predicate, or range."
    );
  }
  validateFilterTransform(transform);
  return cloneAndFreeze(transform);
}

function comparable(value, operand) {
  return (
    Number.isFinite(value) && Number.isFinite(operand)
  ) || (
    typeof value === "string" && typeof operand === "string"
  );
}

function matches(value, transform) {
  if (transform.oneOf !== undefined) {
    return transform.oneOf.includes(value);
  }
  if (transform.predicate !== undefined) {
    const { op, value: operand } = transform.predicate;
    if (op === "eq") return value === operand;
    if (op === "neq") return value !== operand;
    if (!comparable(value, operand)) return false;
    if (op === "lt") return value < operand;
    if (op === "lte") return value <= operand;
    if (op === "gt") return value > operand;
    return value >= operand;
  }
  const { min, max, inclusive = true } = transform.range;
  if (!comparable(value, min) || !comparable(value, max)) return false;
  return inclusive
    ? value >= min && value <= max
    : value > min && value < max;
}

export function deriveFilteredRows(values, transform) {
  if (!Array.isArray(values)) {
    throw new TypeError("Filter source values must be an array.");
  }
  validateFilterTransform(transform);
  return values.filter(row =>
    isPlainObject(row) && matches(row[transform.field], transform)
  );
}
