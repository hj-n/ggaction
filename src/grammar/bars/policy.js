import { isAggregate } from "../aggregate.js";

export const BAR_GRAINS = Object.freeze({
  histogram: "histogram",
  aggregate: "aggregate"
});

export function resolveBarGrain(layer) {
  if (layer?.mark?.type !== "bar") return undefined;
  const x = layer.encoding?.x;
  const y = layer.encoding?.y;

  if (
    x?.bin !== undefined &&
    y?.aggregate === "count"
  ) {
    return BAR_GRAINS.histogram;
  }
  if (
    x?.fieldType === "ordinal" &&
    isAggregate(y?.aggregate)
  ) {
    return BAR_GRAINS.aggregate;
  }
  return undefined;
}

export function inferBarColorLayout(layer) {
  if (layer?.encoding?.color?.layout !== undefined) {
    return layer.encoding.color.layout;
  }
  const grain = resolveBarGrain(layer);
  if (grain === BAR_GRAINS.histogram) return "stack";
  if (grain === BAR_GRAINS.aggregate) return "group";
  return undefined;
}

export function resolveBarColorLayout(layer) {
  if (layer?.encoding?.color?.layout !== undefined) {
    return layer.encoding.color.layout;
  }
  if (layer?.encoding?.y?.stack === "normalize") return "fill";
  if (layer?.encoding?.xOffset !== undefined) return "group";
  if (layer?.encoding?.y?.stack === null) return "overlay";
  return "stack";
}
