import { action } from "../../core/action.js";
import { validateUserId } from "../../core/identifiers.js";
import { validateKeys } from "../../core/validation.js";
import { deriveKernelDensity } from "../../grammar/density.js";
import { MATERIALIZE_OPTIONS, requireDerivedDataset } from "./shared.js";

const OPTIONS = Object.freeze([
  "id", "source", "field", "groupBy", "bandwidth", "extent", "steps",
  "kernel", "normalization", "as"
]);
const CATEGORICAL_OPTIONS = Object.freeze([...OPTIONS, "placement"]);

function densityTransform(args, placement) {
  return {
    type: "density",
    field: args.field,
    ...(args.groupBy === undefined ? {} : { groupBy: args.groupBy }),
    bandwidth: args.bandwidth ?? "auto",
    extent: args.extent ?? "auto",
    steps: args.steps ?? 100,
    kernel: args.kernel ?? "gaussian",
    normalization: args.normalization ?? "unit",
    as: args.as ?? [`${args.field}_value`, `${args.field}_density`],
    resolve: "shared",
    ...(placement === undefined ? {} : { placement })
  };
}

export const materializeDensityData = action(
  { op: "materializeDensityData", description: "Materialize one grouped kernel-density dataset." },
  function (args = {}) {
    validateKeys(args, MATERIALIZE_OPTIONS, "materializeDensityData");
    const { id, source, transform } = requireDerivedDataset(
      this,
      args.id,
      "density"
    );
    const result = deriveKernelDensity(source.values, transform);
    return this
      .editSemantic({
        property: `dataset[${id}].transform`,
        value: [{
          ...transform,
          resolved: {
            bandwidth: result.bandwidth,
            extent: result.extent,
            ...(result.splitDomain === undefined
              ? {}
              : { splitDomain: result.splitDomain })
          }
        }]
      })
      .editSemantic({
        property: `dataset[${id}].values`,
        value: result.values
      });
  }
);

export const createDensityData = action(
  { op: "createDensityData", description: "Create grouped kernel-density values." },
  function (args = {}) {
    validateKeys(args, OPTIONS, "createDensityData");
    const id = validateUserId(args.id, "Density dataset id");
    const source = validateUserId(
      args.source ?? this.context.currentData,
      "Source dataset id"
    );
    if (typeof args.field !== "string" || args.field.length === 0) {
      throw new TypeError("createDensityData requires a non-empty field string.");
    }
    const transform = densityTransform(args);
    return this
      .createDerivedData({ id, source, transform: [transform] })
      .materializeDensityData({ id });
  }
);

export const createCategoricalDensityData = action(
  {
    op: "createCategoricalDensityData",
    description: "Create category-placed kernel-density values."
  },
  function (args = {}) {
    validateKeys(args, CATEGORICAL_OPTIONS, "createCategoricalDensityData");
    const id = validateUserId(args.id, "Density dataset id");
    const source = validateUserId(
      args.source ?? this.context.currentData,
      "Source dataset id"
    );
    if (typeof args.field !== "string" || args.field.length === 0) {
      throw new TypeError(
        "createCategoricalDensityData requires a non-empty field string."
      );
    }
    if (args.placement?.type !== "category") {
      throw new Error(
        "createCategoricalDensityData requires normalized category placement."
      );
    }
    return this
      .createDerivedData({
        id,
        source,
        transform: [densityTransform(args, args.placement)]
      })
      .materializeDensityData({ id });
  }
);
