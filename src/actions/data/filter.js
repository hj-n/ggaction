import { action } from "../../core/action.js";
import { validateUserId } from "../../core/identifiers.js";
import { validateKeys } from "../../core/validation.js";
import {
  deriveFilteredRows,
  normalizeFilterTransform
} from "../../grammar/filter.js";
import { MATERIALIZE_OPTIONS, requireDerivedDataset } from "./shared.js";

const OPTIONS = Object.freeze([
  "id", "source", "field", "oneOf", "predicate", "range"
]);

export const materializeFilteredData = action(
  { op: "materializeFilteredData", description: "Materialize one filtered derived dataset." },
  function (args = {}) {
    validateKeys(args, MATERIALIZE_OPTIONS, "materializeFilteredData");
    const { id, source, transform } = requireDerivedDataset(
      this,
      args.id,
      "filter"
    );
    return this.editSemantic({
      property: `dataset[${id}].values`,
      value: deriveFilteredRows(source.values, transform)
    });
  }
);

export const filterData = action(
  { op: "filterData", description: "Create a named dataset from one field filter." },
  function (args = {}) {
    validateKeys(args, OPTIONS, "filterData");
    const id = validateUserId(args.id, "Filtered dataset id");
    const source = validateUserId(
      args.source ?? this.context.currentData,
      "Source dataset id"
    );
    const transform = normalizeFilterTransform(args);
    return this
      .createDerivedData({
        id,
        source,
        transform: [transform]
      })
      .materializeFilteredData({ id });
  }
);
