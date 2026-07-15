import { chart, render } from "../../../src/index.js";
import {
  RULE_GEOMETRY_LAYOUT,
  createRuleGeometryReferenceValues
} from "./reference-values.js";

export function createRuleGeometryPrimitives() {
  const values = createRuleGeometryReferenceValues();
  const [vertical, horizontal, verticalInterval, horizontalInterval, diagonal] =
    values.rules;

  return chart()
    .createCanvas({
      width: RULE_GEOMETRY_LAYOUT.width,
      height: RULE_GEOMETRY_LAYOUT.height,
      margin: RULE_GEOMETRY_LAYOUT.margin
    })
    .createData({ values: values.rows })
    .createGraphics({ id: vertical.id, type: "line" })
    .editGraphics({ target: vertical.id, property: "x1", value: vertical.x1 })
    .editGraphics({ target: vertical.id, property: "y1", value: vertical.y1 })
    .editGraphics({ target: vertical.id, property: "x2", value: vertical.x2 })
    .editGraphics({ target: vertical.id, property: "y2", value: vertical.y2 })
    .editGraphics({ target: vertical.id, property: "stroke", value: vertical.stroke })
    .editGraphics({ target: vertical.id, property: "strokeWidth", value: 3 })
    .editGraphics({ target: vertical.id, property: "strokeDash", value: [] })
    .editGraphics({ target: vertical.id, property: "opacity", value: 1 })
    .createGraphics({ id: horizontal.id, type: "line" })
    .editGraphics({ target: horizontal.id, property: "x1", value: horizontal.x1 })
    .editGraphics({ target: horizontal.id, property: "y1", value: horizontal.y1 })
    .editGraphics({ target: horizontal.id, property: "x2", value: horizontal.x2 })
    .editGraphics({ target: horizontal.id, property: "y2", value: horizontal.y2 })
    .editGraphics({ target: horizontal.id, property: "stroke", value: horizontal.stroke })
    .editGraphics({ target: horizontal.id, property: "strokeWidth", value: 3 })
    .editGraphics({ target: horizontal.id, property: "strokeDash", value: [] })
    .editGraphics({ target: horizontal.id, property: "opacity", value: 1 })
    .createGraphics({ id: verticalInterval.id, type: "line" })
    .editGraphics({ target: verticalInterval.id, property: "x1", value: verticalInterval.x1 })
    .editGraphics({ target: verticalInterval.id, property: "y1", value: verticalInterval.y1 })
    .editGraphics({ target: verticalInterval.id, property: "x2", value: verticalInterval.x2 })
    .editGraphics({ target: verticalInterval.id, property: "y2", value: verticalInterval.y2 })
    .editGraphics({ target: verticalInterval.id, property: "stroke", value: verticalInterval.stroke })
    .editGraphics({ target: verticalInterval.id, property: "strokeWidth", value: 3 })
    .editGraphics({ target: verticalInterval.id, property: "strokeDash", value: [] })
    .editGraphics({ target: verticalInterval.id, property: "opacity", value: 1 })
    .createGraphics({ id: horizontalInterval.id, type: "line" })
    .editGraphics({ target: horizontalInterval.id, property: "x1", value: horizontalInterval.x1 })
    .editGraphics({ target: horizontalInterval.id, property: "y1", value: horizontalInterval.y1 })
    .editGraphics({ target: horizontalInterval.id, property: "x2", value: horizontalInterval.x2 })
    .editGraphics({ target: horizontalInterval.id, property: "y2", value: horizontalInterval.y2 })
    .editGraphics({ target: horizontalInterval.id, property: "stroke", value: horizontalInterval.stroke })
    .editGraphics({ target: horizontalInterval.id, property: "strokeWidth", value: 3 })
    .editGraphics({ target: horizontalInterval.id, property: "strokeDash", value: [] })
    .editGraphics({ target: horizontalInterval.id, property: "opacity", value: 1 })
    .createGraphics({ id: diagonal.id, type: "line" })
    .editGraphics({ target: diagonal.id, property: "x1", value: diagonal.x1 })
    .editGraphics({ target: diagonal.id, property: "y1", value: diagonal.y1 })
    .editGraphics({ target: diagonal.id, property: "x2", value: diagonal.x2 })
    .editGraphics({ target: diagonal.id, property: "y2", value: diagonal.y2 })
    .editGraphics({ target: diagonal.id, property: "stroke", value: diagonal.stroke })
    .editGraphics({ target: diagonal.id, property: "strokeWidth", value: 3 })
    .editGraphics({ target: diagonal.id, property: "strokeDash", value: [] })
    .editGraphics({ target: diagonal.id, property: "opacity", value: 1 })
    .createTitle({
      text: "Rule geometry primitives",
      subtitle: "Full-span, bounded, and diagonal endpoints"
    });
}

export function renderRuleGeometryPrimitives(context) {
  return render(createRuleGeometryPrimitives(), context);
}
