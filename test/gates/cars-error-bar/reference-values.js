export const RULE_GEOMETRY_LAYOUT = Object.freeze({
  width: 720,
  height: 460,
  margin: Object.freeze({ top: 90, right: 40, bottom: 50, left: 80 }),
  domain: Object.freeze([0, 100])
});

export const RULE_GEOMETRY_COLORS = Object.freeze([
  "#4c78a8",
  "#f58518",
  "#54a24b",
  "#e45756",
  "#b279a2"
]);

function map(value, [domainStart, domainEnd], [rangeStart, rangeEnd]) {
  const ratio = (value - domainStart) / (domainEnd - domainStart);
  return Number((rangeStart + ratio * (rangeEnd - rangeStart)).toFixed(10));
}

export function createRuleGeometryReferenceValues() {
  const { width, height, margin, domain } = RULE_GEOMETRY_LAYOUT;
  const bounds = Object.freeze({
    left: margin.left,
    right: width - margin.right,
    top: margin.top,
    bottom: height - margin.bottom
  });
  const x = value => map(value, domain, [bounds.left, bounds.right]);
  const y = value => map(value, domain, [bounds.bottom, bounds.top]);
  const rows = Object.freeze([
    Object.freeze({ xStart: 60, yStart: 92, xEnd: 92, yEnd: 58 })
  ]);
  const rules = Object.freeze([
    Object.freeze({
      id: "verticalSpan",
      channels: Object.freeze({ x: 15 }),
      x1: x(15),
      y1: bounds.top,
      x2: x(15),
      y2: bounds.bottom,
      stroke: RULE_GEOMETRY_COLORS[0]
    }),
    Object.freeze({
      id: "horizontalSpan",
      channels: Object.freeze({ y: 82 }),
      x1: bounds.left,
      y1: y(82),
      x2: bounds.right,
      y2: y(82),
      stroke: RULE_GEOMETRY_COLORS[1]
    }),
    Object.freeze({
      id: "verticalInterval",
      channels: Object.freeze({ x: 38, y: 18, y2: 66 }),
      x1: x(38),
      y1: y(18),
      x2: x(38),
      y2: y(66),
      stroke: RULE_GEOMETRY_COLORS[2]
    }),
    Object.freeze({
      id: "horizontalInterval",
      channels: Object.freeze({ y: 38, x: 52, x2: 88 }),
      x1: x(52),
      y1: y(38),
      x2: x(88),
      y2: y(38),
      stroke: RULE_GEOMETRY_COLORS[3]
    }),
    Object.freeze({
      id: "diagonalInterval",
      channels: Object.freeze({
        x: rows[0].xStart,
        y: rows[0].yStart,
        x2: rows[0].xEnd,
        y2: rows[0].yEnd
      }),
      x1: x(rows[0].xStart),
      y1: y(rows[0].yStart),
      x2: x(rows[0].xEnd),
      y2: y(rows[0].yEnd),
      stroke: RULE_GEOMETRY_COLORS[4]
    })
  ]);

  return Object.freeze({ bounds, rows, rules });
}
