import { action } from "../../core/action.js";
import { validateUserId } from "../../core/identifiers.js";
import { validateKeys } from "../../core/validation.js";
import {
  deriveHorizon,
  validateHorizonTransform
} from "../../grammar/horizon.js";
import { MATERIALIZE_OPTIONS, requireDerivedDataset } from "./shared.js";

const OPTIONS = Object.freeze([
  "id", "source", "x", "y", "groupBy", "bands", "baseline", "extent",
  "resolve", "missing", "overflow", "palette", "as"
]);

function requestedTransform(args) {
  return validateHorizonTransform({
    type: "horizon",
    x: args.x,
    y: args.y,
    ...(args.groupBy === undefined ? {} : { groupBy: args.groupBy }),
    bands: args.bands ?? 3,
    baseline: args.baseline ?? 0,
    extent: args.extent ?? "auto",
    resolve: args.resolve ?? "shared",
    missing: args.missing ?? "break",
    overflow: args.overflow ?? "clip",
    palette: args.palette ?? {},
    as: args.as
  });
}

export const materializeHorizonData = action(
  {
    op: "materializeHorizonData",
    description: "Materialize one immutable Horizon band dataset."
  },
  function (args = {}) {
    validateKeys(args, MATERIALIZE_OPTIONS, "materializeHorizonData");
    const { id, source, transform } = requireDerivedDataset(
      this,
      args.id,
      "horizon"
    );
    const result = deriveHorizon(source.values, transform);
    return this
      .editSemantic({
        property: `dataset[${id}].transform`,
        value: [{ ...result.transform, resolved: result.resolved }]
      })
      .editSemantic({
        property: `dataset[${id}].values`,
        value: result.values
      });
  }
);

export const createHorizonData = action(
  {
    op: "createHorizonData",
    description: "Create one immutable Horizon band dataset."
  },
  function (args = {}) {
    validateKeys(args, OPTIONS, "createHorizonData");
    const id = validateUserId(args.id, "Horizon dataset id");
    const source = validateUserId(args.source, "Horizon source dataset id");
    const transform = requestedTransform(args);
    return this
      .createDerivedData({ id, source, transform: [transform] })
      .materializeHorizonData({ id });
  }
);
