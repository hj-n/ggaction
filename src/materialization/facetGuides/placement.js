import { isPlainObject } from "../../core/immutable.js";
import { planFacetGuideOwnership } from "../../grammar/facets/guides.js";
import {
  axisGraphicIds,
  allLegendGraphicIds
} from "../guides/resources.js";
import { attachSnapshotObject } from "../composition.js";
import { namespaceGraphicId } from "../compositionSnapshot.js";
import {
  materializeLegacyCategoricalLegend
} from "./legacyCategorical.js";
import { legendKinds, prepareSharedFacetLegend } from "./preparation.js";

function copyLegendConfig(program, source) {
  let next = program;
  for (const [kind, config] of Object.entries(source.guideConfigs.legend ?? {})) {
    next = next._withLegendConfig(kind, config);
  }
  return next;
}

function removeNamespacedGraphics(program, namespace, ids) {
  let next = program;
  for (const id of ids) {
    const target = namespaceGraphicId(namespace, id);
    if (next.graphicSpec.objects[target] !== undefined) {
      next = next.editGraphics({ target, remove: true });
    }
  }
  return next;
}

function gradientAnchor(prepared, plot, layout) {
  const strips = prepared.source.graphicSpec.objects.colorGradientStrips;
  if (strips?.items?.[0] === undefined) return undefined;
  const properties = strips.items[0].properties;
  const length = prepared.source.guideConfigs.legend.gradient.gradient.length;
  return {
    sourceX: properties.x,
    sourceY: properties.y,
    targetX: layout.legend.x,
    targetY: plot.y + (plot.height - length) / 2
  };
}

function legendTranslation(prepared, plot, layout) {
  const gradient = gradientAnchor(prepared, plot, layout);
  if (gradient !== undefined) {
    return {
      x: gradient.targetX - gradient.sourceX,
      y: gradient.targetY - gradient.sourceY
    };
  }
  const height = prepared.bounds.bottom - prepared.bounds.top;
  return {
    x: layout.legend.x - prepared.bounds.left,
    y: plot.y + Math.max(0, (plot.height - height) / 2) - prepared.bounds.top
  };
}

function attachParentLegend(program, prepared, plot, layout) {
  const translation = legendTranslation(prepared, plot, layout);
  const canvas = prepared.source.graphicSpec.objects.canvas;
  const id = `${program.compositionSpec.id}-shared-legend`;
  let next = copyLegendConfig(program, prepared.source)
    .createGraphics({ id, type: "canvas", parent: "canvas" });
  for (const [property, value] of Object.entries({
    x: translation.x,
    y: translation.y,
    width: canvas.properties.width,
    height: canvas.properties.height,
    background: "transparent"
  })) {
    next = next.editGraphics({ target: id, property, value });
  }
  for (const root of prepared.roots) {
    next = attachSnapshotObject(next, prepared.source.graphicSpec, root, id);
  }
  return next;
}

export function applyFacetGuideComposition(program, { layout, plot } = {}) {
  if (!isPlainObject(layout) || !Array.isArray(layout.children)) {
    throw new TypeError("Facet guide composition requires a resolved layout.");
  }
  if (!isPlainObject(plot)) {
    throw new TypeError("Facet guide composition requires resolved plot bounds.");
  }
  const prepared = prepareSharedFacetLegend(program);
  const children = layout.children.map(cell => {
    const child = program.children[cell.id];
    return {
      id: cell.id,
      axes: Object.keys(child.guideConfigs.axis ?? {})
        .filter(channel => ["x", "y"].includes(channel)),
      legendKinds: legendKinds(child)
    };
  });
  const ownership = planFacetGuideOwnership({
    placements: layout.children,
    children,
    axes: program.compositionSpec.facet.guides.axes,
    legend: program.compositionSpec.facet.guides.legend,
    ...(prepared === undefined ? {} : { sharedLegends: prepared.compatibility })
  });
  let next = program;
  for (const cell of layout.children) {
    const namespace = `${program.compositionSpec.id}-${cell.id}`;
    const childPlan = ownership.children[cell.id];
    for (const channel of childPlan.removeAxes) {
      next = removeNamespacedGraphics(next, namespace, axisGraphicIds(channel));
    }
    if (childPlan.removeLegends.length > 0) {
      next = removeNamespacedGraphics(
        next,
        namespace,
        allLegendGraphicIds(childPlan.removeLegends)
      );
    }
  }
  if (prepared === undefined) return next;
  if (prepared.mode === "legacyCategorical") {
    return materializeLegacyCategoricalLegend(next, prepared, layout);
  }
  return attachParentLegend(next, prepared, plot, layout);
}
