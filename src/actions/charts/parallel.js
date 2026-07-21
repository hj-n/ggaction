import { action } from "../../core/action.js";
import { resolveParallelCoordinate } from "../coordinates/parallel.js";
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
    const coordinate = resolveParallelCoordinate(this, {
      requested: args.coordinate,
      operation: "createParallelCoordinates",
      useCurrent: true
    }).id;
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
