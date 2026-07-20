import { action } from "../../core/action.js";
import { validateUserId } from "../../core/identifiers.js";
import { findCoordinate } from "../../selectors/coordinates.js";
import {
  applyFacadeGuides,
  normalizeAppearance,
  normalizeEncoding,
  normalizeGuides,
  normalizeStrokeDashEncoding,
  resolveFacadeData,
  resolveFacadeId,
  targetArgs,
  validateFacadeOptions
} from "./shared.js";

const OPTIONS = Object.freeze([
  "id", "data", "coordinate", "dimensions", "key", "missing",
  "color", "strokeDash", "line", "guides"
]);
const LINE_OPTIONS = Object.freeze([
  "strokeWidth", "stroke", "opacity", "curve", "closed"
]);

function resolveCoordinate(program, requested) {
  if (requested !== undefined) {
    const id = validateUserId(requested, "Parallel coordinate id");
    const existing = findCoordinate(program, id);
    if (existing !== undefined && existing.type !== "parallel") {
      throw new Error(`Coordinate "${id}" is not Parallel.`);
    }
    return id;
  }
  const current = program.context.currentCoordinate;
  if (current !== undefined && findCoordinate(program, current)?.type === "parallel") {
    return current;
  }
  const compatible = program.semanticSpec.coordinates.filter(
    coordinate => coordinate.type === "parallel"
  );
  if (compatible.length > 1) {
    throw new Error(
      "createParallelCoordinates requires coordinate when multiple Parallel coordinates are available."
    );
  }
  if (compatible.length === 1) return compatible[0].id;
  const conflict = findCoordinate(program, "parallel");
  if (conflict !== undefined) {
    throw new Error('Coordinate "parallel" already exists with a different type.');
  }
  return "parallel";
}

export const createParallelCoordinates = action(
  {
    op: "createParallelCoordinates",
    description: "Create a complete Parallel-coordinates chart."
  },
  function (args = {}) {
    validateFacadeOptions(args, OPTIONS, "createParallelCoordinates");
    const id = resolveFacadeId(this, args.id, {
      defaultId: "parallelCoordinates",
      operation: "createParallelCoordinates"
    });
    const data = resolveFacadeData(this, args.data, "createParallelCoordinates");
    const coordinate = resolveCoordinate(this, args.coordinate);
    const line = normalizeAppearance(
      args.line,
      LINE_OPTIONS,
      "createParallelCoordinates line"
    );
    if (line.closed === true || (line.curve !== undefined && line.curve !== "linear")) {
      throw new Error(
        "createParallelCoordinates requires a linear open line."
      );
    }
    const color = normalizeEncoding(
      args.color,
      "createParallelCoordinates color"
    );
    const strokeDash = normalizeStrokeDashEncoding(
      args.strokeDash,
      "createParallelCoordinates strokeDash"
    );
    const guides = normalizeGuides(args.guides, "createParallelCoordinates");

    let next = this
      .createCoordinate({ id: coordinate, type: "parallel" })
      .createLineMark({ id, data, ...line })
      .encodeParallelCoordinates({
        target: id,
        coordinate,
        dimensions: args.dimensions,
        ...(args.key === undefined ? {} : { key: args.key }),
        ...(args.missing === undefined ? {} : { missing: args.missing })
      });
    if (color !== undefined) next = next.encodeColor(targetArgs(color, id));
    if (strokeDash !== undefined) {
      next = next.encodeStrokeDash(targetArgs(strokeDash, id));
    }
    return applyFacadeGuides(next, guides);
  }
);
