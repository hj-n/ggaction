import { action } from "../../core/action.js";
import { validateUserId } from "../../core/identifiers.js";
import { validateOptionObject } from "../../core/validation.js";
import {
  normalizeParallelDimensions,
  validateParallelKeyField,
  validateParallelMissingPolicy,
  validateParallelRows
} from "../../grammar/parallelCoordinates.js";
import { findCoordinate } from "../../selectors/coordinates.js";
import { resolvePositionScaleDefinition } from "../scales/definitions.js";
import { applyEncodingScale, resolveTarget } from "./shared.js";

const OPTIONS = Object.freeze([
  "target", "coordinate", "dimensions", "key", "missing"
]);

function resolveCoordinate(program, layer, requested) {
  const explicit = requested === undefined
    ? undefined
    : validateUserId(requested, "Parallel coordinate id");
  if (layer.coordinate !== undefined) {
    if (explicit !== undefined && explicit !== layer.coordinate) {
      throw new Error(
        `Layer "${layer.id}" already uses coordinate "${layer.coordinate}".`
      );
    }
    const coordinate = findCoordinate(program, layer.coordinate);
    if (coordinate?.type !== "parallel") {
      throw new Error(`Coordinate "${layer.coordinate}" is not Parallel.`);
    }
    return { id: layer.coordinate, create: false };
  }
  if (explicit !== undefined) {
    const coordinate = findCoordinate(program, explicit);
    if (coordinate !== undefined && coordinate.type !== "parallel") {
      throw new Error(`Coordinate "${explicit}" is not Parallel.`);
    }
    return { id: explicit, create: coordinate === undefined };
  }
  const compatible = program.semanticSpec.coordinates.filter(
    coordinate => coordinate.type === "parallel"
  );
  if (compatible.length > 1) {
    throw new Error(
      "encodeParallelCoordinates requires coordinate when multiple Parallel coordinates are available."
    );
  }
  if (compatible.length === 1) return { id: compatible[0].id, create: false };
  const conflict = findCoordinate(program, "parallel");
  if (conflict !== undefined) {
    throw new Error('Coordinate "parallel" already exists with a different type.');
  }
  return { id: "parallel", create: true };
}

export const encodeParallelCoordinates = action(
  {
    op: "encodeParallelCoordinates",
    description: "Atomically encode ordered Parallel-coordinate dimensions."
  },
  function (args = {}) {
    validateOptionObject(args, OPTIONS, "encodeParallelCoordinates");
    const { id: target, dataset, layer } = resolveTarget(
      this,
      args.target,
      ["line"],
      "line mark"
    );
    if (
      ["x", "y", "theta", "radius"].some(
        channel => layer.encoding?.[channel] !== undefined
      )
    ) {
      throw new Error(
        `Parallel encoding cannot mix with existing position encodings on layer "${target}".`
      );
    }
    const coordinate = resolveCoordinate(this, layer, args.coordinate);
    const dimensions = normalizeParallelDimensions(
      dataset.values,
      args.dimensions,
      target
    );
    const key = args.key === undefined
      ? undefined
      : validateParallelKeyField(args.key);
    const missing = validateParallelMissingPolicy(args.missing ?? "break");
    validateParallelRows(dataset.values, dimensions, { key, missing });

    const definitions = dimensions.map(dimension =>
      resolvePositionScaleDefinition(
        this,
        "y",
        dimension.fieldType,
        { ...dimension.scaleOptions, id: dimension.scale },
        dimension.fieldType === "ordinal" ? { discreteType: "point" } : {}
      )
    );
    const storedDimensions = dimensions.map(({ scaleOptions, ...dimension }) => {
      void scaleOptions;
      return dimension;
    });

    let next = this;
    if (coordinate.create) {
      next = next.createCoordinate({ id: coordinate.id, type: "parallel" });
    }
    if (layer.coordinate === undefined) {
      next = next.editSemantic({
        property: `layer[${target}].coordinate`,
        value: coordinate.id
      });
    }
    next = next
      .editSemantic({
        property: `layer[${target}].encoding.parallel.dimensions`,
        value: storedDimensions
      })
      .editSemantic({
        property: `layer[${target}].encoding.parallel.missing`,
        value: missing
      });
    if (key === undefined && layer.encoding?.parallel?.key !== undefined) {
      next = next.editSemantic({
        property: `layer[${target}].encoding.parallel.key`,
        remove: true
      });
    } else if (key !== undefined) {
      next = next.editSemantic({
        property: `layer[${target}].encoding.parallel.key`,
        value: key
      });
    }
    for (let index = 0; index < definitions.length; index += 1) {
      next = applyEncodingScale(next, definitions[index], dimensions[index].scaleOptions);
    }
    for (const definition of definitions) {
      next = next.rematerializeScale({
        id: definition.id,
        guides: false,
        marks: false
      });
    }
    return next.rematerializeLineMark({ id: target, scales: false });
  }
);

export function registerParallelEncodingAction(ProgramClass) {
  ProgramClass.prototype.encodeParallelCoordinates = encodeParallelCoordinates;
}
