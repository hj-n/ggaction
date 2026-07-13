import { chart, render } from "../../src/index.js";

import { createJobsGroupedBarValues } from "../fixtures/jobsGroupedBarValues.js";

export function createJobsGroupedBarActions(jobs) {
  const width = 720;
  const height = 460;
  const margin = { top: 40, right: 140, bottom: 70, left: 80 };
  const values = createJobsGroupedBarValues(jobs, {
    width,
    height,
    margin,
    band: 0.72
  });

  return chart()
    .createCanvas({ width, height, margin, background: "white" })
    .createData({ id: "jobs", values: values.validJobs })
    .createBarMark({ id: "bars" })
    .encodeX({ field: "year", fieldType: "ordinal" })
    .encodeY({
      field: "perc",
      aggregate: "mean",
      scale: { nice: true, zero: false }
    })
    .encodeColor({
      field: "sex",
      layout: "group",
      scale: { palette: "tableau10" }
    })
    .encodeBarWidth({ band: 0.72 })
    .createGuides({
      axes: {
        x: {
          ticksAndLabels: { labels: { fontSize: 11 } },
          title: { offset: 50 }
        },
        y: { title: { offset: 56 } }
      }
    });
}

export function renderJobsGroupedBarActions(program, canvasContext) {
  render(program, canvasContext);
}
