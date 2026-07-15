import { cloneAndFreeze } from "../../core/immutable.js";
import { readNominalField, readTemporalField } from "../scales.js";
import {
  aggregateRows,
  validateAggregateFieldType,
  validateAggregateFieldValues,
} from "../aggregate.js";
import {
  BAR_GRAINS,
  resolveBarChannels,
  resolveBarGrain
} from "./policy.js";

function requireAggregateBarEncoding(layer) {
  if (layer?.mark?.type !== "bar") {
    throw new Error("Bar aggregate derivation requires a semantic bar mark.");
  }

  const channels = resolveBarChannels(layer);
  if (resolveBarGrain(layer) !== BAR_GRAINS.aggregate) {
    throw new Error(
      `Bar mark "${layer.id}" requires a categorical position and quantitative aggregate measure.`
    );
  }
  const category = layer.encoding[channels.category];
  const measure = layer.encoding[channels.measure];
  validateAggregateFieldType(measure.aggregate, measure.fieldType);

  return { channels, category, measure };
}

export function deriveBarAggregates(rows, layer) {
  const { channels, category, measure } = requireAggregateBarEncoding(layer);
  validateAggregateFieldValues(rows, measure.field, measure.fieldType);
  const categoryValues = category.fieldType === "temporal"
    ? readTemporalField(rows, category.field)
    : readNominalField(rows, category.field);
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
    const categoryValue = categoryValues[index];
    const colorValue = colorValues?.[index];
    const key = JSON.stringify([categoryValue, colorValue]);
    const group = groups.get(key) ?? {
      category: categoryValue,
      ...(colorValues === undefined ? {} : { color: colorValue }),
      rows: []
    };
    group.rows.push(rows[index]);
    groups.set(key, group);
  }

  if (groups.size === 0) {
    throw new Error(`Bar mark "${layer.id}" has no values to aggregate.`);
  }

  const values = [...groups.values()].flatMap(group => {
    const value = aggregateRows(group.rows, measure.field, measure.aggregate);
    return value === undefined ? [] : [{
      x: channels.category === "x" ? group.category : value,
      y: channels.category === "y" ? group.category : value,
      ...(Object.hasOwn(group, "color") ? { color: group.color } : {}),
      count: group.rows.length
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
