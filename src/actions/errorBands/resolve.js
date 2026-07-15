import { resolveIntervalComposite } from "../intervals/resolve.js";

const ERROR_BAND_POLICY = Object.freeze({
  operation: "createErrorBand",
  resourceLabel: "error-band",
  defaultId: "errorBand",
  ownerLabel: "Error-band id",
  positionTypes: Object.freeze(["quantitative", "temporal"]),
  defaultPositionType: "quantitative",
  defaultIntervalChannel: "y",
  scaleDefaults: fieldType => fieldType === "temporal"
    ? { nice: true }
    : { nice: true, zero: false },
  intervalScaleDefaults: Object.freeze({ nice: true, zero: false }),
  allowExplicitGrouping: true,
  ambiguousMessage:
    "createErrorBand cannot infer the interval axis when both positions are quantitative; provide an interval option."
});

export function resolveErrorBand(program, args) {
  const resolved = resolveIntervalComposite(program, args, ERROR_BAND_POLICY);
  if (resolved.groupField === resolved.position.field) {
    throw new Error(
      "createErrorBand groupBy must differ from the independent position field."
    );
  }
  return resolved;
}
