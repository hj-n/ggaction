import { createCarsRegressionScatterplotValues } from "../reference-values.js";

const LAYOUT = Object.freeze({
  width: 760,
  height: 480,
  margin: Object.freeze({ top: 40, right: 80, bottom: 70, left: 190 })
});

const LEGEND = Object.freeze({
  originX: 23,
  offset: 80,
  padding: 10,
  background: Object.freeze({
    x: 13,
    y: 42,
    width: 97,
    height: 356,
    fill: "#f8fafc",
    stroke: "#94a3b8",
    strokeWidth: 1
  }),
  labelStyle: Object.freeze({
    fill: "#475569",
    fontSize: 12,
    fontFamily: "sans-serif",
    fontWeight: "normal"
  }),
  titleStyle: Object.freeze({
    fill: "#0f172a",
    fontSize: 14,
    fontFamily: "sans-serif",
    fontWeight: 700
  })
});

function translateSymbol(symbol, delta) {
  const properties = structuredClone(symbol.properties);
  if (Number.isFinite(properties.x)) properties.x += delta;
  if (Array.isArray(properties.commands)) {
    properties.commands = properties.commands.map(command =>
      Number.isFinite(command.x)
        ? { ...command, x: command.x + delta }
        : { ...command }
    );
  }
  return { type: symbol.type, properties };
}

export function createLeftLegendPrimitiveValues(cars) {
  const chart = createCarsRegressionScatterplotValues(cars, LAYOUT);
  const sourceOriginX = chart.legends.origin.title.x;
  const delta = LEGEND.originX - sourceOriginX;
  const originItems = chart.legends.origin.items.map(item => ({
    ...item,
    line: {
      ...item.line,
      x1: item.line.x1 + delta,
      x2: item.line.x2 + delta
    },
    symbol: translateSymbol(item.symbol, delta),
    label: { ...item.label, x: item.label.x + delta }
  }));
  const sizeItems = chart.legends.size.items.map(item => ({
    ...item,
    symbol: { ...item.symbol, x: item.symbol.x + delta },
    label: { ...item.label, x: item.label.x + delta }
  }));

  return Object.freeze({
    layout: LAYOUT,
    chart,
    legend: Object.freeze({
      ...LEGEND,
      origin: Object.freeze({
        title: Object.freeze({
          ...chart.legends.origin.title,
          x: LEGEND.originX
        }),
        items: Object.freeze(originItems)
      }),
      size: Object.freeze({
        title: Object.freeze({
          ...chart.legends.size.title,
          x: LEGEND.originX
        }),
        items: Object.freeze(sizeItems)
      })
    })
  });
}
