import { createBasicCanvas, createCanvas, editCanvas } from "./actions.js";

export function registerCanvasActions(ProgramClass) {
  ProgramClass.prototype.editCanvas = editCanvas;
  ProgramClass.prototype.createCanvas = createCanvas;
}

export function registerBasicCanvasActions(ProgramClass) {
  ProgramClass.prototype.createCanvas = createBasicCanvas;
}
