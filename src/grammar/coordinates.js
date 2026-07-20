import { getPositionChannelDefinition } from "../core/vocabulary.js";

const COORDINATE_TYPES = new Set(["cartesian", "polar", "parallel"]);

export function validateCoordinateType(value) {
  if (!COORDINATE_TYPES.has(value)) {
    throw new Error(`Unknown coordinate type "${value}".`);
  }

  return value;
}

export function getPositionCoordinateDefaults(channel) {
  const coordinate = getPositionChannelDefinition(channel)?.coordinate;

  if (coordinate === undefined) {
    throw new Error(`Unknown positional channel "${channel}".`);
  }

  return coordinate;
}
