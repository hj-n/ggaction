import assert from "node:assert/strict";
import test from "node:test";

import { createCarsDensityArea } from "../../examples/cars-density-area/program.js";
import { createCarsHistogram } from "../../examples/cars-histogram/program.js";
import { createCarsLineChart } from "../../examples/cars-line-chart/program.js";
import { createCarsRegressionScatterplot } from
  "../../examples/cars-regression-scatterplot/program.js";
import { createCarsScatterplot } from "../../examples/cars-scatterplot/program.js";
import { createJobsGroupedBar } from "../../examples/jobs-grouped-bar/program.js";
import { createCarsDensityAreaPrimitives } from
  "../charts/density-area/primitive.program.js";
import { createCarsHistogramPrimitives } from
  "../charts/cars-histogram/primitive.program.js";
import { createCarsLineChartPrimitives } from
  "../charts/cars-line-chart/primitive.program.js";
import { createCarsRegressionScatterplotPrimitives } from
  "../charts/regression-scatterplot/primitive.program.js";
import { createCarsScatterplotPrimitives } from
  "../charts/cars-scatterplot/primitive.program.js";
import { createJobsGroupedBarPrimitives } from
  "../charts/jobs-grouped-bar/primitive.program.js";
import { loadCars, loadJobs } from "../support/data.js";

function pathNodes(program) {
  const result = [];
  function visit(node, inheritedType) {
    const type = node.type ?? inheritedType;
    if (node.items !== undefined) {
      for (const item of node.items) visit(item, type);
    } else if (type === "path") {
      result.push(node);
    }
  }
  for (const object of Object.values(program.graphicSpec.objects)) visit(object);
  return result;
}

test("keeps command arrays as the only canonical geometry for every chart path", () => {
  const cars = loadCars();
  const jobs = loadJobs();
  const programs = [
    createCarsScatterplot(cars),
    createCarsScatterplotPrimitives(cars),
    createCarsLineChart(cars),
    createCarsLineChartPrimitives(cars),
    createCarsHistogram(cars),
    createCarsHistogramPrimitives(cars),
    createJobsGroupedBar(jobs),
    createJobsGroupedBarPrimitives(jobs),
    createCarsRegressionScatterplot(cars),
    createCarsRegressionScatterplotPrimitives(cars),
    createCarsDensityArea(cars),
    createCarsDensityAreaPrimitives(cars)
  ];

  const paths = programs.flatMap(pathNodes);
  assert.equal(paths.length > 0, true);
  for (const path of paths) {
    assert.equal(Array.isArray(path.properties.commands), true);
    assert.equal(Object.hasOwn(path.properties, "points"), false);
    assert.equal(Object.hasOwn(path.properties, "closed"), false);
  }
});
