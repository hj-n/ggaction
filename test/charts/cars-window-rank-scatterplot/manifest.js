import { loadCars } from "../../support/data.js";
import { defineVisualVariant } from "../../support/visual-variants.js";

import { createCarsWindowRankPrimitives } from "./primitive.program.js";
import { createCarsWindowRankScatterplot } from "./public.program.js";
import { WINDOW_RANK_LAYOUT } from "./reference-values.js";

const cars = loadCars();

export const targetCallChain = `chart()
  .createCanvas({ width: 760, height: 500 })
  .createData({ id: "cars", values: rows })
  .createWindowData({
    id: "rankedCars",
    partitionBy: "Origin",
    sortBy: [{ field: "Horsepower", order: "descending" }],
    operations: [
      { op: "rank", as: "horsepowerRank" },
      { op: "denseRank", as: "horsepowerDenseRank" }
    ]
  })
  .filterData({
    id: "topHorsepowerCars",
    source: "rankedCars",
    field: "horsepowerRank",
    predicate: { op: "lte", value: 15 }
  })
  .createScatterPlot({
    data: "topHorsepowerCars",
    x: { field: "horsepowerRank", fieldType: "quantitative" },
    y: { field: "Miles_per_Gallon", fieldType: "quantitative" },
    color: { field: "Origin", fieldType: "nominal" }
  })
  .encodePointRadius({ target: "rankedCarsPlot", value: 5 })
  .createTitle({
    text: "Fuel Economy among High-Horsepower Cars",
    subtitle: "Top 15 horsepower ranks within each origin",
    align: "center"
  });`;

export const visualVariants = Object.freeze([
  defineVisualVariant({
    chart: "cars-window-rank-scatterplot",
    variant: "top-horsepower-by-origin",
    title: "Fuel Economy among High-Horsepower Cars",
    callChain: targetCallChain,
    artifact: { capability: "window-data" },
    primitive: () => createCarsWindowRankPrimitives(cars),
    userFacing: () => createCarsWindowRankScatterplot(cars),
    width: WINDOW_RANK_LAYOUT.width,
    height: WINDOW_RANK_LAYOUT.height,
    colors: ["#66c2a5", "#fc8d62", "#8da0cb", "#334155"],
    regions: [
      {
        name: "ranked points",
        x: 75,
        y: 80,
        width: 535,
        height: 345,
        minimumInkPixels: 900
      },
      {
        name: "origin legend",
        x: 620,
        y: 110,
        width: 110,
        height: 180,
        minimumInkPixels: 150
      }
    ]
  })
]);
