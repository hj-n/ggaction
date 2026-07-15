import { resolveIntervalComposite } from "../intervals/resolve.js";

const ERROR_BAR_POLICY = Object.freeze({
  operation: "createErrorBar",
  resourceLabel: "error-bar",
  defaultId: "errorBar",
  ownerLabel: "Error-bar id",
  positionTypes: Object.freeze(["nominal", "ordinal", "temporal"]),
  defaultPositionType: "nominal",
  defaultIntervalChannel: "y",
  scaleDefaults: () => ({}),
  intervalScaleDefaults: Object.freeze({ nice: true, zero: false }),
  allowExplicitGrouping: false,
  ambiguousMessage:
    "createErrorBar requires one quantitative interval axis and one nominal, ordinal, or temporal position axis."
});

export function resolveErrorBar(program, args) {
  const resolved = resolveIntervalComposite(program, args, ERROR_BAR_POLICY);
  return {
    ...resolved,
    lowerCapId: `${resolved.id}LowerCap`,
    upperCapId: `${resolved.id}UpperCap`
  };
}
