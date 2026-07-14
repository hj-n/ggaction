import { cloneAndFreeze } from "../core/immutable.js";
import { readNominalField } from "./scales.js";
import {
  aggregateScalarValues,
  isScalarAggregate,
  validateAggregateFieldValues,
  validateScalarAggregateFieldType
} from "./aggregate.js";

function requireAggregateBarEncoding(layer) {
  if (layer?.mark?.type !== "bar") {
    throw new Error("Bar aggregate derivation requires a semantic bar mark.");
  }

  const x = layer.encoding?.x;
  const y = layer.encoding?.y;

  if (x?.fieldType !== "ordinal") {
    throw new Error(`Bar mark "${layer.id}" requires an ordinal x encoding.`);
  }
  if (
    !isScalarAggregate(y?.aggregate) ||
    y.stack !== null
  ) {
    throw new Error(
      `Bar mark "${layer.id}" requires a supported scalar aggregate/non-stacked y encoding.`
    );
  }
  validateScalarAggregateFieldType(y.aggregate, y.fieldType);

  return { x, y };
}

export function deriveBarAggregates(rows, layer) {
  const { x, y } = requireAggregateBarEncoding(layer);
  validateAggregateFieldValues(rows, y.field, y.fieldType);
  const xValues = readNominalField(rows, x.field);
  const yValues = rows.map(row => row[y.field]);
  const color = layer.encoding?.color;
  let colorValues;

  if (color !== undefined) {
    if (color.fieldType !== "nominal") {
      throw new Error(`Bar color encoding on mark "${layer.id}" must be nominal.`);
    }
    colorValues = readNominalField(rows, color.field);
  }
  const groups = new Map();

  for (let index = 0; index < rows.length; index += 1) {
    const xValue = xValues[index];
    const colorValue = colorValues?.[index];
    const key = JSON.stringify([xValue, colorValue]);
    const group = groups.get(key) ?? {
      x: xValue,
      ...(colorValues === undefined ? {} : { color: colorValue }),
      values: []
    };
    group.values.push(yValues[index]);
    groups.set(key, group);
  }

  if (groups.size === 0) {
    throw new Error(`Bar mark "${layer.id}" has no values to aggregate.`);
  }

  const values = [...groups.values()].flatMap(group => {
    const value = aggregateScalarValues(group.values, y.aggregate);
    return value === undefined ? [] : [{
      x: group.x,
      ...(Object.hasOwn(group, "color") ? { color: group.color } : {}),
      y: value,
      count: group.values.length
    }];
  });

  if (values.length === 0) {
    throw new Error(`Bar mark "${layer.id}" has no complete aggregate values.`);
  }

  return cloneAndFreeze({
    xValues: values.map(value => value.x),
    yValues: values.map(value => value.y),
    values
  });
}
