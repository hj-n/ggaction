import { chart } from "../../src/index.js";

export function createCarsWeightedRules(cars) {
  const rows = cars.filter(row => [
    row.Acceleration,
    row.Miles_per_Gallon,
    row.Horsepower,
    row.Weight_in_lbs
  ].every(Number.isFinite)).slice(0, 8);

  return chart()
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
    .createLegend({ channels: ["strokeWidth"], count: 5 });
}
