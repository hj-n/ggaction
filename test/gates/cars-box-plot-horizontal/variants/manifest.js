import { defineVisualVariant } from "../../../support/visual-variants.js";
import { loadCars } from "../../../support/data.js";
import {
  BOX_PLOT_COLORS,
  BOX_PLOT_STYLE,
  HORIZONTAL_MINMAX_LAYOUT
} from "../../../charts/cars-box-plot/reference-values.js";
import { createCarsHorizontalMinmaxPrimitives } from "../primitive.program.js";

const targetCallChain = `chart()
  .createCanvas({
    width: 560,
    height: 340,
    margin: { top: 90, right: 40, bottom: 65, left: 80 }
  })
  .createData({ values: cars })
  .createBoxPlot({
    x: { field: "Horsepower" },
    y: { field: "Origin", fieldType: "nominal" },
    whisker: { type: "minmax" }
  })
  .encodeColor({
    target: "boxPlot",
    field: "Origin",
    fieldType: "nominal",
    scale: { palette: "tableau10" }
  })
  .createGuides({ grid: { vertical: {} }, legend: false })
  .createTitle({
    text: "Horsepower Range by Origin",
    subtitle: "Min–max whiskers with no outlier layer"
  });`;

export const visualVariants = Object.freeze([
  defineVisualVariant({
    chart: "cars-box-plot",
    variant: "cars-horizontal-minmax",
    title: "Cars Horizontal Minmax Box Plot",
    callChain: targetCallChain,
    primitive: createCarsHorizontalMinmaxPrimitives(loadCars()),
    width: HORIZONTAL_MINMAX_LAYOUT.width,
    height: HORIZONTAL_MINMAX_LAYOUT.height,
    colors: [...BOX_PLOT_COLORS, BOX_PLOT_STYLE.whiskerStroke],
    regions: [
      { name: "plot", x: 80, y: 90, width: 440, height: 185 }
    ]
  })
]);

