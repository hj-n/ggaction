import { cloneAndFreeze } from "../core/immutable.js";
import { readNominalField, readQuantitativeField } from "./scales.js";

export function deriveAreaSeries(rows, layer) {
  if (layer?.mark?.type !== "area") {
    throw new Error("Area series derivation requires a semantic area mark.");
  }
  const { x, y, y2, group } = layer.encoding ?? {};
  if (
    x?.fieldType !== "quantitative" ||
    y?.fieldType !== "quantitative" ||
    y2?.fieldType !== "quantitative"
  ) {
    throw new Error(
      `Area mark "${layer.id}" requires quantitative x, y, and y2 encodings.`
    );
  }
  if (group !== undefined && group.fieldType !== "nominal") {
    throw new Error(`Area group encoding on mark "${layer.id}" must be nominal.`);
  }
  const xValues = readQuantitativeField(rows, x.field);
  const yValues = readQuantitativeField(rows, y.field);
  const y2Values = readQuantitativeField(rows, y2.field);
  const groupValues = group === undefined
    ? rows.map(() => undefined)
    : readNominalField(rows, group.field);
  const groups = new Map();

  for (let index = 0; index < rows.length; index += 1) {
    const key = groupValues[index];
    const series = groups.get(key) ?? {
      key: group === undefined ? {} : { [group.field]: key },
      values: []
    };
    series.values.push({
      x: xValues[index],
      y: yValues[index],
      y2: y2Values[index]
    });
    groups.set(key, series);
  }
  if (groups.size === 0) {
    throw new Error(`Area mark "${layer.id}" has no values.`);
  }
  const series = [...groups.values()].map(item => {
    const values = item.values.sort((left, right) => left.x - right.x);
    if (values.length < 2) {
      throw new Error(
        `Area series on mark "${layer.id}" requires at least two points.`
      );
    }
    return { key: item.key, values };
  });
  return cloneAndFreeze({
    xValues: series.flatMap(item => item.values.map(value => value.x)),
    yValues: series.flatMap(item =>
      item.values.flatMap(value => [value.y, value.y2])
    ),
    series
  });
}
