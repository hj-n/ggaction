import { chart } from "../../src/index.js";

export const RADIAL_COUNTRY_ORDER = Object.freeze([
  "Afghanistan", "India", "France", "Germany", "South Africa", "Nigeria",
  "Argentina", "Canada", "China", "Japan", "Egypt", "Israel"
]);

export function createGapminderRadialBarRows(gapminder) {
  if (!Array.isArray(gapminder)) {
    throw new TypeError("Gapminder radial bars require rows.");
  }
  const byCountry = new Map(gapminder.filter(row =>
    row?.year === 2005 && RADIAL_COUNTRY_ORDER.includes(row?.country)
  ).map(row => [row.country, row]));
  if (byCountry.size !== RADIAL_COUNTRY_ORDER.length) {
    throw new Error("Gapminder radial bars require every selected 2005 country.");
  }
  return RADIAL_COUNTRY_ORDER.map(country => byCountry.get(country));
}

export function createGapminderRadialBars(gapminder) {
  const countryRows = createGapminderRadialBarRows(gapminder);
  return chart()
    .createCanvas({
      width: 780,
      height: 640,
      margin: { top: 75, right: 190, bottom: 75, left: 75 }
    })
    .createData({ values: countryRows })
    .createArcMark({ innerRadius: 0.18, padAngle: 2, opacity: 0.94 })
    .encodeTheta({
      field: "country",
      fieldType: "nominal",
      scale: { domain: RADIAL_COUNTRY_ORDER }
    })
    .encodeR({
      field: "life_expect",
      scale: { domain: [45, 85], zero: false }
    })
    .encodeColor({
      field: "cluster",
      fieldType: "nominal",
      palette: "tableau10"
    })
    .createGuides({
      axes: {
        theta: { title: { text: "Country" } },
        radius: {
          ticksAndLabels: { values: [50, 60, 70, 80] },
          title: { text: "Life expectancy", position: "inside" }
        }
      },
      grid: { theta: false, radial: { values: [50, 60, 70, 80] } },
      legend: { position: "right", title: "Cluster" }
    });
}
