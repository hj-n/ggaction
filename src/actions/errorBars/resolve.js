import { isPlainObject } from "../../core/immutable.js";
import {
  resolveOptionalUserId,
  validateUserId
} from "../../core/identifiers.js";
import { findDataset } from "../../selectors/datasets.js";
import { hasLayer, resolveEligibleLayer } from "../../selectors/layers.js";

const POSITION_TYPES = Object.freeze(["nominal", "ordinal", "temporal"]);
const X_OPTIONS = Object.freeze(["field", "fieldType", "scale"]);
const Y_OPTIONS = Object.freeze([
  "field", "center", "extent", "level", "scale", "lower", "upper"
]);

function requireObject(value, label) {
  if (!isPlainObject(value)) {
    throw new TypeError(`${label} must be a plain object.`);
  }
  return value;
}

function validateChannelKeys(value, supported, label) {
  const unknown = Object.keys(value).find(key => !supported.includes(key));
  if (unknown !== undefined) {
    throw new Error(`Unknown ${label} option "${unknown}".`);
  }
}

function requireField(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  return value;
}

function hasCompleteFieldPositions(layer) {
  const x = layer.encoding?.x;
  const y = layer.encoding?.y;
  return (
    typeof layer.data === "string" &&
    typeof layer.coordinate === "string" &&
    typeof x?.field === "string" &&
    typeof y?.field === "string" &&
    typeof x.scale === "string" &&
    typeof y.scale === "string" &&
    [...POSITION_TYPES, "quantitative"].includes(x.fieldType) &&
    [...POSITION_TYPES, "quantitative"].includes(y.fieldType)
  );
}

function resolveSourceLayer(program, args) {
  if (args.target === undefined && args.x !== undefined && args.y !== undefined) {
    return undefined;
  }
  const target = args.target === undefined
    ? undefined
    : validateUserId(args.target, "Error-bar source layer id");
  return resolveEligibleLayer(program, {
    target,
    predicate: hasCompleteFieldPositions,
    label: "createErrorBar"
  });
}

function resolveDataset(program, args, sourceLayer) {
  const requested = args.data ?? sourceLayer?.data ?? program.context.currentData;
  if (requested !== undefined) {
    const id = validateUserId(requested, "Error-bar dataset id");
    if (findDataset(program, id) === undefined) {
      throw new Error(`Unknown error-bar dataset "${id}".`);
    }
    return id;
  }
  if (program.semanticSpec.datasets.length === 1) {
    return program.semanticSpec.datasets[0].id;
  }
  throw new Error("createErrorBar requires data or one uniquely inferable dataset.");
}

function scaleOptions(value, inferredId, defaults = {}) {
  if (value !== undefined && !isPlainObject(value)) {
    throw new TypeError("Error-bar scale must be a plain object.");
  }
  return {
    ...defaults,
    ...(value ?? {}),
    ...(value?.id === undefined && inferredId !== undefined
      ? { id: inferredId }
      : {})
  };
}

function resolveX(args, sourceLayer) {
  const explicit = args.x === undefined
    ? undefined
    : requireObject(args.x, "createErrorBar x");
  if (explicit !== undefined) validateChannelKeys(explicit, X_OPTIONS, "createErrorBar x");
  const inferred = sourceLayer?.encoding.x;
  const field = requireField(
    explicit?.field ?? inferred?.field,
    "createErrorBar x field"
  );
  const fieldType = explicit?.fieldType ?? inferred?.fieldType ?? "nominal";
  if (!POSITION_TYPES.includes(fieldType)) {
    throw new Error(
      "Vertical createErrorBar requires a nominal, ordinal, or temporal x position."
    );
  }
  return {
    field,
    fieldType,
    scale: scaleOptions(explicit?.scale, inferred?.scale)
  };
}

function resolveY(args, sourceLayer) {
  const explicit = args.y === undefined
    ? undefined
    : requireObject(args.y, "createErrorBar y");
  if (explicit !== undefined) validateChannelKeys(explicit, Y_OPTIONS, "createErrorBar y");
  if (explicit?.lower !== undefined || explicit?.upper !== undefined) {
    throw new Error("Explicit error-bar intervals are not implemented yet.");
  }
  const inferred = sourceLayer?.encoding.y;
  if (inferred !== undefined && inferred.fieldType !== "quantitative") {
    throw new Error("Vertical createErrorBar requires a quantitative y interval.");
  }
  return {
    field: requireField(
      explicit?.field ?? inferred?.field,
      "createErrorBar y field"
    ),
    center: explicit?.center,
    extent: explicit?.extent,
    level: explicit?.level,
    scale: scaleOptions(
      explicit?.scale,
      inferred?.scale,
      inferred === undefined ? { nice: true, zero: false } : {}
    )
  };
}

function resolveGroupBy(args, sourceLayer, independentField) {
  const inferred = sourceLayer?.encoding?.group?.field;
  const requested = args.groupBy ?? inferred;
  if (requested === undefined || requested === independentField) return [independentField];
  return [independentField, requireField(requested, "createErrorBar groupBy")];
}

function resolveOwner(program, requested) {
  const defaultId = "errorBar";
  const defaultOccupied = hasLayer(program, defaultId) ||
    program.graphicSpec.objects[defaultId] !== undefined ||
    findDataset(program, `${defaultId}IntervalData`) !== undefined;
  return resolveOptionalUserId(requested, {
    defaultId,
    label: "Error-bar id",
    operation: "createErrorBar",
    ambiguous: defaultOccupied
  });
}

export function resolveErrorBar(program, args) {
  const sourceLayer = resolveSourceLayer(program, args);
  const x = resolveX(args, sourceLayer);
  const y = resolveY(args, sourceLayer);
  const id = resolveOwner(program, args.id);
  return {
    id,
    sourceLayer,
    source: resolveDataset(program, args, sourceLayer),
    coordinate: validateUserId(
      args.coordinate ?? sourceLayer?.coordinate ?? "main",
      "Error-bar coordinate id"
    ),
    x,
    y,
    groupBy: resolveGroupBy(args, sourceLayer, x.field),
    dataId: `${id}IntervalData`,
    lowerCapId: `${id}LowerCap`,
    upperCapId: `${id}UpperCap`,
    fields: {
      center: `__${id}_center`,
      lower: `__${id}_lower`,
      upper: `__${id}_upper`
    }
  };
}
