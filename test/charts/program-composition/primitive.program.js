import { chart } from "../../../src/index.js";

function encodedGraphicId(namespace, localId) {
  const encode = value => [...value]
    .map(character => character.codePointAt(0).toString(16).padStart(6, "0"))
    .join("");
  return `g${encode(namespace)}_${encode(localId)}`;
}

const mainCanvas = encodedGraphicId("dashboard-main", "canvas");
const mainPlot = encodedGraphicId("dashboard-main", "plot-main");
const mainPoint = encodedGraphicId("dashboard-main", "point");
const detailCanvas = encodedGraphicId("dashboard-detail", "canvas");
const detailPlot = encodedGraphicId("dashboard-detail", "plot-main");
const detailPoint = encodedGraphicId("dashboard-detail", "point");
const diamond = 7.519884823893;

function diamondCommands(x, y) {
  return [
    { op: "M", x, y: y - diamond },
    { op: "L", x: x + diamond, y },
    { op: "L", x, y: y + diamond },
    { op: "L", x: x - diamond, y },
    { op: "Z" }
  ];
}

export function createProgramCompositionPrimitives() {
  let program = chart()
    .createGraphics({ id: "canvas", type: "canvas" })
    .editGraphics({ target: "canvas", property: "width", value: 528 })
    .editGraphics({ target: "canvas", property: "height", value: 224 })
    .editGraphics({ target: "canvas", property: "background", value: "white" })
    .createGraphics({ id: mainCanvas, type: "canvas", parent: "canvas" })
    .editGraphics({ target: mainCanvas, property: "width", value: 260 })
    .editGraphics({ target: mainCanvas, property: "height", value: 200 })
    .editGraphics({ target: mainCanvas, property: "background", value: "white" })
    .editGraphics({ target: mainCanvas, property: "x", value: 12 })
    .editGraphics({ target: mainCanvas, property: "y", value: 12 })
    .createGraphics({ id: mainPlot, type: "collection", parent: mainCanvas })
    .createGraphics({ id: mainPoint, type: "circle", length: 3, parent: mainPlot })
    .editGraphics({ target: mainPoint, property: "fill", value: "#4c78a8" })
    .editGraphics({ target: mainPoint, property: "x", value: [28, 130, 232] })
    .editGraphics({ target: mainPoint, property: "y", value: [172, 28, 100] })
    .editGraphics({ target: mainPoint, property: "radius", value: 5 })
    .createGraphics({ id: detailCanvas, type: "canvas", parent: "canvas" });
  program = program
    .editGraphics({ target: detailCanvas, property: "width", value: 220 })
    .editGraphics({ target: detailCanvas, property: "height", value: 200 })
    .editGraphics({ target: detailCanvas, property: "background", value: "white" })
    .editGraphics({ target: detailCanvas, property: "x", value: 296 })
    .editGraphics({ target: detailCanvas, property: "y", value: 12 })
    .createGraphics({ id: detailPlot, type: "collection", parent: detailCanvas })
    .createGraphics({ id: detailPoint, type: "collection", parent: detailPlot })
    .editGraphics({
      target: detailPoint,
      property: "items",
      value: [
        { type: "path", properties: { commands: diamondCommands(28, 172), fill: "#54a24b" } },
        { type: "path", properties: { commands: diamondCommands(110, 28), fill: "#54a24b" } },
        { type: "path", properties: { commands: diamondCommands(192, 136), fill: "#54a24b" } }
      ]
    });
  return program;
}
