import { action } from "../../core/action.js";
import { isPlainObject } from "../../core/immutable.js";
import { validateUserId } from "../../core/identifiers.js";
import { validateKeys } from "../../core/validation.js";
import { hasDataset } from "../../selectors/datasets.js";
import { requireLayer } from "../../selectors/layers.js";

const REPLAY_OPTIONS = Object.freeze(["id", "source", "transform"]);
const REBIND_OPTIONS = Object.freeze(["id", "data"]);
const MATERIALIZERS = Object.freeze({
  filter: "materializeFilteredData",
  regression: "materializeRegressionData",
  density: "materializeDensityData",
  interval: "materializeIntervalData",
  boxSummary: "materializeBoxSummaryData",
  boxOutlier: "materializeBoxOutlierData"
});

function requestedTransform(transform) {
  if (!isPlainObject(transform)) {
    throw new TypeError("replayDerivedData transform must be a plain object.");
  }
  const materialize = MATERIALIZERS[transform.type];
  if (materialize === undefined) {
    throw new Error(
      `replayDerivedData does not support transform "${transform.type ?? "unknown"}".`
    );
  }
  if (transform.type !== "density") return { transform, materialize };
  const { resolved: _resolved, ...requested } = transform;
  return { transform: requested, materialize };
}

export const replayDerivedData = action(
  {
    op: "replayDerivedData",
    description: "Replay one stored derived-data transform for a facet cell."
  },
  function (args = {}) {
    validateKeys(args, REPLAY_OPTIONS, "replayDerivedData");
    const id = validateUserId(args.id, "Facet replay dataset id");
    const source = validateUserId(args.source, "Facet replay source id");
    const resolved = requestedTransform(args.transform);
    return this
      .createDerivedData({ id, source, transform: [resolved.transform] })
      [resolved.materialize]({ id });
  }
);

export const rebindLayerData = action(
  {
    op: "rebindLayerData",
    description: "Rebind one facet-cell layer to its replayed dataset."
  },
  function (args = {}) {
    validateKeys(args, REBIND_OPTIONS, "rebindLayerData");
    const id = validateUserId(args.id, "Facet layer id");
    const data = validateUserId(args.data, "Facet layer dataset id");
    requireLayer(this, id);
    if (!hasDataset(this, data)) {
      throw new Error(`Facet layer dataset "${data}" does not exist.`);
    }
    return this.editSemantic({
      property: `layer[${id}].data`,
      value: data
    });
  }
);

