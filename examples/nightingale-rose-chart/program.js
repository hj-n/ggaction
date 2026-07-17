import { chart } from "../../src/index.js";

export const MONTH_ORDER = Object.freeze([
  "April", "May", "June", "July", "August", "September",
  "October", "November", "December", "January", "February", "March"
]);

export const CAUSE_ORDER = Object.freeze([
  "Zymotic Diseases",
  "Other Causes",
  "Wounds & Injuries"
]);

export function createNightingaleRoseChart(nightingale) {
  return chart()
    .createCanvas({
      width: 780,
      height: 640,
      margin: { top: 80, right: 210, bottom: 80, left: 80 }
    })
    .createData({ values: nightingale })
    .createArcMark({ padAngle: 1, opacity: 0.9, strokeWidth: 0.5 })
    .encodeTheta({
      field: "month",
      fieldType: "ordinal",
      scale: { domain: MONTH_ORDER }
    })
    .encodeR({ field: "value", scale: { domain: [0, 6.5], zero: true } })
    .encodeColor({
      field: "cause",
      layout: "overlay",
      scale: {
        domain: CAUSE_ORDER,
        range: ["#599ad3", "#727272", "#f1595f"]
      }
    })
    .createGuides({
      axes: {
        theta: { title: false },
        radius: {
          ticksAndLabels: { values: [2, 4, 6] },
          title: { text: "Mortality rate", position: "inside" }
        }
      },
      grid: { theta: false, radial: { values: [2, 4, 6] } },
      legend: { position: "right", title: "Cause" }
    });
}
