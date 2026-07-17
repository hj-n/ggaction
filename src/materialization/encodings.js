import { hasMaterializedLegend } from "./legends.js";
import { requireLayer } from "../selectors/layers.js";
import {
  getEncodingMaterializationStages
} from "./marks.js";
import { buildMaterializationPlan } from "./planner.js";

export function planEncodingRematerialization(program, {
  target,
  channel,
  scale
}) {
  const layer = requireLayer(
    program,
    target,
    `Unknown encoding materialization target "${target}"`
  );

  const { scales, marks } = getEncodingMaterializationStages(
    program,
    layer,
    channel,
    scale
  );

  const guides = [];
  if (hasMaterializedLegend(program)) {
    guides.push({ op: "rematerializeLegend" });
  }
  return buildMaterializationPlan({ scales, marks, guides });
}
