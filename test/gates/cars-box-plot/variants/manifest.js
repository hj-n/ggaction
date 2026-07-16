import { defineVisualVariant } from "../../../support/visual-variants.js";
import { loadCars } from "../../../support/data.js";

import { createCarsBoxPlotPrimitives } from "../primitive.program.js";
import {
  BOX_PLOT_LAYOUT,
  BOX_PLOT_STYLE
} from "../reference-values.js";

const targetCallChain = `chart()
  .createCanvas({
    width: 720,
    height: 460,
    margin: { top: 90, right: 40, bottom: 70, left: 80 }
  })
  .createData({ values: cars })
  .createBoxPlot({
    x: { field: "Origin", fieldType: "nominal" },
    y: { field: "Miles_per_Gallon" }
  })
  .createGuides()
  .createTitle({
    text: "Fuel Economy Distribution by Origin",
    subtitle: "Tukey box plot with 1.5× IQR whiskers"
  });`;

export const visualVariants = Object.freeze([
  defineVisualVariant({
    chart: "cars-box-plot",
    variant: "cars-vertical-tukey",
    title: "Cars Vertical Tukey Box Plot",
    callChain: targetCallChain,
    primitive: createCarsBoxPlotPrimitives(loadCars()),
    width: BOX_PLOT_LAYOUT.width,
    height: BOX_PLOT_LAYOUT.height,
    colors: [BOX_PLOT_STYLE.boxFill, BOX_PLOT_STYLE.medianStroke],
    regions: [
      { name: "plot", x: 80, y: 90, width: 600, height: 300 }
    ]
  })
]);
