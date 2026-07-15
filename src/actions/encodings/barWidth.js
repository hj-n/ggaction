import { action } from "../../core/action.js";
import { resolveTarget, validateOptions } from "./shared.js";
import {
  BAR_GRAINS,
  resolveBarColorLayout,
  resolveBarGrain
} from "../../grammar/bars/policy.js";

const OPTIONS = Object.freeze(["band", "target"]);

const encodeBarWidth = action(
  {
    op: "encodeBarWidth",
    description: "Set aggregate bar width within each x band or xOffset slot."
  },
  function (args = {}) {
    validateOptions(args, OPTIONS, "encodeBarWidth");
    const band = args.band ?? 0.72;
    if (!Number.isFinite(band) || band <= 0 || band > 1) {
      throw new RangeError("Bar width band must be greater than 0 and at most 1.");
    }

    const { id: target, layer } = resolveTarget(
      this,
      args.target,
      ["bar"],
      "bar mark"
    );
    const layout = resolveBarColorLayout(layer);
    const grouped = layout === "group";
    if (
      resolveBarGrain(layer) !== BAR_GRAINS.aggregate ||
      layer.encoding?.color?.field === undefined ||
      (grouped && layer.encoding?.xOffset?.field !== layer.encoding.color.field)
    ) {
      throw new Error(
        grouped
          ? "encodeBarWidth requires complete grouped bar x, y, color, and xOffset encodings."
          : "encodeBarWidth requires complete aggregate bar x, y, and color encodings."
      );
    }

    return this
      ._withMarkConfig(target, {
        ...this.markConfigs[target],
        barWidth: { band }
      })
      .rematerializeBarMark({ id: target });
  }
);

export function registerBarWidthEncodingAction(ProgramClass) {
  ProgramClass.prototype.encodeBarWidth = encodeBarWidth;
}
