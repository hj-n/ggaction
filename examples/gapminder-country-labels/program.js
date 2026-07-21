import { chart } from "../../src/index.js";

export const COUNTRY_LABEL_NAMES = Object.freeze([
  "Australia", "Austria", "Belgium", "Canada", "Finland", "France",
  "Germany", "Greece", "Ireland", "Italy", "Japan", "Netherlands",
  "Norway", "Portugal", "Spain", "Switzerland", "United Kingdom",
  "United States"
]);

export const COUNTRY_LABEL_LAYOUT = Object.freeze({
  width: 760,
  height: 520,
  margin: Object.freeze({ top: 88, right: 38, bottom: 72, left: 76 }),
  plot: Object.freeze({ left: 76, right: 722, top: 88, bottom: 448 }),
  axis: "both",
  padding: 3,
  maxDisplacement: 64,
  fontSize: 11,
  textDx: 7,
  leader: Object.freeze({
    stroke: "#94a3b8",
    strokeWidth: 0.8,
    opacity: 0.9
  })
});

export function selectCountryLabelRows(rows) {
  const selected = rows.filter(row =>
    row.year === 2005 && COUNTRY_LABEL_NAMES.includes(row.country)
  );
  if (
    selected.length !== COUNTRY_LABEL_NAMES.length ||
    selected.some((row, index) => row.country !== COUNTRY_LABEL_NAMES[index])
  ) {
    throw new Error("Gapminder country-label data does not match its expected order.");
  }
  return selected;
}

export function createGapminderCountryLabels(gapminder) {
  const rows = selectCountryLabelRows(gapminder);
  return chart()
    .createCanvas({
      width: COUNTRY_LABEL_LAYOUT.width,
      height: COUNTRY_LABEL_LAYOUT.height,
      margin: COUNTRY_LABEL_LAYOUT.margin
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
      fontSize: COUNTRY_LABEL_LAYOUT.fontSize,
      align: "left",
      baseline: "middle",
      dx: COUNTRY_LABEL_LAYOUT.textDx
    })
    .encodeText({ target: "countryLabels", field: "country" })
    .layoutLabels({
      target: "countryLabels",
      axis: COUNTRY_LABEL_LAYOUT.axis,
      padding: COUNTRY_LABEL_LAYOUT.padding,
      maxDisplacement: COUNTRY_LABEL_LAYOUT.maxDisplacement,
      bounds: "plot",
      leader: COUNTRY_LABEL_LAYOUT.leader
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
