import { chart } from "../../src/index.js";

function createJobsBar(jobs, { field = "perc", layout = "group" } = {}) {
  const rows = jobs.filter(
    row =>
      Number.isFinite(row.year) &&
      Number.isFinite(row[field]) &&
      typeof row.sex === "string" &&
      row.sex.length > 0
  );

  return chart()
    .createCanvas({
      width: 720,
      height: 460,
      margin: { top: 40, right: 140, bottom: 70, left: 80 }
    })
    .createData({ id: "jobs", values: rows })
    .createBarMark({ id: "bars" })
    .encodeX({ field: "year", fieldType: "ordinal" })
    .encodeY({
      field,
      aggregate: "mean",
      scale: { nice: true, zero: false }
    })
    .encodeColor({
      field: "sex",
      layout,
      scale: { palette: "tableau10" }
    })
    .encodeBarWidth({ band: 0.72 })
    .createGuides();
}

export function createJobsGroupedBar(jobs) {
  return createJobsBar(jobs);
}

export function createJobsOverlayBar(jobs) {
  return createJobsBar(jobs, { layout: "overlay" });
}

export function createJobsDivergingBar(jobs) {
  return createJobsBar(jobs, { field: "signedPerc", layout: "diverging" });
}
