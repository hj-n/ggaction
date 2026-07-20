import { loadCars } from "../../support/data.js";
import { defineVisualVariant } from "../../support/visual-variants.js";

import { BINNED_HEATMAP_LAYOUT } from "./fixture.js";
import { createCarsBinnedHeatmapPrimitives } from "./primitive.program.js";
import { createCarsWindowRankScatterplot } from
  "../../../examples/cars-window-rank-scatterplot/program.js";
import { createCarsWindowRankPrimitives } from
  "./window-chart.primitive.program.js";
import { WINDOW_RANK_LAYOUT } from "./window-chart.fixture.js";

const cars = loadCars();

export const binnedHeatmapTargetCallChain = `chart()
  .createCanvas({
    width: 700,
    height: 500,
    margin: { top: 70, right: 140, bottom: 75, left: 85 }
  })
  .createData({ values: cars })
  .createHeatmap({
    x: { field: "Weight_in_lbs", fieldType: "quantitative" },
    y: { field: "Miles_per_Gallon", fieldType: "quantitative" },
    bin: {
      bins: { x: 10, y: 8 },
      extent: { x: [1500, 5200], y: [8, 48] },
      includeEmpty: true
    },
    color: { scale: { palette: "blues", domain: [0, 33] } },
    rect: { stroke: "#ffffff", strokeWidth: 1 },
    guides: {
      axes: {
        x: { title: { text: "Vehicle weight (lb)" } },
        y: { title: { text: "Miles per gallon" } }
      },
      legend: { title: "Cars per bin", position: "right" }
    }
  })
  .createTitle({
    text: "Fuel Economy by Vehicle Weight",
    subtitle: "398 cars binned into a 10 × 8 grid",
    align: "center"
  });`;

export const windowRankTargetCallChain = `chart()
  .createCanvas({
    width: 760,
    height: 500,
    margin: { top: 85, right: 155, bottom: 80, left: 80 }
  })
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
    id: "rankedCarsPlot",
    data: "topHorsepowerCars",
    x: {
      field: "horsepowerRank",
      fieldType: "quantitative",
      scale: { domain: [0.5, 15.5], nice: false, zero: false }
    },
    y: {
      field: "Miles_per_Gallon",
      fieldType: "quantitative",
      scale: { domain: [8, 35], nice: false, zero: false }
    },
    color: {
      field: "Origin",
      fieldType: "nominal",
      scale: {
        domain: ["USA", "Europe", "Japan"],
        palette: "set2"
      }
    },
    point: {
      opacity: 0.76,
      stroke: "#ffffff",
      strokeWidth: 0.8
    },
    guides: {
      axes: {
        x: {
          ticksAndLabels: { values: [1, 3, 6, 9, 12, 15] },
          title: { text: "Horsepower rank within origin" }
        },
        y: { title: { text: "Miles per gallon" } }
      },
      grid: { horizontal: true, vertical: false },
      legend: {
        title: "Origin",
        position: "right",
        symbol: {
          layers: [{
            type: "point",
            shape: "circle",
            size: 5,
            stroke: "white",
            strokeWidth: 0.8
          }]
        }
      }
    }
  })
  .encodePointRadius({ target: "rankedCarsPlot", value: 5 })
  .createTitle({
    text: "Fuel Economy among High-Horsepower Cars",
    subtitle: "Top 15 horsepower ranks within each origin",
    align: "center"
  });`;

export const visualVariants = Object.freeze([
  defineVisualVariant({
    chart: "cars-binned-heatmap",
    variant: "weight-mpg-counts",
    title: "Cars Fuel Economy by Vehicle Weight",
    callChain: binnedHeatmapTargetCallChain,
    artifact: { scope: "review" },
    primitive: () => createCarsBinnedHeatmapPrimitives(cars),
    width: BINNED_HEATMAP_LAYOUT.width,
    height: BINNED_HEATMAP_LAYOUT.height,
    colors: ["#cfe1f2", "#0a4a90", "#334155"],
    regions: [
      {
        name: "binned plot",
        x: 85,
        y: 70,
        width: 475,
        height: 355,
        colors: ["#cfe1f2", "#0a4a90"],
        minimumInkPixels: 110_000
      },
      {
        name: "count legend",
        x: 580,
        y: 100,
        width: 100,
        height: 250,
        minimumInkPixels: 500
      }
    ]
  }),
  defineVisualVariant({
    chart: "cars-window-rank-scatterplot",
    variant: "top-horsepower-by-origin",
    title: "Fuel Economy among High-Horsepower Cars",
    callChain: windowRankTargetCallChain,
    artifact: { scope: "review" },
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
