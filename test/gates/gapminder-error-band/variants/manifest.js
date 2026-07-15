import { loadGapminder } from "../../../support/data.js";
import { defineVisualVariant } from "../../../support/visual-variants.js";
import { ERROR_BAND_LAYOUT } from
  "../../../charts/gapminder-error-band/reference-values.js";
import { createGapminderCurvedBoundaryPrimitives } from
  "../primitive.program.js";

const sharedCallChain = `chart()
  .createCanvas({
    width: 760,
    height: 480,
    margin: { top: 90, right: 150, bottom: 70, left: 80 }
  })
  .createData({ values: gapminder })
  .createErrorBand({
    x: { field: "year", fieldType: "temporal" },
    y: { field: "life_expect" },
    groupBy: "cluster",
    curve: "cardinal",
    boundaries: {
      stroke: "#25364d",
      strokeWidth: 1.4,
      strokeDash: [6, 3],
      opacity: 0.8
    }
  })
  .encodeColor({
    target: "errorBand",
    field: "cluster",
    fieldType: "nominal",
    scale: { palette: "tableau10" }
  })
  .createGuides()
  .createTitle({
    text: "Life Expectancy by Cluster",
    subtitle: "Mean and 95% confidence interval"
  });`;

const overrideCallChain = sharedCallChain.replace(
  "opacity: 0.8\n    }",
  "opacity: 0.8,\n      curve: \"step\"\n    }"
);

const shared = Object.freeze({
  chart: "gapminder-error-band",
  width: ERROR_BAND_LAYOUT.width,
  height: ERROR_BAND_LAYOUT.height,
  colors: ["#334155"],
  regions: [
    { name: "plot", x: 80, y: 90, width: 530, height: 320 }
  ]
});

export const visualVariants = Object.freeze([
  defineVisualVariant({
    ...shared,
    variant: "gapminder-curved-boundaries",
    title: "Cardinal Error Band with Inherited Boundaries",
    callChain: sharedCallChain,
    primitive: createGapminderCurvedBoundaryPrimitives(loadGapminder())
  }),
  defineVisualVariant({
    ...shared,
    variant: "gapminder-boundary-override",
    title: "Cardinal Error Band with Step Boundary Override",
    callChain: overrideCallChain,
    primitive: createGapminderCurvedBoundaryPrimitives(loadGapminder(), {
      boundaryCurve: "step"
    })
  })
]);
