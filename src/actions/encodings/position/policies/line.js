import {
  validateAggregate,
  validateAggregateFieldType
} from "../../../../grammar/aggregate.js";
import { emptyPositionPolicy } from "./common.js";

function rejectSharedOptions(args, channel) {
  if (args.bin !== undefined) {
    throw new Error(`Line ${channel} encoding does not support bin.`);
  }
  if (args.stack !== undefined) {
    throw new Error(`Line ${channel} encoding does not support stack.`);
  }
}

export function resolveLinePositionPolicy({
  layer,
  dataset,
  channel,
  args,
  fieldType
}) {
  const regression = dataset.transform?.some(item => item.type === "regression");
  const interval = dataset.transform?.some(item => item.type === "interval");

  if (channel === "x") {
    const horizontalDirect =
      layer.encoding?.y?.fieldType === "temporal" &&
      fieldType === "quantitative";
    if (
      fieldType !== "temporal" &&
      !((regression || interval || horizontalDirect) && fieldType === "quantitative")
    ) {
      throw new Error(
        "Line x encoding requires a temporal field or a compatible derived quantitative field."
      );
    }
    if (args.aggregate !== undefined) {
      throw new Error("Line x encoding does not support aggregate.");
    }
    rejectSharedOptions(args, "x");
    return emptyPositionPolicy();
  }

  rejectSharedOptions(args, "y");
  const prospectiveDirect =
    args.aggregate === undefined &&
    (fieldType === "temporal" ||
      (fieldType === "quantitative" && layer.encoding?.x === undefined));
  if (interval || prospectiveDirect) {
    if (!["quantitative", "temporal"].includes(fieldType)) {
      throw new Error(
        "Direct line y encoding requires a quantitative or temporal field."
      );
    }
    if (args.aggregate !== undefined) {
      throw new Error("Direct line y encoding does not support aggregate.");
    }
    return emptyPositionPolicy();
  }
  if (regression) {
    if (fieldType !== "quantitative") {
      throw new Error("Regression line y encoding requires a quantitative field.");
    }
    if (args.aggregate !== undefined) {
      throw new Error("Regression line y encoding does not support aggregate.");
    }
    return emptyPositionPolicy();
  }

  const aggregate = validateAggregate(args.aggregate);
  validateAggregateFieldType(aggregate, fieldType);
  return { bin: undefined, aggregate, stack: undefined };
}
