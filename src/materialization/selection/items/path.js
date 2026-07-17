import {
  deriveAreaSeries,
  deriveDensityAreaSeries
} from "../../../grammar/areaSeries.js";
import { deriveLineSeries } from "../../../grammar/lineSeries.js";
import { findUpstreamTransform } from "../../dataProvenance.js";
import { finalizeItems, uniqueFields } from "./common.js";

function rowsForSeries(rows, key) {
  const entries = Object.entries(key);
  return entries.length === 0
    ? rows
    : rows.filter(row => entries.every(([field, value]) => row[field] === value));
}

function seriesDefinitions(layer, rows, series) {
  return series.map(item => {
    const members = rowsForSeries(rows, item.key);
    const fields = { ...uniqueFields(members), ...item.key };
    const channels = Object.fromEntries(
      Object.entries(layer.encoding ?? {}).flatMap(([channel, encoding]) => {
        if (encoding.field === undefined) {
          return Object.hasOwn(encoding, "datum")
            ? [[channel, encoding.datum]]
            : [];
        }
        return Object.hasOwn(fields, encoding.field)
          ? [[channel, fields[encoding.field]]]
          : [];
      })
    );
    return { fields, channels, members };
  });
}

export function resolveLineItems(program, layer, dataset) {
  const derived = deriveLineSeries(dataset.values, layer);
  return finalizeItems(
    program,
    layer,
    "series",
    seriesDefinitions(layer, dataset.values, derived.series),
    "path"
  );
}

export function resolveAreaItems(program, layer, dataset) {
  const transform = findUpstreamTransform(program, dataset, "density");
  const derived = transform === undefined
    ? deriveAreaSeries(dataset.values, layer)
    : deriveDensityAreaSeries(dataset.values, layer, transform);
  return finalizeItems(
    program,
    layer,
    "series",
    seriesDefinitions(layer, dataset.values, derived.series),
    "path"
  );
}
