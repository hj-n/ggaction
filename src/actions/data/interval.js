import { action } from "../../core/action.js";
import { validateUserId } from "../../core/identifiers.js";
import { validateKeys } from "../../core/validation.js";
import {
  deriveInterval,
  normalizeIntervalTransform
} from "../../grammar/interval.js";
import { MATERIALIZE_OPTIONS, requireDerivedDataset } from "./shared.js";

const OPTIONS = Object.freeze([
  "id",
  "source",
  "field",
  "groupBy",
  "center",
  "extent",
  "level",
  "as"
]);

export const materializeIntervalData = action(
  {
    op: "materializeIntervalData",
    description: "Materialize one grouped interval-summary dataset."
  },
  function (args = {}) {
    validateKeys(args, MATERIALIZE_OPTIONS, "materializeIntervalData");
    const { id, source, transform } = requireDerivedDataset(
      this,
      args.id,
      "interval"
    );
    return this.editSemantic({
      property: `dataset[${id}].values`,
      value: deriveInterval(source.values, transform)
    });
  }
);

export const createIntervalData = action(
  {
    op: "createIntervalData",
    description: "Create immutable grouped interval-summary values."
  },
  function (args = {}) {
    validateKeys(args, OPTIONS, "createIntervalData");
    const id = validateUserId(args.id, "Interval dataset id");
    const source = validateUserId(
      args.source ?? this.context.currentData,
      "Source dataset id"
    );
    const as = args.as ?? {
      center: `__${id}_center`,
      lower: `__${id}_lower`,
      upper: `__${id}_upper`
    };
    const transform = normalizeIntervalTransform({
      field: args.field,
      groupBy: args.groupBy,
      center: args.center,
      extent: args.extent,
      level: args.level,
      as
    });
    return this
      .createDerivedData({ id, source, transform: [transform] })
      .materializeIntervalData({ id });
  }
);
