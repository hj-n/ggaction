import { action } from "../../../core/action.js";
import { validateUserId } from "../../../core/identifiers.js";
import {
  validateNonEmptyString,
  validateNonNegativeFinite,
  validateUnitInterval
} from "../../../core/validation.js";
import { validatePointShape } from "../../../grammar/pointShapes.js";
import { findLayer } from "../../../selectors/layers.js";
import { rematerializeExistingLegend } from "../../encodings/shared.js";
import { validateMarkOptions } from "../shared.js";

const OPTIONS = Object.freeze([
  "target", "shape", "fill", "opacity", "stroke", "strokeWidth"
]);

export const editPointMark = action(
  {
    op: "editPointMark",
    description: "Edit constant point-mark appearance."
  },
  function (args = {}) {
    validateMarkOptions(args, OPTIONS, "editPointMark");
    const editable = ["shape", "fill", "opacity", "stroke", "strokeWidth"];
    if (!editable.some(property => Object.hasOwn(args, property))) {
      throw new Error(
        "editPointMark requires shape, fill, opacity, stroke, or strokeWidth."
      );
    }
    const candidates = this.semanticSpec.layers.filter(
      layer => layer.mark?.type === "point"
    );
    const current = findLayer(this, this.context.currentMark);
    const requested = args.target ??
      (current?.mark?.type === "point" ? current.id : undefined);
    const inferred = requested ?? (candidates.length === 1
      ? candidates[0].id
      : undefined);
    const id = validateUserId(inferred, "Point mark id");
    const layer = findLayer(this, id);
    if (layer?.mark?.type !== "point") {
      throw new Error(`Unknown point mark "${id}".`);
    }
    if (Object.hasOwn(args, "shape") && layer.encoding?.shape !== undefined) {
      throw new Error(
        "editPointMark shape cannot be combined with a shape encoding."
      );
    }
    if (Object.hasOwn(args, "fill") && layer.encoding?.color !== undefined) {
      throw new Error(
        "editPointMark fill cannot be combined with a color encoding."
      );
    }
    const config = { ...this.markConfigs[id] };
    if (Object.hasOwn(args, "shape")) {
      config.shape = validatePointShape(args.shape);
    }
    if (Object.hasOwn(args, "fill")) {
      config.fill = validateNonEmptyString(args.fill, "Point fill");
    }
    if (Object.hasOwn(args, "opacity")) {
      config.opacity = validateUnitInterval(args.opacity, "Point opacity");
    }
    if (Object.hasOwn(args, "stroke")) {
      config.stroke = validateNonEmptyString(args.stroke, "Point stroke");
      config.strokeWidth ??= 1;
    }
    if (Object.hasOwn(args, "strokeWidth")) {
      if (config.stroke === undefined) {
        throw new Error("Point strokeWidth requires an active stroke.");
      }
      config.strokeWidth = validateNonNegativeFinite(
        args.strokeWidth,
        "Point strokeWidth"
      );
    }
    const next = this
      ._withMarkConfig(id, config)
      .rematerializePointMark({ id });
    const legend = next.guideConfigs.legend?.series;
    return legend?.target === id && legend.channels.includes("shape")
      ? rematerializeExistingLegend(next)
      : next;
  }
);
