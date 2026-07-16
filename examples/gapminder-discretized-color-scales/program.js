import { chart } from "../../src/index.js";

const COLORS = Object.freeze([
  "#440154",
  "#3b528b",
  "#21918c",
  "#5ec962",
  "#fde725"
]);

const TITLES = Object.freeze({
  quantize: "Life Expectancy: Equal Intervals",
  quantile: "Life Expectancy: Equal Counts",
  threshold: "Life Expectancy: Fixed Thresholds"
});

function createGapminderDiscretizedColorScale(gapminder, type) {
  return chart()
    .createCanvas({
      width: 480,
      height: 312,
      margin: { top: 57.6, right: 114, bottom: 43.2, left: 50.4 }
    })
    .createData({ values: gapminder })
    .filterData({
      id: "gapminder2005",
      field: "year",
      predicate: { op: "eq", value: 2005 }
    })
    .createPointMark()
    .encodeX({
      field: "pop",
      fieldType: "quantitative",
      scale: { type: "log", base: 10, nice: true }
    })
    .encodeY({
      field: "fertility",
      fieldType: "quantitative",
      scale: { type: "sqrt", nice: true, zero: false }
    })
    .encodeColor({
      field: "life_expect",
      fieldType: "quantitative",
      scale: {
        type,
        ...(type === "threshold" ? { domain: [60, 70, 75, 80] } : {}),
        range: COLORS
      }
    })
    .encodeRadius({ value: 4 })
    .editPointMark({
      opacity: 0.72,
      stroke: "#ffffff",
      strokeWidth: 0.6
    })
    .createGuides({
      axes: {
        x: {
          ticksAndLabels: {
            ticks: { length: 3.6, color: "#334155" },
            labels: { offset: 8.4, fontSize: 11 }
          },
          title: { text: "Population", offset: 31.2 }
        },
        y: {
          ticksAndLabels: {
            ticks: { length: 3.6, color: "#334155" },
            labels: { offset: 7.2, fontSize: 11 }
          },
          title: { text: "Fertility", offset: 36 }
        }
      },
      grid: { horizontal: {}, vertical: {} },
      legend: {
        title: "Life expectancy",
        position: "right",
        direction: "vertical",
        offset: 30,
        itemGap: 28,
        symbol: {
          width: 14,
          height: 12,
          stroke: "white",
          strokeWidth: 0.5
        },
        labels: { offset: 8, fontSize: 10 },
        titleStyle: { fontSize: 10 }
      }
    })
    .createTitle({
      text: TITLES[type],
      subtitle: `Gapminder countries in 2005 · ${type} color classes`,
      offset: -6,
      gap: 4.8,
      titleStyle: { fontSize: 16, fontWeight: 700 },
      subtitleStyle: { fontSize: 10 }
    });
}

export function createGapminderQuantizeColorScale(gapminder) {
  return createGapminderDiscretizedColorScale(gapminder, "quantize");
}

export function createGapminderQuantileColorScale(gapminder) {
  return createGapminderDiscretizedColorScale(gapminder, "quantile");
}

export function createGapminderThresholdColorScale(gapminder) {
  return createGapminderDiscretizedColorScale(gapminder, "threshold");
}

export const GAPMINDER_DISCRETIZED_COLOR_BUILDERS = Object.freeze({
  quantize: createGapminderQuantizeColorScale,
  quantile: createGapminderQuantileColorScale,
  threshold: createGapminderThresholdColorScale
});
