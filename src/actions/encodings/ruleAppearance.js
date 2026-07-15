import { action } from "../../core/action.js";
import { resolveTarget, validateOptions } from "./shared.js";

const OPTIONS = Object.freeze(["target", "value"]);

function validateStroke(value) {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError("encodeStroke requires a non-empty string value.");
  }
  return value;
}

function validateStrokeWidth(value) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(
      "encodeStrokeWidth requires a non-negative finite value."
    );
  }
  return value;
}

const encodeStroke = action(
  {
    op: "encodeStroke",
    description: "Set a constant graphical stroke on a rule mark."
  },
  function (args = {}) {
    validateOptions(args, OPTIONS, "encodeStroke");
    const { id } = resolveTarget(this, args.target, ["rule"], "rule mark");
    return this
      ._withMarkConfig(id, {
        ...this.markConfigs[id],
        stroke: validateStroke(args.value)
      })
      .rematerializeRuleMark({ id });
  }
);

const encodeStrokeWidth = action(
  {
    op: "encodeStrokeWidth",
    description: "Set a constant graphical stroke width on a rule mark."
  },
  function (args = {}) {
    validateOptions(args, OPTIONS, "encodeStrokeWidth");
    const { id } = resolveTarget(this, args.target, ["rule"], "rule mark");
    return this
      ._withMarkConfig(id, {
        ...this.markConfigs[id],
        strokeWidth: validateStrokeWidth(args.value)
      })
      .rematerializeRuleMark({ id });
  }
);

export function registerRuleAppearanceEncodingActions(ProgramClass) {
  ProgramClass.prototype.encodeStroke = encodeStroke;
  ProgramClass.prototype.encodeStrokeWidth = encodeStrokeWidth;
}
