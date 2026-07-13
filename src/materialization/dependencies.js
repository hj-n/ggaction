import { getMarkMaterializationStep } from "../actions/marks/materialization.js";

function usesPositionalScale(program, id) {
  return program.semanticSpec.layers.some(layer =>
    ["x", "y", "xOffset"].some(
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

function hasLegend(program) {
  return !(
    (program.semanticSpec.guides.legend?.series === undefined ||
      program.guideConfigs.legend?.series === undefined) &&
    (program.semanticSpec.guides.legend?.color === undefined ||
      program.guideConfigs.legend?.color === undefined) &&
    program.guideConfigs.legend?.point === undefined &&
    program.guideConfigs.legend?.size === undefined
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
  if (hasLegend(program)) plan.push({ op: "rematerializeLegend" });
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
  return plan;
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
