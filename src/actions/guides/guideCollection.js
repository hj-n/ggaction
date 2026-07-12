import { action } from "../../core/action.js";
import { isPlainObject } from "../../core/immutable.js";

const OPTIONS = Object.freeze(["axes", "legend"]);

function validateGuideOption(value, label) {
  if (value !== undefined && value !== false && !isPlainObject(value)) {
    throw new TypeError(`${label} must be false or a plain object.`);
  }
}

function validateOptions(args) {
  if (!isPlainObject(args)) {
    throw new TypeError("createGuides options must be a plain object.");
  }
  for (const key of Object.keys(args)) {
    if (!OPTIONS.includes(key)) {
      throw new Error(`Unknown createGuides option "${key}".`);
    }
  }
  validateGuideOption(args.axes, "createGuides axes");
  validateGuideOption(args.legend, "createGuides legend");
}

function hasCartesianEncoding(program) {
  return program.semanticSpec.layers.some(
    layer => layer.encoding?.x !== undefined || layer.encoding?.y !== undefined
  );
}

function hasLineSeriesEncoding(program) {
  return program.semanticSpec.layers.some(
    layer =>
      layer.mark?.type === "line" &&
      ["color", "strokeDash"].some(
        channel => layer.encoding?.[channel]?.scale !== undefined
      )
  );
}

function selectOption(explicit, applicable) {
  if (explicit === false) return undefined;
  if (explicit !== undefined) return explicit;
  return applicable ? {} : undefined;
}

const createGuides = action(
  {
    op: "createGuides",
    description: "Create the applicable axes and line-series legend."
  },
  function (args = {}) {
    validateOptions(args);
    const axes = selectOption(args.axes, hasCartesianEncoding(this));
    const legend = selectOption(args.legend, hasLineSeriesEncoding(this));

    if (axes === undefined && legend === undefined) {
      throw new Error("createGuides requires at least one selected guide.");
    }

    let next = this;
    if (axes !== undefined) next = next.createAxes(axes);
    if (legend !== undefined) next = next.createLegend(legend);
    return next;
  }
);

export function registerGuideCollectionActions(ProgramClass) {
  ProgramClass.prototype.createGuides = createGuides;
}
