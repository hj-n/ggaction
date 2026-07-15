import { hasMaterializedLegend } from "./legends.js";

function markStep(layer) {
  const op = {
    point: "rematerializePointMark",
    line: "rematerializeLineMark",
    bar: "rematerializeBarMark",
    area: "rematerializeAreaMark",
    rule: "rematerializeRuleMark"
  }[layer?.mark?.type];
  return op === undefined ? undefined : { op, args: { id: layer.id } };
}

export function planEncodingRematerialization(program, {
  target,
  channel,
  scale
}) {
  const layer = program.semanticSpec.layers.find(item => item.id === target);
  if (layer === undefined) {
    throw new Error(`Unknown encoding materialization target "${target}".`);
  }

  const plan = [];
  if (layer.mark?.type === "point" && scale !== undefined) {
    plan.push({ op: "rematerializeScale", args: { id: scale } });
  }

  if (
    layer.mark?.type === "area" &&
    channel === "color" &&
    scale !== undefined
  ) {
    for (const candidate of program.semanticSpec.layers) {
      if (
        candidate.mark?.type === "area" &&
        candidate.encoding?.color?.scale === scale
      ) {
        plan.push({ op: "rematerializeAreaMark", args: { id: candidate.id } });
      }
    }
  } else {
    const step = markStep(layer);
    if (step !== undefined) plan.push(step);
  }

  if (hasMaterializedLegend(program)) {
    plan.push({ op: "rematerializeLegend" });
  }
  return plan;
}
