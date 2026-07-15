import { createCarsHistogram } from
  "../../../../examples/cars-histogram/program.js";
import { loadCars } from "../../../support/data.js";
import { defineVisualVariant } from "../../../support/visual-variants.js";
import { createCarsHistogramPrimitives } from "../primitive.program.js";

const cars = loadCars();

export const visualVariants = Object.freeze([defineVisualVariant({
  chart: "cars-histogram",
  variant: "baseline",
  title: "Canonical Histogram Baseline",
  callChain: `chart()
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
  });`,
  primitive: createCarsHistogramPrimitives(cars),
  userFacing: createCarsHistogram(cars),
  width: 432,
  height: 460,
  colors: ["#4c78a8", "#f58518", "#e45756"],
  regions: [Object.freeze({
    name: "plot",
    x: 80,
    y: 80,
    width: 292,
    height: 250,
    minimumInkPixels: 100
  })]
})]);
