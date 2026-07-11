import { action } from "../core/action.js";
import {
  createGraphicBounds,
  DEFAULT_MARGIN,
  normalizeMargin,
  validateCanvasState
} from "../core/canvasLayout.js";
import { cloneAndFreeze } from "../core/immutable.js";

const CANVAS_OPTIONS = Object.freeze([
  "width",
  "height",
  "background",
  "margin"
]);

function validateOptions(args, operation, { allowEmpty = false } = {}) {
  const keys = Object.keys(args);

  if (!allowEmpty && keys.length === 0) {
    throw new TypeError(`${operation} requires at least one option.`);
  }

  for (const key of keys) {
    if (!CANVAS_OPTIONS.includes(key)) {
      throw new Error(`Unknown ${operation} option "${key}".`);
    }
  }
}

function requireCanvas(program) {
  const canvas = program.graphicSpec.objects.canvas;

  if (canvas?.type !== "canvas") {
    throw new Error("editCanvas requires an existing canvas.");
  }

  return canvas;
}

function resolveCanvasState(program, args) {
  const canvas = requireCanvas(program);
  const baseMargin = program.context.currentMargin ?? DEFAULT_MARGIN;
  const state = {
    width: Object.hasOwn(args, "width")
      ? args.width
      : canvas.properties.width,
    height: Object.hasOwn(args, "height")
      ? args.height
      : canvas.properties.height,
    background: Object.hasOwn(args, "background")
      ? args.background
      : canvas.properties.background,
    margin: Object.hasOwn(args, "margin")
      ? normalizeMargin(args.margin, baseMargin)
      : baseMargin
  };

  validateCanvasState(state);
  return cloneAndFreeze(state);
}

const editCanvas = action(
  {
    op: "editCanvas",
    description: "Edit canvas properties and authoring bounds."
  },
  function (args = {}) {
    validateOptions(args, "editCanvas");
    const state = resolveCanvasState(this, args);
    let next = this;

    for (const property of ["width", "height", "background"]) {
      if (Object.hasOwn(args, property)) {
        next = next.editGraphics({
          target: "canvas",
          property,
          value: state[property]
        });
      }
    }

    return next._withContext({
      currentMargin: state.margin,
      currentGraphicBounds: createGraphicBounds(state)
    });
  }
);

export function registerCanvasActions(ProgramClass) {
  ProgramClass.prototype.editCanvas = editCanvas;
}
