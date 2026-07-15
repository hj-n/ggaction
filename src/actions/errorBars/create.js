import { action } from "../../core/action.js";
import { validateKeys } from "../../core/validation.js";
import { findLayer } from "../../selectors/layers.js";
import { DEFAULT_COLORS } from "../../theme/defaults.js";
import { resolveErrorBar } from "./resolve.js";

const OPTIONS = Object.freeze([
  "id",
  "target",
  "data",
  "x",
  "y",
  "groupBy",
  "coordinate"
]);

function resolveAppearance() {
  return {
    capSize: 8,
    stroke: DEFAULT_COLORS.mark,
    strokeWidth: 2,
    strokeDash: "solid",
    opacity: 1
  };
}

export const createErrorBar = action(
  {
    op: "createErrorBar",
    description: "Create a vertical statistical interval with fixed caps."
  },
  function (args = {}) {
    validateKeys(args, OPTIONS, "createErrorBar");
    const resolved = resolveErrorBar(this, args);
    const appearance = resolveAppearance();
    let next = this
      .createIntervalData({
        id: resolved.dataId,
        source: resolved.source,
        field: resolved.y.field,
        groupBy: resolved.groupBy,
        center: resolved.y.center,
        extent: resolved.y.extent,
        level: resolved.y.level,
        as: resolved.fields
      })
      .createRuleMark({ id: resolved.id, data: resolved.dataId })
      .encodeX({
        target: resolved.id,
        field: resolved.x.field,
        fieldType: resolved.x.fieldType,
        coordinate: resolved.coordinate,
        scale: resolved.x.scale
      })
      .encodeY({
        target: resolved.id,
        field: resolved.fields.lower,
        fieldType: "quantitative",
        coordinate: resolved.coordinate,
        scale: resolved.y.scale
      })
      .encodeY2({
        target: resolved.id,
        field: resolved.fields.upper,
        fieldType: "quantitative"
      })
      .encodeStroke({ target: resolved.id, value: appearance.stroke })
      .encodeStrokeWidth({ target: resolved.id, value: appearance.strokeWidth })
      .encodeStrokeDash({ target: resolved.id, value: appearance.strokeDash })
      .encodeOpacity({ target: resolved.id, value: appearance.opacity });

    for (const [id, field] of [
      [resolved.lowerCapId, resolved.fields.lower],
      [resolved.upperCapId, resolved.fields.upper]
    ]) {
      const intervalLayer = findLayer(next, resolved.id);
      next = next.createErrorBarCap({
        id,
        data: resolved.dataId,
        x: resolved.x.field,
        y: field,
        xFieldType: resolved.x.fieldType,
        coordinate: resolved.coordinate,
        xScale: intervalLayer.encoding.x.scale,
        yScale: intervalLayer.encoding.y.scale,
        capSize: appearance.capSize,
        stroke: appearance.stroke,
        strokeWidth: appearance.strokeWidth,
        strokeDash: appearance.strokeDash,
        opacity: appearance.opacity
      });
    }
    return next;
  }
);
