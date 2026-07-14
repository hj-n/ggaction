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
    y?.aggregate === "count" &&
    y.stack === "zero"
  ) {
    return BAR_GRAINS.histogram;
  }
  if (
    x?.fieldType === "ordinal" &&
    isAggregate(y?.aggregate) &&
    y.stack === null
  ) {
    return BAR_GRAINS.aggregate;
  }
  return undefined;
}

export function inferBarColorLayout(layer) {
  const grain = resolveBarGrain(layer);
  if (grain === BAR_GRAINS.histogram) return "stack";
  if (grain === BAR_GRAINS.aggregate) return "group";
  return undefined;
}
