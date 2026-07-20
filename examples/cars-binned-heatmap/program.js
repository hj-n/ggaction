import { chart } from "../../src/index.js";

export function createCarsBinnedHeatmap(cars) {
  return chart()
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
    });
}
