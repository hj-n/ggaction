import { validateUserId } from "../../../core/identifiers.js";

export function legendTargets(program) {
  return [...new Set(Object.values(program.guideConfigs.legend ?? {})
    .map(config => config?.target)
    .filter(Boolean))];
}

export function resolveLegendTarget(program, requested, operation) {
  const targets = legendTargets(program);
  if (requested !== undefined) {
    const target = validateUserId(requested, "Legend target id");
    if (!targets.includes(target)) {
      throw new Error(`Unknown legend target "${target}".`);
    }
    return target;
  }
  if (operation === "removeLegend" && targets.length === 0) {
    throw new Error("removeLegend requires an existing legend.");
  }
  if (targets.length !== 1) {
    throw new Error(`${operation} requires target when the legend is ambiguous.`);
  }
  return targets[0];
}
