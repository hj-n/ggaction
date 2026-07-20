import { chart } from "../../../src/index.js";
import {
  resolveJitterMaximum,
  resolveJitterOffsets
} from "../../oracles/jitter.js";
import {
  CARS_JITTER_LAYOUT,
  GAPMINDER_JITTER_LAYOUT,
  createCarsJitterRows,
  createGapminderJitterRows
} from "./fixture.js";

function circleCenters(program, target, property) {
  return program.graphicSpec.objects[target].items.map(
    item => item.properties[property]
  );
}

export function createCarsOriginJitterPrimitiveResult(cars) {
  const rows = createCarsJitterRows(cars);
  const base = chart()
    .createCanvas({
      width: CARS_JITTER_LAYOUT.width,
      height: CARS_JITTER_LAYOUT.height,
      margin: CARS_JITTER_LAYOUT.margin
    })
    .createData({ id: "cars-jitter", values: rows })
    .createPointMark({
      id: "observations",
      data: "cars-jitter",
      fill: "#4c78a8",
      opacity: 0.58
    })
    .encodeX({
      target: "observations",
      field: "Origin",
      fieldType: "nominal",
      scale: { domain: ["USA", "Europe", "Japan"] }
    })
    .encodeY({
      target: "observations",
      field: "Acceleration",
      fieldType: "quantitative",
      scale: { domain: [7, 25], zero: false }
    })
    .encodePointRadius({ target: "observations", value: CARS_JITTER_LAYOUT.radius });
  const baseX = circleCenters(base, "observations", "x");
  const maximum = resolveJitterMaximum(
    { band: CARS_JITTER_LAYOUT.band },
    base.resolvedScales.x
  );
  const resolution = resolveJitterOffsets({
    target: "observations",
    channel: "x",
    seed: CARS_JITTER_LAYOUT.seed,
    identities: rows.map(row => row.Name),
    base: baseX,
    maximum,
    plotMinimum: CARS_JITTER_LAYOUT.plot.left,
    plotMaximum: CARS_JITTER_LAYOUT.plot.right,
    halfExtents: CARS_JITTER_LAYOUT.radius,
    slotWidth: base.resolvedScales.x.bandwidth || Math.abs(base.resolvedScales.x.step)
  });
  const program = base
    .editGraphics({ target: "observations", property: "x", value: resolution.final })
    .createGuides({
      axes: {
        x: { title: { text: "Origin" } },
        y: { title: { text: "Acceleration" } }
      },
      grid: { horizontal: true, vertical: false },
      legend: false
    });
  return Object.freeze({ base, maximum, program, resolution, rows });
}

export function createCarsOriginJitterPrimitives(cars) {
  return createCarsOriginJitterPrimitiveResult(cars).program;
}

export function createGapminderClusterJitterPrimitiveResult(gapminder) {
  const rows = createGapminderJitterRows(gapminder);
  const base = chart()
    .createCanvas({
      width: GAPMINDER_JITTER_LAYOUT.width,
      height: GAPMINDER_JITTER_LAYOUT.height,
      margin: GAPMINDER_JITTER_LAYOUT.margin
    })
    .createData({ id: "gapminder-jitter", values: rows })
    .createPointMark({
      id: "observations",
      data: "gapminder-jitter",
      fill: "#e45756",
      opacity: 0.62
    })
    .encodeX({
      target: "observations",
      field: "life_expect",
      fieldType: "quantitative",
      scale: { domain: [45, 85], zero: false }
    })
    .encodeY({
      target: "observations",
      field: "cluster",
      fieldType: "nominal",
      scale: { domain: [0, 1, 2, 3, 4, 5] }
    })
    .encodePointRadius({
      target: "observations",
      value: GAPMINDER_JITTER_LAYOUT.radius
    });
  const baseY = circleCenters(base, "observations", "y");
  const maximum = resolveJitterMaximum(
    { band: GAPMINDER_JITTER_LAYOUT.band },
    base.resolvedScales.y
  );
  const resolution = resolveJitterOffsets({
    target: "observations",
    channel: "y",
    seed: GAPMINDER_JITTER_LAYOUT.seed,
    identities: rows.map(row => row.country),
    base: baseY,
    maximum,
    plotMinimum: GAPMINDER_JITTER_LAYOUT.plot.top,
    plotMaximum: GAPMINDER_JITTER_LAYOUT.plot.bottom,
    halfExtents: GAPMINDER_JITTER_LAYOUT.radius,
    slotWidth: base.resolvedScales.y.bandwidth || Math.abs(base.resolvedScales.y.step)
  });
  const program = base
    .editGraphics({ target: "observations", property: "y", value: resolution.final })
    .createGuides({
      axes: {
        x: { title: { text: "Life expectancy" } },
        y: { title: { text: "Cluster" } }
      },
      grid: { horizontal: false, vertical: true },
      legend: false
    });
  return Object.freeze({ base, maximum, program, resolution, rows });
}

export function createGapminderClusterJitterPrimitives(gapminder) {
  return createGapminderClusterJitterPrimitiveResult(gapminder).program;
}
