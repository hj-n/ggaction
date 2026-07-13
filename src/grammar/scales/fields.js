import { cloneAndFreeze } from "../../core/immutable.js";

export function isNominalValue(value) {
  return (
    typeof value === "string" ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  );
}

export function validateFieldType(fieldType) {
  if (!["quantitative", "ordinal", "temporal"].includes(fieldType)) {
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

export function validateSemanticFieldType(fieldType) {
  if (!["quantitative", "nominal", "ordinal", "temporal"].includes(fieldType)) {
    throw new Error(`Unsupported semantic field type "${fieldType}".`);
  }
  return fieldType;
}

function validateField(field) {
  if (typeof field !== "string" || field.length === 0) {
    throw new TypeError("Encoding field must be a non-empty string.");
  }
}

export function readQuantitativeField(rows, field) {
  validateField(field);
  return cloneAndFreeze(rows.map((row, index) => {
    if (!Object.hasOwn(row, field) || !Number.isFinite(row[field])) {
      throw new TypeError(
        `Field "${field}" must contain a finite number at row ${index}.`
      );
    }
    return row[field];
  }));
}

function normalizeTemporalValue(value, field, index) {
  const timestamp = typeof value === "string" ? Date.parse(value) : value;
  if (!Number.isFinite(timestamp)) {
    throw new TypeError(
      `Field "${field}" must contain a temporal string or finite timestamp at row ${index}.`
    );
  }
  return timestamp;
}

export function readTemporalField(rows, field) {
  validateField(field);
  return cloneAndFreeze(rows.map((row, index) => {
    if (!Object.hasOwn(row, field)) {
      throw new TypeError(
        `Field "${field}" must contain a temporal string or finite timestamp at row ${index}.`
      );
    }
    return normalizeTemporalValue(row[field], field, index);
  }));
}

export function readNominalField(rows, field) {
  validateField(field);
  return cloneAndFreeze(rows.map((row, index) => {
    if (!Object.hasOwn(row, field) || !isNominalValue(row[field])) {
      throw new TypeError(
        `Field "${field}" must contain a nominal value at row ${index}.`
      );
    }
    return row[field];
  }));
}
