import { validateUserId } from "../../core/identifiers.js";
import { isPlainObject } from "../../core/immutable.js";
import { validateKeys } from "../../core/validation.js";
import {
  validateColorRange,
  validateLinearScaleType,
  validateOrdinalDomain,
  validateOrdinalScaleType,
  validateScaleDomain,
  validateScaleRange,
  validateShapeRange,
  validateSizeRange,
  validateStrokeDashRange,
  validateTimeScaleType
} from "../../grammar/scales.js";
import { findSemanticScale } from "../../selectors/scales.js";

const BASE_OPTIONS = Object.freeze(["id", "type", "domain", "range"]);
const POSITION_OPTIONS = Object.freeze([...BASE_OPTIONS, "nice", "zero"]);
const COLOR_OPTIONS = Object.freeze([...BASE_OPTIONS, "palette"]);

function optionsObject(options) {
  if (!isPlainObject(options)) {
    throw new TypeError("Encoding scale must be a plain object.");
  }
  return options;
}

export function resolvePositionScaleDefinition(
  program,
  channel,
  fieldType,
  options,
  defaults = {}
) {
  optionsObject(options);
  validateKeys(options, POSITION_OPTIONS, "scale");
  const id = validateUserId(options.id ?? channel, "Scale id");
  const existing = findSemanticScale(program, id);
  const expectedType = fieldType === "temporal"
    ? "time"
    : fieldType === "ordinal" ? "ordinal" : "linear";
  const type = options.type ?? existing?.type ?? expectedType;
  if (fieldType === "temporal") validateTimeScaleType(type);
  else if (fieldType === "ordinal") validateOrdinalScaleType(type);
  else validateLinearScaleType(type);
  if (options.nice !== undefined && typeof options.nice !== "boolean") {
    throw new TypeError("Scale nice must be a boolean.");
  }
  if (options.zero !== undefined && typeof options.zero !== "boolean") {
    throw new TypeError("Scale zero must be a boolean.");
  }
  if (type !== "linear" && options.zero !== undefined) {
    throw new Error(`Scale type "${type}" does not support zero.`);
  }
  if (type === "ordinal" && options.nice !== undefined) {
    throw new Error('Scale type "ordinal" does not support nice.');
  }
  const scale = {
    id,
    type,
    domain: fieldType === "ordinal"
      ? validateOrdinalDomain(options.domain ?? existing?.domain ?? "auto")
      : validateScaleDomain(options.domain ?? existing?.domain ?? "auto"),
    range: validateScaleRange(options.range ?? existing?.range ?? "auto")
  };
  const nice = options.nice ?? existing?.nice ?? defaults.nice;
  const zero = options.zero ?? existing?.zero ?? defaults.zero;
  if (nice !== undefined) scale.nice = nice;
  if (zero !== undefined) scale.zero = zero;
  return scale;
}

export function resolveColorScaleDefinition(program, options) {
  optionsObject(options);
  validateKeys(options, COLOR_OPTIONS, "scale");
  if (options.palette !== undefined && options.range !== undefined) {
    throw new Error("Color scale cannot specify both palette and range.");
  }
  const id = validateUserId(options.id ?? "color", "Scale id");
  const existing = findSemanticScale(program, id);
  const range = options.palette === undefined
    ? options.range
    : { palette: options.palette };
  return {
    id,
    type: validateOrdinalScaleType(options.type ?? existing?.type ?? "ordinal"),
    domain: validateOrdinalDomain(options.domain ?? existing?.domain ?? "auto"),
    range: validateColorRange(range ?? existing?.range ?? "auto")
  };
}

export function resolveStrokeDashScaleDefinition(program, options) {
  optionsObject(options);
  validateKeys(options, BASE_OPTIONS, "scale");
  const id = validateUserId(options.id ?? "strokeDash", "Scale id");
  const existing = findSemanticScale(program, id);
  return {
    id,
    type: validateOrdinalScaleType(options.type ?? existing?.type ?? "ordinal"),
    domain: validateOrdinalDomain(options.domain ?? existing?.domain ?? "auto"),
    range: validateStrokeDashRange(options.range ?? existing?.range ?? "auto")
  };
}

export function resolveAppearanceScaleDefinition(program, channel, options) {
  optionsObject(options);
  validateKeys(options, BASE_OPTIONS, "scale");
  const id = validateUserId(options.id ?? channel, "Scale id");
  const existing = findSemanticScale(program, id);
  const shape = channel === "shape";
  return {
    id,
    type: shape
      ? validateOrdinalScaleType(options.type ?? existing?.type ?? "ordinal")
      : validateLinearScaleType(options.type ?? existing?.type ?? "linear"),
    domain: shape
      ? validateOrdinalDomain(options.domain ?? existing?.domain ?? "auto")
      : validateScaleDomain(options.domain ?? existing?.domain ?? "auto"),
    range: shape
      ? validateShapeRange(options.range ?? existing?.range ?? "auto")
      : validateSizeRange(options.range ?? existing?.range ?? "auto")
  };
}

export function resolveOffsetScaleDefinition(program, options) {
  optionsObject(options);
  validateKeys(options, BASE_OPTIONS, "scale");
  const id = validateUserId(options.id ?? "xOffset", "Scale id");
  const existing = findSemanticScale(program, id);
  return {
    id,
    type: validateOrdinalScaleType(options.type ?? existing?.type ?? "ordinal"),
    domain: validateOrdinalDomain(options.domain ?? existing?.domain ?? "auto"),
    range: validateScaleRange(options.range ?? existing?.range ?? "auto")
  };
}
