import { getMarkMaterializationStep } from "./marks.js";
import {
  hasMaterializedLegend,
  materializedLegendUsesScale
} from "./legends.js";

function usesPositionalScale(program, id) {
  return program.semanticSpec.layers.some(layer =>
    ["x", "y", "x2", "y2", "xOffset"].some(
      channel => layer.encoding?.[channel]?.scale === id
    )
  );
}

function needsCanvasScaleRematerialization(program, scale) {
  return (
    (scale.range === "auto" ||
      program.semanticSpec.guides.axis?.x?.scale === scale.id ||
      program.semanticSpec.guides.axis?.y?.scale === scale.id ||
      program.semanticSpec.guides.grid?.horizontal?.scale === scale.id ||
      program.semanticSpec.guides.grid?.vertical?.scale === scale.id) &&
    program.resolvedScales[scale.id] !== undefined &&
    usesPositionalScale(program, scale.id)
  );
}

function hasTitle(program) {
  return (
    program.semanticSpec.title.text !== undefined &&
    program.titleConfig !== undefined
  );
}

export function planCanvasRematerialization(program) {
  const plan = [];
  for (const scale of program.semanticSpec.scales) {
    if (needsCanvasScaleRematerialization(program, scale)) {
      plan.push({ op: "rematerializeScale", args: { id: scale.id } });
    }
  }
  for (const layer of program.semanticSpec.layers) {
    const step = getMarkMaterializationStep(program, layer);
    if (step !== undefined) plan.push(step);
  }
  if (hasMaterializedLegend(program)) {
    plan.push({ op: "rematerializeLegend" });
  }
  if (hasTitle(program)) plan.push({ op: "rematerializeTitle" });
  return plan;
}

export function planScaleGuideRematerialization(program, id) {
  const plan = [];
  if (
    program.graphicSpec.objects.xAxisLine &&
    program.semanticSpec.guides.axis?.x?.scale === id
  ) {
    plan.push({ op: "editXAxisLine" });
  }
  if (
    program.graphicSpec.objects.yAxisLine &&
    program.semanticSpec.guides.axis?.y?.scale === id
  ) {
    plan.push({ op: "editYAxisLine" });
  }
  for (const channel of ["x", "y"]) {
    for (const component of ["ticks", "labels", "title"]) {
      if (program.guideConfigs.axis?.[channel]?.[component]?.scale === id) {
        const suffix = component[0].toUpperCase() + component.slice(1);
        plan.push({ op: `edit${channel.toUpperCase()}Axis${suffix}` });
      }
    }
  }
  if (program.guideConfigs.grid?.horizontal?.scale === id) {
    plan.push({ op: "rematerializeHorizontalGrid" });
  }
  if (program.guideConfigs.grid?.vertical?.scale === id) {
    plan.push({ op: "rematerializeVerticalGrid" });
  }
  if (materializedLegendUsesScale(program, id)) {
    plan.push({ op: "rematerializeLegend" });
  }
  return plan;
}

export function planLayerDataRematerialization(program, id) {
  const layer = program.semanticSpec.layers.find(candidate => candidate.id === id);
  if (layer === undefined) throw new Error(`Layer "${id}" does not exist.`);
  const scaleIds = [...new Set(
    Object.values(layer.encoding ?? {})
      .map(encoding => encoding?.scale)
      .filter(scale => scale !== undefined)
  )];
  if (scaleIds.length > 0) {
    return scaleIds.map(scale => ({
      op: "rematerializeScale",
      args: { id: scale }
    }));
  }
  const markStep = getMarkMaterializationStep(program, layer);
  if (markStep !== undefined) return [markStep];
  return layer.mark?.type === "point" &&
    program.graphicSpec.objects[layer.id] !== undefined
    ? [{ op: "rematerializePointMark", args: { id: layer.id } }]
    : [];
}

export function applyMaterializationPlan(program, plan) {
  let next = program;
  const seen = new Set();
  for (const step of plan) {
    const key = JSON.stringify([step.op, step.args ?? null]);
    if (seen.has(key)) continue;
    seen.add(key);
    next = step.args === undefined
      ? next[step.op]()
      : next[step.op](step.args);
  }
  return next;
}
