import { chart } from "../../../src/index.js";
import { LABEL_LAYOUT, createCountryRows } from "./fixture.js";

export function createGapminderCountryLabels(gapminder) {
  const rows = createCountryRows(gapminder);
  return chart()
    .createCanvas({
      width: LABEL_LAYOUT.width,
      height: LABEL_LAYOUT.height,
      margin: LABEL_LAYOUT.margin
    })
    .createData({ id: "countries2005", values: rows })
    .createPointMark({
      id: "countries",
      data: "countries2005",
      fill: "#2563eb",
      stroke: "#ffffff",
      strokeWidth: 0.8
    })
    .encodeX({
      target: "countries",
      field: "fertility",
      fieldType: "quantitative",
      scale: { domain: [1.2, 2.15], zero: false }
    })
    .encodeY({
      target: "countries",
      field: "life_expect",
      fieldType: "quantitative",
      scale: { domain: [77.2, 83], zero: false }
    })
    .createTextMark({
      id: "countryLabels",
      fill: "#0f172a",
      fontSize: LABEL_LAYOUT.fontSize,
      align: "left",
      baseline: "middle",
      dx: LABEL_LAYOUT.textDx
    })
    .encodeText({ target: "countryLabels", field: "country" })
    .layoutLabels({
      target: "countryLabels",
      axis: LABEL_LAYOUT.axis,
      padding: LABEL_LAYOUT.padding,
      maxDisplacement: LABEL_LAYOUT.maxDisplacement,
      bounds: "plot",
      leader: LABEL_LAYOUT.leader
    })
    .createGuides({
      axes: {
        x: { title: { text: "Fertility" } },
        y: { title: { text: "Life expectancy" } }
      },
      grid: { horizontal: true, vertical: true },
      legend: false
    })
    .createTitle({
      text: "Fertility and Life Expectancy",
      subtitle: "Selected countries in 2005"
    });
}
