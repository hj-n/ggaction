import { cloneAndFreeze } from "../core/immutable.js";
import { readNominalField, readQuantitativeField } from "./scales.js";

function requireMeanBarEncoding(layer) {
  if (layer?.mark?.type !== "bar") {
    throw new Error("Bar aggregate derivation requires a semantic bar mark.");
  }

  const x = layer.encoding?.x;
  const y = layer.encoding?.y;

  if (x?.fieldType !== "ordinal") {
    throw new Error(`Bar mark "${layer.id}" requires an ordinal x encoding.`);
  }
  if (
    y?.fieldType !== "quantitative" ||
    y.aggregate !== "mean" ||
    y.stack !== null
  ) {
    throw new Error(
      `Bar mark "${layer.id}" requires a quantitative mean/non-stacked y encoding.`
    );
  }

  return { x, y };
}

export function deriveBarMeans(rows, layer) {
  const { x, y } = requireMeanBarEncoding(layer);
  const xValues = readNominalField(rows, x.field);
  const yValues = readQuantitativeField(rows, y.field);
  const groups = new Map();

  for (let index = 0; index < rows.length; index += 1) {
    const xValue = xValues[index];
    const group = groups.get(xValue) ?? { x: xValue, sum: 0, count: 0 };
    group.sum += yValues[index];
    group.count += 1;
    groups.set(xValue, group);
  }

  if (groups.size === 0) {
    throw new Error(`Bar mark "${layer.id}" has no values to aggregate.`);
  }

  const values = [...groups.values()].map(group => ({
    x: group.x,
    y: group.sum / group.count,
    count: group.count
  }));

  return cloneAndFreeze({
    xValues: values.map(value => value.x),
    yValues: values.map(value => value.y),
    values
  });
}
