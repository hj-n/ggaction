export const wrappedBottomTitleTarget = Object.freeze({
  width: 720,
  height: 620,
  margin: Object.freeze({ top: 130, right: 40, bottom: 190, left: 80 }),
  options: Object.freeze({
    text: "Distribution of Acceleration Across Vehicle Origins",
    subtitle: "Kernel density estimates for acceleration, grouped by origin in the cars dataset",
    position: "bottom",
    align: "center",
    offset: 60,
    gap: 12,
    maxWidth: 270,
    wrap: "word",
    lineHeight: 26
  }),
  title: Object.freeze({
    lines: Object.freeze([
      "Distribution of Acceleration",
      "Across Vehicle Origins"
    ]),
    x: 380,
    y: Object.freeze([501, 527]),
    rotation: 0
  }),
  subtitle: Object.freeze({
    lines: Object.freeze([
      "Kernel density estimates for acceleration,",
      "grouped by origin in the cars dataset"
    ]),
    x: 380,
    y: Object.freeze([557, 583]),
    rotation: 0
  }),
  occupiedBounds: Object.freeze({ x: 245, y: 490, width: 270, height: 100 }),
  longTokenFallback: Object.freeze({
    text: "acceleration-density-estimate",
    maxWidth: 70,
    lines: Object.freeze(["acceleratio", "n-density-e", "stimate"])
  })
});
