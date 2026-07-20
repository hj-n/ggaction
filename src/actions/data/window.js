import { action } from "../../core/action.js";
import { validateUserId } from "../../core/identifiers.js";
import { validateKeys } from "../../core/validation.js";
import {
  deriveWindowRows,
  normalizeWindowTransform
} from "../../grammar/window.js";
import { MATERIALIZE_OPTIONS, requireDerivedDataset } from "./shared.js";

const OPTIONS = Object.freeze([
  "id", "source", "partitionBy", "sortBy", "operations"
]);

export const materializeWindowData = action(
  {
    op: "materializeWindowData",
    description: "Materialize one immutable window-derived dataset."
  },
  function (args = {}) {
    validateKeys(args, MATERIALIZE_OPTIONS, "materializeWindowData");
    const { id, source, transform } = requireDerivedDataset(
      this,
      args.id,
      "window"
    );
    return this.editSemantic({
      property: `dataset[${id}].values`,
      value: deriveWindowRows(source.values, transform)
    });
  }
);

export const createWindowData = action(
  {
    op: "createWindowData",
    description: "Create immutable partitioned window values."
  },
  function (args = {}) {
    validateKeys(args, OPTIONS, "createWindowData");
    const id = validateUserId(args.id, "Window dataset id");
    const source = validateUserId(
      args.source ?? this.context.currentData,
      "Source dataset id"
    );
    const transform = normalizeWindowTransform(args);
    return this
      .createDerivedData({ id, source, transform: [transform] })
      .materializeWindowData({ id });
  }
);
