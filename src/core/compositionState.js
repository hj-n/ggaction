import { isPlainObject } from "./immutable.js";
import { ownProgramState } from "./programState.js";
import {
  FACET_SCALE_CHANNELS,
  FACET_SCALE_RESOLUTIONS
} from "./vocabulary.js";

function validateFacetSpec(compositionSpec) {
  if (compositionSpec.direction !== undefined) {
    throw new Error("Facet compositionSpec does not use direction.");
  }
  if (
    !Number.isInteger(compositionSpec.columns) ||
    compositionSpec.columns <= 0 ||
    compositionSpec.columns > compositionSpec.children.length
  ) {
    throw new RangeError(
      "Facet compositionSpec.columns must be a positive integer no larger than its children."
    );
  }
  if (!isPlainObject(compositionSpec.facet)) {
    throw new TypeError("Facet compositionSpec.facet must be a plain object.");
  }
  const facetKeys = ["data", "field", "values", "scales", "guides"];
  const unknownFacet = Object.keys(compositionSpec.facet).find(
    key => !facetKeys.includes(key)
  );
  if (unknownFacet !== undefined) {
    throw new Error(`Unknown compositionSpec.facet property "${unknownFacet}".`);
  }
  for (const property of ["data", "field"]) {
    if (
      typeof compositionSpec.facet[property] !== "string" ||
      compositionSpec.facet[property].length === 0
    ) {
      throw new TypeError(`compositionSpec.facet.${property} must be a non-empty string.`);
    }
  }
  const values = compositionSpec.facet.values;
  if (
    !Array.isArray(values) ||
    values.length !== compositionSpec.children.length ||
    values.some(value => !(
      typeof value === "string" ||
      typeof value === "boolean" ||
      (typeof value === "number" && Number.isFinite(value))
    )) ||
    new Set(values).size !== values.length
  ) {
    throw new TypeError(
      "compositionSpec.facet.values must contain one unique scalar per child."
    );
  }
  const scales = compositionSpec.facet.scales;
  if (
    !isPlainObject(scales) ||
    Object.keys(scales).length !== FACET_SCALE_CHANNELS.length ||
    FACET_SCALE_CHANNELS.some(channel =>
      !FACET_SCALE_RESOLUTIONS.includes(scales[channel])
    ) ||
    Object.keys(scales).some(channel => !FACET_SCALE_CHANNELS.includes(channel))
  ) {
    throw new Error(
      "compositionSpec.facet.scales requires one shared or independent policy per supported channel."
    );
  }
  const guides = compositionSpec.facet.guides;
  if (
    !isPlainObject(guides) ||
    Object.keys(guides).some(key => !["axes", "legend"].includes(key)) ||
    !["each", "outer"].includes(guides.axes) ||
    ![false, "shared"].includes(guides.legend)
  ) {
    throw new Error(
      'compositionSpec.facet.guides requires axes "each" or "outer" and legend false or "shared".'
    );
  }
}

function validateCompositionChildren(compositionSpec, childIds, facet) {
  if (
    !Array.isArray(compositionSpec.children) ||
    compositionSpec.children.length < (facet ? 1 : 2) ||
    !compositionSpec.children.every(id => typeof id === "string" && id.length > 0)
  ) {
    throw new TypeError(
      facet
        ? "Facet compositionSpec.children requires at least one child ID."
        : "compositionSpec.children requires at least two child IDs."
    );
  }
  if (new Set(compositionSpec.children).size !== compositionSpec.children.length) {
    throw new Error("compositionSpec.children must not contain duplicate IDs.");
  }
  if (
    compositionSpec.children.length !== childIds.length ||
    compositionSpec.children.some(id => !childIds.includes(id))
  ) {
    throw new Error("compositionSpec.children must match ChartProgram children exactly.");
  }
}

function validateLayout(compositionSpec) {
  if (!Number.isFinite(compositionSpec.gap) || compositionSpec.gap < 0) {
    throw new RangeError("compositionSpec.gap must be a non-negative finite number.");
  }
  if (!["start", "center", "end"].includes(compositionSpec.align)) {
    throw new Error("compositionSpec.align must be start, center, or end.");
  }
  if (!isPlainObject(compositionSpec.padding)) {
    throw new TypeError("compositionSpec.padding must be a plain object.");
  }
  for (const side of ["top", "right", "bottom", "left"]) {
    if (!Number.isFinite(compositionSpec.padding[side]) || compositionSpec.padding[side] < 0) {
      throw new RangeError(
        `compositionSpec.padding.${side} must be a non-negative finite number.`
      );
    }
  }
  const paddingKeys = Object.keys(compositionSpec.padding);
  if (
    paddingKeys.length !== 4 ||
    paddingKeys.some(key => !["top", "right", "bottom", "left"].includes(key))
  ) {
    throw new Error("compositionSpec.padding must contain exactly four sides.");
  }
}

export function ownCompositionSpec(compositionSpec, children) {
  const childIds = Object.keys(children);
  if (compositionSpec === undefined) {
    if (childIds.length > 0) {
      throw new Error("ChartProgram children require a compositionSpec.");
    }
    return undefined;
  }
  if (!isPlainObject(compositionSpec)) {
    throw new TypeError("ChartProgram compositionSpec must be a plain object.");
  }
  const allowed = [
    "id", "type", "direction", "children", "columns", "gap", "align",
    "padding", "facet"
  ];
  const unknown = Object.keys(compositionSpec).find(key => !allowed.includes(key));
  if (unknown !== undefined) {
    throw new Error(`Unknown compositionSpec property "${unknown}".`);
  }
  if (typeof compositionSpec.id !== "string" || compositionSpec.id.length === 0) {
    throw new TypeError("compositionSpec.id must be a non-empty string.");
  }
  const facet = compositionSpec.type === "facet";
  if (compositionSpec.type !== undefined && !facet) {
    throw new Error(`Unknown compositionSpec type "${compositionSpec.type}".`);
  }
  if (!facet && !["horizontal", "vertical"].includes(compositionSpec.direction)) {
    throw new Error("compositionSpec.direction must be horizontal or vertical.");
  }
  validateCompositionChildren(compositionSpec, childIds, facet);
  if (facet) {
    validateFacetSpec(compositionSpec);
  } else if (
    compositionSpec.columns !== undefined ||
    compositionSpec.facet !== undefined
  ) {
    throw new Error("Concat compositionSpec does not accept facet properties.");
  }
  validateLayout(compositionSpec);
  return ownProgramState(compositionSpec);
}
