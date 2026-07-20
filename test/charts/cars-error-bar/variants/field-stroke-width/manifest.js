import { createCarsWeightedRules } from
  "../../../../../examples/cars-weighted-rules/program.js";
import { loadCars } from "../../../../support/data.js";
import { defineVisualVariant } from "../../../../support/visual-variants.js";
import { createCarsWeightedRulePrimitives } from "./primitive.program.js";

const cars = loadCars();

export const weightedRuleCallChain = `chart()
  .createCanvas({
    width: 520,
    height: 320,
    margin: { top: 40, right: 160, bottom: 40, left: 40 }
  })
  .createData({ values: rows })
  .createRuleMark({ id: "cars" })
  .encodeX({
    field: "Acceleration",
    fieldType: "quantitative",
    scale: { domain: [5, 50] }
  })
  .encodeX2({ field: "Miles_per_Gallon", fieldType: "quantitative" })
  .encodeY({
    field: "Horsepower",
    fieldType: "quantitative",
    scale: { domain: [40, 240] }
  })
  .encodeStrokeWidth({
    field: "Weight_in_lbs",
    scale: { domain: [1500, 5200], range: [1, 8] }
  })
  .createLegend({ channels: ["strokeWidth"], count: 5 });`;

export const visualVariants = Object.freeze([
  defineVisualVariant({
    chart: "cars-weighted-rules",
    variant: "field-stroke-width",
    title: "Cars Weighted Rules",
    callChain: weightedRuleCallChain,
    artifact: {
      capability: "field-stroke-width"
    },
    primitive: () => createCarsWeightedRulePrimitives(cars),
    userFacing: () => createCarsWeightedRules(cars),
    width: 520,
    height: 320,
    colors: ["#4c78a8", "#334155"],
    regions: [
      { name: "weighted-rules", x: 35, y: 35, width: 330, height: 250, minimumInkPixels: 120 },
      { name: "width-legend", x: 385, y: 55, width: 120, height: 190, minimumInkPixels: 80 }
    ]
  })
]);
