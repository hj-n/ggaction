import { createCarsHistogram } from "../../../examples/cars-histogram/program.js";

import {
  BAR_HIGHLIGHT_LAYOUT,
  BAR_HIGHLIGHT_TARGET,
  selectLongestHistogramBar
} from "./reference-values.js";

export function createLongestHistogramBarGatePrimitive(
  cars,
  {
    width = BAR_HIGHLIGHT_LAYOUT.width,
    height = BAR_HIGHLIGHT_LAYOUT.height
  } = {}
) {
  let base = createCarsHistogram(cars);
  if (width !== BAR_HIGHLIGHT_LAYOUT.width || height !== BAR_HIGHLIGHT_LAYOUT.height) {
    base = base.editCanvas({ width, height });
  }
  const { target } = selectLongestHistogramBar(cars, { width, height });
  const graphic = base.graphicSpec.objects.bars;
  const children = graphic.children.map(child => ({
    type: child.type ?? graphic.type,
    properties: child.properties
  }));
  const [selected] = children.splice(target.index, 1);

  return base.editGraphics({
    target: "bars",
    property: "children",
    value: [
      ...children,
      {
        type: selected.type,
        properties: {
          ...selected.properties,
          ...BAR_HIGHLIGHT_TARGET
        }
      }
    ]
  });
}
