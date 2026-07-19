import { chart, hconcat } from "../../src/index.js";

function scatterPanel() {
  return chart()
    .createCanvas({
      width: 280,
      height: 220,
      margin: { top: 52, right: 28, bottom: 32, left: 36 },
      background: "#eff6ff"
    })
    .createData({ values: [
      { x: 1, y: 3 },
      { x: 2, y: 5 },
      { x: 3, y: 4 }
    ] })
    .createPointMark({ fill: "#4c78a8" })
    .encodeX({ field: "x" })
    .encodeY({ field: "y" })
    .encodeRadius({ value: 5 })
    .createTitle({ text: "Observed points", titleStyle: { fontSize: 15 } });
}

function placeholderPanel() {
  return chart()
    .createCanvas({ width: 240, height: 220, margin: 36, background: "#f8fafc" })
    .createData({ values: [
      { x: 1, y: 4 },
      { x: 2, y: 7 },
      { x: 3, y: 5 }
    ] })
    .createPointMark({ fill: "#94a3b8" })
    .encodeX({ field: "x" })
    .encodeY({ field: "y" })
    .encodeRadius({ value: 4 });
}

function replacementPanel() {
  return chart()
    .createCanvas({
      width: 260,
      height: 220,
      margin: { top: 52, right: 28, bottom: 32, left: 36 },
      background: "#fff7ed"
    })
    .createData({ values: [
      { category: "A", value: 4 },
      { category: "B", value: 7 },
      { category: "C", value: 5 }
    ] })
    .createBarMark({ fill: "#f58518" })
    .encodeX({ field: "category", fieldType: "nominal" })
    .encodeY({ field: "value" })
    .createTitle({ text: "Replacement bars", titleStyle: { fontSize: 15 } });
}

export function createProgramCompositionExample() {
  return hconcat({
    id: "dashboard",
    programs: [
      { id: "main", program: scatterPanel() },
      { id: "detail", program: placeholderPanel() }
    ]
  })
    .editCompositionLayout({ gap: 24, align: "start", padding: 12 })
    .replaceCompositionChild({ target: "detail", program: replacementPanel() });
}
