import { validateAggregate } from "../../../../grammar/aggregate.js";
import { emptyPositionPolicy } from "./common.js";

export function resolveArcPositionPolicy({ channel, args, fieldType }) {
  if (args.bin !== undefined) {
    throw new Error(`Arc ${channel} encoding does not support bin.`);
  }
  if (args.stack !== undefined) {
    throw new Error(`Arc ${channel} encoding does not support stack.`);
  }
  if (channel === "radius") {
    if (args.aggregate !== undefined) {
      throw new Error("Arc radius encoding does not support aggregate.");
    }
    return emptyPositionPolicy();
  }
  if (!["ordinal", "nominal"].includes(fieldType)) {
    throw new Error("Arc theta encoding requires an ordinal or nominal field.");
  }
  if (args.aggregate === undefined) return emptyPositionPolicy();
  const aggregate = validateAggregate(args.aggregate);
  if (aggregate !== "count") {
    throw new Error('Arc theta aggregate currently supports only "count".');
  }
  return { bin: undefined, aggregate, stack: undefined };
}
