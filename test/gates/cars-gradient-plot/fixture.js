import {
  createDensityPaintReference,
  createGroupedDensityProfileReference,
  createLegendPaintReference
} from "../../oracles/gradient.js";

export const GRADIENT_PLOT_FIELDS = Object.freeze({
  category: "origin",
  values: "__gradientPlot_values",
  intensities: "__gradientPlot_intensities",
  lower: "__gradientPlot_lower",
  upper: "__gradientPlot_upper",
  center: "__gradientPlot_center"
});

export const GRADIENT_PLOT_LAYOUT = Object.freeze({
  width: 620,
  height: 460,
  margin: Object.freeze({ top: 85, right: 170, bottom: 95, left: 80 }),
  bounds: Object.freeze({ left: 80, top: 85, right: 450, bottom: 365 }),
  stripWidth: 72,
  legend: Object.freeze({ x: 500, y: 135, width: 22, height: 170 })
});

const TICKS = Object.freeze([8, 12, 16, 20, 24]);

function scaleY(value, extent) {
  const { top, bottom } = GRADIENT_PLOT_LAYOUT.bounds;
  return bottom - (
    (value - extent[0]) / (extent[1] - extent[0])
  ) * (bottom - top);
}

export function createCarsGradientPlotReference(cars) {
  const density = createGroupedDensityProfileReference(cars, {
    category: "Origin",
    value: "Acceleration",
    bandwidth: "auto",
    extent: "auto",
    steps: 64,
    kernel: "gaussian",
    normalization: "unit"
  });
  const slotWidth = (
    GRADIENT_PLOT_LAYOUT.bounds.right - GRADIENT_PLOT_LAYOUT.bounds.left
  ) / density.categories.length;
  const profiles = density.profiles.map((profile, index) => {
    const centerX = GRADIENT_PLOT_LAYOUT.bounds.left + slotWidth * (index + 0.5);
    return Object.freeze({
      [GRADIENT_PLOT_FIELDS.category]: profile.category,
      [GRADIENT_PLOT_FIELDS.values]: profile.values,
      [GRADIENT_PLOT_FIELDS.intensities]: profile.intensities,
      [GRADIENT_PLOT_FIELDS.lower]: profile.lower,
      [GRADIENT_PLOT_FIELDS.upper]: profile.upper,
      [GRADIENT_PLOT_FIELDS.center]: profile.center,
      count: profile.count,
      x: centerX - GRADIENT_PLOT_LAYOUT.stripWidth / 2,
      centerX,
      y: GRADIENT_PLOT_LAYOUT.bounds.top,
      width: GRADIENT_PLOT_LAYOUT.stripWidth,
      height: GRADIENT_PLOT_LAYOUT.bounds.bottom - GRADIENT_PLOT_LAYOUT.bounds.top,
      centerY: scaleY(profile.center, density.extent),
      fill: createDensityPaintReference(profile, {
        extent: density.extent,
        maximumIntensity: density.maximumIntensity,
        orientation: "vertical",
        opacity: [0, 1]
      })
    });
  });
  const yTicks = TICKS.map(value => Object.freeze({
    value,
    label: String(value),
    y: scaleY(value, density.extent)
  }));

  return Object.freeze({
    ...density,
    profiles: Object.freeze(profiles),
    yTicks: Object.freeze(yTicks),
    legendPaint: createLegendPaintReference({
      orientation: "vertical",
      opacity: [0, 1]
    })
  });
}
