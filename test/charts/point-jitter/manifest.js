import { loadCars, loadGapminder } from "../../support/data.js";
import { defineVisualVariant } from "../../support/visual-variants.js";
import {
  CARS_JITTER_LAYOUT,
  GAPMINDER_JITTER_LAYOUT
} from "./fixture.js";
import {
  createCarsOriginJitterPrimitives,
  createGapminderClusterJitterPrimitives
} from "./primitive.program.js";
import {
  createCarsOriginJitterProgram,
  createGapminderClusterJitterProgram
} from "./public.program.js";

const cars = loadCars();
const gapminder = loadGapminder();

export const carsJitterTargetCallChain = `chart()
  .createCanvas({
    width: 640,
    height: 440,
    margin: { top: 40, right: 30, bottom: 70, left: 70 }
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
  .encodePointRadius({ target: "observations", value: 3.4 })
  .jitterPoints({
    target: "observations",
    channel: "x",
    maxOffset: { band: 0.168 },
    seed: "cars-origin-strip",
    key: "Name"
  })
  .createGuides({
    axes: {
      x: { title: { text: "Origin" } },
      y: { title: { text: "Acceleration" } }
    },
    grid: { horizontal: true, vertical: false },
    legend: false
  });`;

export const gapminderJitterTargetCallChain = `chart()
  .createCanvas({
    width: 680,
    height: 460,
    margin: { top: 40, right: 30, bottom: 70, left: 80 }
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
  .encodePointRadius({ target: "observations", value: 3.4 })
  .jitterPoints({
    target: "observations",
    channel: "y",
    maxOffset: { band: 0.16 },
    seed: "gapminder-cluster-strip",
    key: "country"
  })
  .createGuides({
    axes: {
      x: { title: { text: "Life expectancy" } },
      y: { title: { text: "Cluster" } }
    },
    grid: { horizontal: false, vertical: true },
    legend: false
  });`;

export const visualVariants = Object.freeze([
  defineVisualVariant({
    chart: "cars-origin-jitter",
    variant: "vertical-band",
    title: "Cars Acceleration by Origin",
    callChain: carsJitterTargetCallChain,
    artifact: {
      capability: "point-jitter"
    },
    primitive: () => createCarsOriginJitterPrimitives(cars),
    userFacing: () => createCarsOriginJitterProgram(cars),
    width: CARS_JITTER_LAYOUT.width,
    height: CARS_JITTER_LAYOUT.height,
    colors: ["#334155"],
    regions: [{
      name: "vertical-jitter-points",
      x: 65,
      y: 35,
      width: 550,
      height: 340,
      minimumInkPixels: 420
    }]
  }),
  defineVisualVariant({
    chart: "gapminder-cluster-jitter",
    variant: "horizontal-band",
    title: "Gapminder Life Expectancy by Cluster",
    callChain: gapminderJitterTargetCallChain,
    artifact: {
      capability: "point-jitter"
    },
    primitive: () => createGapminderClusterJitterPrimitives(gapminder),
    userFacing: () => createGapminderClusterJitterProgram(gapminder),
    width: GAPMINDER_JITTER_LAYOUT.width,
    height: GAPMINDER_JITTER_LAYOUT.height,
    colors: ["#334155"],
    regions: [{
      name: "horizontal-jitter-points",
      x: 75,
      y: 35,
      width: 580,
      height: 360,
      minimumInkPixels: 360
    }]
  })
]);
