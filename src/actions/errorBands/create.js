import { action } from "../../core/action.js";
import { validateKeys } from "../../core/validation.js";
import { resolveErrorBand } from "./resolve.js";

const OPTIONS = Object.freeze([
  "id",
  "target",
  "data",
  "x",
  "y",
  "groupBy",
  "coordinate",
  "fill",
  "opacity"
]);

function positionArgs(resolved) {
  return {
    target: resolved.id,
    field: resolved.position.field,
    fieldType: resolved.position.fieldType,
    coordinate: resolved.coordinate,
    scale: resolved.position.scale
  };
}

function rangeArgs(resolved) {
  return {
    target: resolved.id,
    lower: resolved.fields.lower,
    upper: resolved.fields.upper,
    fieldType: "quantitative",
    coordinate: resolved.coordinate,
    scale: resolved.interval.scale
  };
}

export const createErrorBand = action(
  {
    op: "createErrorBand",
    description: "Create a statistical or explicit vertical interval band."
  },
  function (args = {}) {
    validateKeys(args, OPTIONS, "createErrorBand");
    const resolved = resolveErrorBand(this, args);
    if (resolved.orientation !== "vertical") {
      throw new Error(
        "createErrorBand horizontal intervals require encodeXRange, which is not implemented yet."
      );
    }
    let next = this;

    if (resolved.interval.mode === "statistical") {
      next = next.createIntervalData({
        id: resolved.dataId,
        source: resolved.source,
        field: resolved.interval.field,
        groupBy: resolved.groupBy,
        center: resolved.interval.center,
        extent: resolved.interval.extent,
        level: resolved.interval.level,
        as: resolved.fields
      });
    }

    next = next
      .createAreaMark({
        id: resolved.id,
        data: resolved.dataId,
        ...(args.fill === undefined ? {} : { fill: args.fill }),
        ...(args.opacity === undefined ? {} : { opacity: args.opacity })
      })
      .encodeX(positionArgs(resolved))
      .encodeYRange(rangeArgs(resolved));

    if (resolved.interval.mode === "explicit") {
      next = next.editSemantic({
        property: `layer[${resolved.id}].encoding.y.title`,
        value: resolved.interval.title
      });
    }
    if (resolved.groupField !== undefined) {
      next = next.encodeGroup({
        target: resolved.id,
        field: resolved.groupField,
        fieldType: "nominal"
      });
    }
    return next;
  }
);
