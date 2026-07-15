import { defineVisualVariant } from "../../../support/visual-variants.js";
import { loadCars } from "../../../support/data.js";

import { createCarsErrorBandPrimitives } from "../primitive.program.js";
import {
  ERROR_BAND_COLORS,
  ERROR_BAND_LAYOUT
} from "../reference-values.js";

const targetCallChain = `chart()
  .createCanvas({
    width: 760,
    height: 480,
    margin: { top: 90, right: 150, bottom: 70, left: 80 }
  })
  .createData({ values: cars })
  .createErrorBand({
    x: { field: "Year", fieldType: "temporal" },
    y: { field: "Acceleration" },
    groupBy: "Origin"
  })
  .encodeColor({
    target: "errorBand",
    field: "Origin",
    fieldType: "nominal",
    scale: { palette: "tableau10" }
  })
  .createGuides()
  .createTitle({
    text: "Acceleration Trend by Origin",
    subtitle: "Mean and 95% confidence interval"
  });`;

export const visualVariants = Object.freeze([
  defineVisualVariant({
    chart: "cars-error-band",
    variant: "cars-vertical",
    title: "Cars Vertical Error Band",
    callChain: targetCallChain,
    primitive: createCarsErrorBandPrimitives(loadCars()),
    width: ERROR_BAND_LAYOUT.width,
    height: ERROR_BAND_LAYOUT.height,
    colors: ERROR_BAND_COLORS,
    regions: [
      { name: "plot", x: 80, y: 90, width: 530, height: 320 }
    ]
  })
]);

