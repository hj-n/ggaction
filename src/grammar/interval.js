import { isPlainObject } from "../core/immutable.js";

const CENTER_VALUES = Object.freeze(["mean", "median"]);
const EXTENT_VALUES = Object.freeze(["stderr", "stdev", "ci", "iqr"]);
const TRANSFORM_KEYS = Object.freeze([
  "type",
  "field",
  "groupBy",
  "center",
  "extent",
  "level",
  "as"
]);
const OUTPUT_KEYS = Object.freeze(["center", "lower", "upper"]);

function nonEmptyString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
}

function validateGrouping(groupBy) {
  if (
    !Array.isArray(groupBy) ||
    groupBy.length === 0 ||
    !groupBy.every(field => typeof field === "string" && field.length > 0) ||
    new Set(groupBy).size !== groupBy.length
  ) {
    throw new TypeError(
      "Interval groupBy must contain unique non-empty field names."
    );
  }
}

function validateOutputs(as, occupied) {
  if (!isPlainObject(as)) {
    throw new TypeError("Interval as must be a plain object.");
  }
  const keys = Object.keys(as);
  if (
    keys.length !== OUTPUT_KEYS.length ||
    !OUTPUT_KEYS.every(key => Object.hasOwn(as, key))
  ) {
    throw new Error("Interval as requires exactly center, lower, and upper.");
  }
  const values = OUTPUT_KEYS.map(key => as[key]);
  values.forEach((value, index) => {
    nonEmptyString(value, `Interval as.${OUTPUT_KEYS[index]}`);
  });
  if (new Set(values).size !== values.length) {
    throw new Error("Interval output fields must be distinct.");
  }
  if (values.some(value => occupied.has(value))) {
    throw new Error("Interval output fields must not collide with input fields.");
  }
}

export function validateIntervalTransform(transform) {
  const unknown = Object.keys(transform).find(
    key => !TRANSFORM_KEYS.includes(key)
  );
  if (unknown !== undefined) {
    throw new Error(`Unknown interval transform property "${unknown}".`);
  }
  if (transform.type !== "interval") {
    throw new Error(`Unsupported interval transform "${transform.type}".`);
  }
  nonEmptyString(transform.field, "Interval field");
  validateGrouping(transform.groupBy);
  if (!CENTER_VALUES.includes(transform.center)) {
    throw new Error(`Unsupported interval center "${transform.center}".`);
  }
  if (!EXTENT_VALUES.includes(transform.extent)) {
    throw new Error(`Unsupported interval extent "${transform.extent}".`);
  }
  if (
    (transform.center === "median") !== (transform.extent === "iqr")
  ) {
    throw new Error("Median intervals require iqr, and iqr requires median.");
  }
  if (transform.extent === "ci") {
    if (
      !Number.isFinite(transform.level) ||
      transform.level <= 0 ||
      transform.level >= 1
    ) {
      throw new RangeError("Interval CI level must be between 0 and 1.");
    }
  } else if (transform.level !== undefined) {
    throw new Error("Interval level is supported only for ci extent.");
  }
  validateOutputs(
    transform.as,
    new Set([transform.field, ...transform.groupBy])
  );
}
