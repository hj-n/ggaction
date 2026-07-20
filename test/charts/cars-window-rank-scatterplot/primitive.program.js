import { chart } from "../../../src/index.js";
import { createWindowReference } from "../../oracles/window.js";

import {
  WINDOW_RANK_LAYOUT,
  WINDOW_RANK_TRANSFORM,
  createWindowRankSourceRows
} from "./reference-values.js";

export function createCarsWindowRankPrimitives(cars) {
  const rows = createWindowRankSourceRows(cars);
  const rankedRows = createWindowReference(rows, {
    partitionBy: WINDOW_RANK_TRANSFORM.partitionBy,
    sortBy: WINDOW_RANK_TRANSFORM.sortBy,
    operations: WINDOW_RANK_TRANSFORM.operations
  });

  return chart()
    .createCanvas({
      width: WINDOW_RANK_LAYOUT.width,
      height: WINDOW_RANK_LAYOUT.height,
      margin: WINDOW_RANK_LAYOUT.margin
    })
    .createData({ id: "cars", values: rows })
    .createDerivedData({
      id: "rankedCars",
      source: "cars",
      transform: [WINDOW_RANK_TRANSFORM]
    })
    .editSemantic({
      property: "dataset[rankedCars].values",
      value: rankedRows
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
    });
}
