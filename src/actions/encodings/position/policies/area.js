import { validateStack, emptyPositionPolicy } from "./common.js";

export function resolveAreaPositionPolicy({ dataset, channel, args, fieldType }) {
  if (!["quantitative", "temporal"].includes(fieldType)) {
    throw new Error(
      "Area position encoding requires quantitative or temporal fields."
    );
  }
  if (args.aggregate !== undefined || args.bin !== undefined) {
    throw new Error("Area position encoding does not support aggregate or bin.");
  }
  if (args.stack === undefined) return emptyPositionPolicy();
  if (
    channel !== "y" ||
    !dataset.transform?.some(transform => transform.type === "density")
  ) {
    throw new Error("Area stack currently requires a density y encoding.");
  }
  return {
    bin: undefined,
    aggregate: undefined,
    stack: validateStack(args.stack, "Area y encoding")
  };
}
