import { action } from "../../core/action.js";
import { validateKeys } from "../../core/validation.js";

const OPTIONS = Object.freeze([
  "id",
  "data",
  "x",
  "y",
  "xFieldType",
  "coordinate",
  "xScale",
  "yScale",
  "capSize",
  "stroke",
  "strokeWidth",
  "strokeDash",
  "opacity"
]);

export const createErrorBarCap = action(
  {
    op: "createErrorBarCap",
    description: "Create one fixed-pixel error-bar cap."
  },
  function (args = {}) {
    validateKeys(args, OPTIONS, "createErrorBarCap");
    return this
      .createRuleMark({ id: args.id, data: args.data })
      .encodeX({
        target: args.id,
        field: args.x,
        fieldType: args.xFieldType,
        coordinate: args.coordinate,
        scale: { id: args.xScale }
      })
      .encodeY({
        target: args.id,
        field: args.y,
        fieldType: "quantitative",
        coordinate: args.coordinate,
        scale: { id: args.yScale }
      })
      .encodeStroke({ target: args.id, value: args.stroke })
      .encodeStrokeWidth({ target: args.id, value: args.strokeWidth })
      .encodeStrokeDash({ target: args.id, value: args.strokeDash })
      .encodeOpacity({ target: args.id, value: args.opacity })
      .materializeRuleSpan({
        id: args.id,
        orientation: "horizontal",
        size: args.capSize
      });
  }
);
