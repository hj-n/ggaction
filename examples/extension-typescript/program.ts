import { action, ChartProgram } from "ggaction/extension";
import type { FillPaint } from "ggaction/extension";

const extensionFill: FillPaint = {
  type: "linear-gradient",
  from: { x: 0, y: 0.5 },
  to: { x: 1, y: 0.5 },
  stops: [
    { offset: 0, color: "#eff6ff" },
    { offset: 1, color: "#1d4ed8" }
  ]
};

type SetPointOpacityOptions = Record<string, unknown> & {
  target: string;
  value: number;
};

class MyProgram extends ChartProgram {}

const setPointOpacityAction = action<SetPointOpacityOptions>(
  {
    op: "setPointOpacity",
    description: "Set the opacity of a point mark."
  },
  function ({ target, value }) {
    const withTarget = this.graphicSpec.objects[target] === undefined
      ? this.createGraphics({ id: target, type: "circle" })
      : this;
    return withTarget.editGraphics({
      target,
      property: "opacity",
      value
    });
  }
);

const markReadyAction = action(
  {
    op: "markReady",
    description: "Record that extension authoring is complete."
  },
  function () {
    return this;
  }
);

interface MyProgram {
  setPointOpacity: typeof setPointOpacityAction;
  markReady: typeof markReadyAction;
}

MyProgram.prototype.setPointOpacity = setPointOpacityAction;
MyProgram.prototype.markReady = markReadyAction;

export const extensionProgram = new MyProgram()
  .setPointOpacity({ target: "points", value: 0.5 })
  .markReady();

export const extensionPaint = extensionFill;
