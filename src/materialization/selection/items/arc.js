import { deriveArcSectors } from "../../../grammar/arcs.js";
import { resolvePolarFrame } from "../../../grammar/polar.js";
import { resolveGraphicBounds } from "../../../layout/canvas.js";
import { finalizeItems, uniqueFields } from "./common.js";

export function resolveArcItems(program, layer, dataset) {
  const thetaScale = program.resolvedScales[layer.encoding?.theta?.scale];
  const radiusScale = program.resolvedScales[layer.encoding?.radius?.scale];
  const frame = resolvePolarFrame(resolveGraphicBounds(program));
  const derived = deriveArcSectors(dataset.values, layer, {
    thetaScale,
    ...(radiusScale === undefined ? {} : { radiusScale }),
    frame,
    innerRadiusRatio: program.markConfigs[layer.id]?.innerRadius ?? 0
  });
  const definitions = derived.sectors.map(sector => {
    const members = sector.sourceIndices.map(index => dataset.values[index]);
    return {
      fields: uniqueFields(members),
      channels: {
        theta: sector.theta,
        ...(sector.radius === undefined ? {} : { radius: sector.radius }),
        ...(sector.color === undefined ? {} : { color: sector.color })
      },
      members
    };
  });
  return finalizeItems(program, layer, "sector", definitions, "path");
}
