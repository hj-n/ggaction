import { defineVisualVariant } from "../../../support/visual-variants.js";
import { loadCars } from "../../../support/data.js";
import { createLongestHistogramBarGatePrimitive } from "../primitive.program.js";
import {
  BAR_HIGHLIGHT_LAYOUT,
  BAR_HIGHLIGHT_TARGET
} from "../reference-values.js";

export const longestBarHighlightCallChain = `chart()
  .createCanvas({
    width: 432,
    height: 460,
    margin: { top: 80, right: 60, bottom: 130, left: 80 }
  })
  .createData({ id: "cars", values: rows })
  .createBarMark({ id: "bars" })
  .encodeHistogram({
    field: "Displacement",
    maxBins: 10,
    xScale: { nice: true, zero: false }
  })
  .encodeColor({
    field: "Origin",
    scale: { palette: "tableau10" }
  })
  .createGuides({ legend: { position: "bottom" } })
  .createTitle({
    text: "Displacement distribution",
    subtitle: "by country",
    align: "center"
  })
  .highlightMarks({
    target: "bars",
    select: { channel: "y", op: "max" },
    fill: "#facc15",
    stroke: "#713f12",
    strokeWidth: 2.5,
    opacity: 1,
    bringToFront: true
  });`;

export const visualVariants = Object.freeze([
  defineVisualVariant({
    chart: "mark-selection",
    variant: "bars-longest-count",
    title: "Longest Histogram Bar Highlight",
    callChain: longestBarHighlightCallChain,
    primitive: createLongestHistogramBarGatePrimitive(loadCars()),
    width: BAR_HIGHLIGHT_LAYOUT.width,
    height: BAR_HIGHLIGHT_LAYOUT.height,
    colors: [BAR_HIGHLIGHT_TARGET.fill],
    regions: [
      {
        name: "plot",
        x: 80,
        y: 80,
        width: 292,
        height: 250,
        colors: [BAR_HIGHLIGHT_TARGET.fill]
      }
    ]
  })
]);
