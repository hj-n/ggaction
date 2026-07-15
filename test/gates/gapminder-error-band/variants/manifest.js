import { defineVisualVariant } from "../../../support/visual-variants.js";
import { loadCars } from "../../../support/data.js";

import { createCarsHorizontalErrorBandPrimitives } from
  "../primitive.program.js";
import {
  CARS_HORIZONTAL_LAYOUT,
  CARS_HORIZONTAL_STYLE
} from "../reference-values.js";

const targetCallChain = `chart()
  .createCanvas({
    width: 760,
    height: 480,
    margin: { top: 90, right: 50, bottom: 70, left: 80 }
  })
  .createData({ values: cars })
  .createErrorBand({
    x: { field: "Acceleration", extent: "ci" },
    y: { field: "Year", fieldType: "temporal" },
    boundaries: { stroke: "#355f8a", strokeWidth: 1.5 }
  })
  .createGuides()
  .createTitle({
    text: "Acceleration over Time",
    subtitle: "Mean and 95% confidence interval across cars"
  });`;

export const visualVariants = Object.freeze([
  defineVisualVariant({
    chart: "gapminder-error-band",
    variant: "cars-horizontal",
    title: "Cars Horizontal Error Band",
    callChain: targetCallChain,
    primitive: createCarsHorizontalErrorBandPrimitives(loadCars()),
    width: CARS_HORIZONTAL_LAYOUT.width,
    height: CARS_HORIZONTAL_LAYOUT.height,
    colors: [CARS_HORIZONTAL_STYLE.boundaryStroke],
    regions: [
      { name: "plot", x: 80, y: 90, width: 630, height: 320 }
    ]
  })
]);
