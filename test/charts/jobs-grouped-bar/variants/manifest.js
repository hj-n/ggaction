import { createJobsGroupedBar } from
  "../../../../examples/jobs-grouped-bar/program.js";
import { loadJobs } from "../../../support/data.js";
import { defineVisualVariant } from "../../../support/visual-variants.js";
import { createJobsGroupedBarPrimitives } from "../primitive.program.js";

const jobs = loadJobs();

export const visualVariants = Object.freeze([defineVisualVariant({
  chart: "jobs-grouped-bar",
  variant: "baseline",
  title: "Canonical Jobs Bar Baseline",
  callChain: `chart()
  .createCanvas({
    width: 720,
    height: 460,
    margin: { top: 40, right: 140, bottom: 70, left: 80 }
  })
  .createData({ id: "jobs", values: rows })
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
  .createGuides();`,
  primitive: createJobsGroupedBarPrimitives(jobs),
  userFacing: createJobsGroupedBar(jobs),
  width: 720,
  height: 460,
  colors: ["#4c78a8", "#f58518"],
  regions: [Object.freeze({
    name: "plot",
    x: 80,
    y: 40,
    width: 500,
    height: 350,
    minimumInkPixels: 200
  })]
})]);
