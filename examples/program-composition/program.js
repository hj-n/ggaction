import { chart, hconcat } from "../../src/index.js";

function scatterPanel() {
  return chart()
    .createCanvas({ width: 260, height: 200, margin: 28 })
    .createData({ values: [
      { x: 1, y: 3 },
      { x: 2, y: 5 },
      { x: 3, y: 4 }
    ] })
    .createPointMark({ fill: "#4c78a8" })
    .encodeX({ field: "x" })
    .encodeY({ field: "y" })
    .encodeRadius({ value: 5 });
}

function barPanel() {
  return chart()
    .createCanvas({ width: 220, height: 180, margin: 28 })
    .createData({ values: [
      { category: "A", value: 4 },
      { category: "B", value: 7 },
      { category: "C", value: 5 }
    ] })
    .createBarMark({ fill: "#f58518" })
    .encodeX({ field: "category", fieldType: "nominal" })
    .encodeY({ field: "value" });
}

function replacementPanel() {
  return chart()
    .createCanvas({ width: 220, height: 200, margin: 28 })
    .createData({ values: [
      { x: 1, y: 2 },
      { x: 2, y: 6 },
      { x: 3, y: 3 }
    ] })
    .createPointMark({ fill: "#54a24b", shape: "diamond" })
    .encodeX({ field: "x" })
    .encodeY({ field: "y" })
    .encodeRadius({ value: 6 });
}

export function createProgramCompositionExample() {
  return hconcat({
    id: "dashboard",
    programs: [
      { id: "main", program: scatterPanel() },
      { id: "detail", program: barPanel() }
    ]
  })
    .editCompositionLayout({ gap: 24, align: "start", padding: 12 })
    .replaceCompositionChild({ target: "detail", program: replacementPanel() });
}
