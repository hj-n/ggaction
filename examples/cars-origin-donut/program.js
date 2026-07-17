import { chart } from "../../src/index.js";

export function createCarsOriginDonut(cars) {
  return chart()
    .createCanvas({
      width: 640,
      height: 500,
      margin: { top: 55, right: 190, bottom: 55, left: 55 }
    })
    .createData({ values: cars })
    .createArcMark({ innerRadius: 0.56, padAngle: 1.5 })
    .encodeTheta({ field: "Origin", aggregate: "count" })
    .encodeColor({ field: "Origin", palette: "tableau10" })
    .createGuides({
      axes: false,
      grid: false,
      legend: { position: "right", title: "Origin" }
    });
}
