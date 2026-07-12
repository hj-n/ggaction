import { chart } from "../../src/index.js";

export function createCarsLineChart(cars) {
  const rows = cars.filter(
    car =>
      typeof car.Year === "string" &&
      Number.isFinite(Date.parse(car.Year)) &&
      Number.isFinite(car.Acceleration) &&
      typeof car.Origin === "string" &&
      car.Origin.length > 0
  );

  return chart()
    .createCanvas({
      width: 720,
      height: 460,
      margin: { top: 80, right: 170, bottom: 60, left: 80 }
    })
    .createData({ id: "cars", values: rows })
    .createLineMark({ id: "trends" })
    .encodeX({
      field: "Year",
      fieldType: "temporal",
      scale: { nice: true }
    })
    .encodeY({
      field: "Acceleration",
      aggregate: "mean",
      scale: { nice: true, zero: false }
    })
    .encodeColor({
      field: "Origin",
      scale: { palette: "tableau10" }
    })
    .encodeStrokeDash({ field: "Origin" })
    .createGuides({
      axes: { y: { ticksAndLabels: { count: 6 } } }
    })
    .createTitle({
      text: "The trend of acceleration by year",
      subtitle: "from 1970 to 1982"
    });
}
