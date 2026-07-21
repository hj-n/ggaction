import { validateUserId } from "../../../../core/identifiers.js";
import {
  isTransformedScaleType,
  mapContinuousScaleValues,
  mapOrdinalPositionValues,
  transformedTicks
} from "../../../../grammar/scales/index.js";
import { niceTicks } from "../../../../grammar/ticks.js";
import { resolveGraphicBounds } from "../../../../layout/canvas.js";
import { findCoordinate } from "../../../../selectors/coordinates.js";
import { findLayer } from "../../../../selectors/layers.js";

export function requireParallelAxisLayer(program, target) {
  const layer = findLayer(program, target);
  const coordinate = layer === undefined
    ? undefined
    : findCoordinate(program, layer.coordinate);
  if (
    layer?.mark?.type !== "line" ||
    coordinate?.type !== "parallel" ||
    layer.encoding?.parallel?.dimensions?.length < 2
  ) {
    throw new Error(`Parallel axes require an encoded Parallel line "${target}".`);
  }
  return { coordinate, dimensions: layer.encoding.parallel.dimensions, layer };
}

export function resolveParallelAxisTarget(program, requested) {
  if (requested !== undefined) {
    const target = validateUserId(requested, "Parallel axes target");
    requireParallelAxisLayer(program, target);
    return target;
  }
  const candidates = program.semanticSpec.layers.filter(layer => {
    const coordinate = findCoordinate(program, layer.coordinate);
    return layer.encoding?.parallel !== undefined && coordinate?.type === "parallel";
  });
  if (candidates.length !== 1) {
    throw new Error(
      "Parallel axes require target when one Parallel layer cannot be inferred."
    );
  }
  return candidates[0].id;
}

function ticksForScale(scale) {
  if (["ordinal", "band", "point"].includes(scale.type)) return scale.domain;
  if (isTransformedScaleType(scale.type)) {
    return transformedTicks(scale.type, scale.domain, 5, {
      ...(scale.base === undefined ? {} : { base: scale.base }),
      ...(scale.exponent === undefined ? {} : { exponent: scale.exponent }),
      ...(scale.constant === undefined ? {} : { constant: scale.constant })
    });
  }
  return niceTicks(scale.domain, 5);
}

function formatValue(value) {
  if (Number.isFinite(value) && Math.abs(value) >= 1000 && value % 1000 === 0) {
    return `${value / 1000}k`;
  }
  return String(value);
}

export function resolveParallelAxisValues(program, dimensions) {
  const bounds = resolveGraphicBounds(program);
  const step = bounds.width / (dimensions.length - 1);
  const axes = dimensions.map((dimension, index) => {
    const scale = program.resolvedScales[dimension.scale];
    if (scale === undefined) {
      throw new Error(`Parallel axis requires resolved scale "${dimension.scale}".`);
    }
    const values = ticksForScale(scale);
    const y = ["ordinal", "band", "point"].includes(scale.type)
      ? mapOrdinalPositionValues(values, scale)
      : mapContinuousScaleValues(values, scale);
    return {
      ...dimension,
      x: bounds.x + step * index,
      values,
      y,
      labels: values.map(formatValue)
    };
  });
  return { axes, bounds };
}
