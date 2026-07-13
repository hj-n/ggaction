import { action } from "../../core/action.js";
import { validateUserId } from "../../core/identifiers.js";
import { isPlainObject } from "../../core/immutable.js";
import { validateOptions } from "./shared.js";

const OPTIONS = Object.freeze([
  "field", "target", "source", "groupBy", "bandwidth", "extent", "steps",
  "as", "densityChannel", "coordinate", "valueScale", "densityScale"
]);

function findArea(program, requested) {
  const areas = program.semanticSpec.layers.filter(layer => layer.mark?.type === "area");
  if (requested !== undefined) {
    const id = validateUserId(requested, "Density target id");
    const selected = areas.find(layer => layer.id === id);
    if (selected === undefined) throw new Error(`Unknown density area target "${id}".`);
    return selected;
  }
  const current = areas.find(layer => layer.id === program.context.currentMark);
  if (current !== undefined) return current;
  if (areas.length === 1) return areas[0];
  if (areas.length === 0) {
    throw new Error("encodeDensity requires an eligible area mark.");
  }
  throw new Error("encodeDensity target is ambiguous; provide target.");
}

function requireField(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  return value;
}

function scaleOptions(value, defaults, label) {
  if (value !== undefined && !isPlainObject(value)) {
    throw new TypeError(`${label} must be a plain object.`);
  }
  return { ...defaults, ...(value ?? {}) };
}

const encodeDensity = action(
  {
    op: "encodeDensity",
    description: "Derive and encode a baseline-oriented kernel density area."
  },
  function (args = {}) {
    validateOptions(args, OPTIONS, "encodeDensity");
    const layer = findArea(this, args.target);
    const field = requireField(args.field, "Density field");
    const groupBy = args.groupBy === undefined
      ? undefined
      : requireField(args.groupBy, "Density groupBy");
    const source = validateUserId(
      args.source ?? layer.data,
      "Density source dataset id"
    );
    if (!this.semanticSpec.datasets.some(dataset => dataset.id === source)) {
      throw new Error(`Unknown density source dataset "${source}".`);
    }
    if (["x", "y", "y2", "group"].some(channel =>
      layer.encoding?.[channel] !== undefined
    )) {
      throw new Error(
        `Density area target "${layer.id}" already has positional or group encodings.`
      );
    }
    const densityChannel = args.densityChannel ?? "y";
    if (!["x", "y"].includes(densityChannel)) {
      throw new Error(`Unsupported densityChannel "${densityChannel}".`);
    }
    const output = args.as ?? [`${field}_value`, `${field}_density`];
    if (!Array.isArray(output) || output.length !== 2) {
      throw new TypeError("Density as must contain value and density field names.");
    }
    const derivedId = `${layer.id}DensityData`;
    if (this.semanticSpec.datasets.some(dataset => dataset.id === derivedId)) {
      throw new Error(`Dataset "${derivedId}" already exists.`);
    }
    const valueScale = scaleOptions(
      args.valueScale,
      { nice: false, zero: false },
      "Density valueScale"
    );
    const densityScale = scaleOptions(
      args.densityScale,
      { nice: true, zero: true },
      "Density densityScale"
    );
    const xIsDensity = densityChannel === "x";
    const xField = output[xIsDensity ? 1 : 0];
    const yField = output[xIsDensity ? 0 : 1];
    const xScale = xIsDensity ? densityScale : valueScale;
    const yScale = xIsDensity ? valueScale : densityScale;

    let next = this
      .createDensityData({
        id: derivedId,
        source,
        field,
        ...(groupBy === undefined ? {} : { groupBy }),
        ...(args.bandwidth === undefined ? {} : { bandwidth: args.bandwidth }),
        ...(args.extent === undefined ? {} : { extent: args.extent }),
        ...(args.steps === undefined ? {} : { steps: args.steps }),
        ...(args.as === undefined ? {} : { as: args.as })
      })
      .editSemantic({
        property: `layer[${layer.id}].data`,
        value: derivedId
      })
      .encodeX({
        target: layer.id,
        field: xField,
        ...(args.coordinate === undefined ? {} : { coordinate: args.coordinate }),
        scale: xScale
      })
      .encodeY({
        target: layer.id,
        field: yField,
        ...(args.coordinate === undefined ? {} : { coordinate: args.coordinate }),
        scale: yScale
      });
    if (groupBy !== undefined) {
      next = next.encodeGroup({ target: layer.id, field: groupBy });
    }
    return next.rematerializeAreaMark({ id: layer.id });
  }
);

export function registerDensityEncodingAction(ProgramClass) {
  ProgramClass.prototype.encodeDensity = encodeDensity;
}
