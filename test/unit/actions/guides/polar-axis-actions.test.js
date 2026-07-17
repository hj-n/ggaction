import { graphicDrawOrder } from "../../../support/graphic-tree.js";
import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../../../src/index.js";

function polarProgram() {
  return chart()
    .createCanvas({ width: 300, height: 300, margin: 30 })
    .createData({ values: [
      { a: 0, r: 0 },
      { a: 10, r: 20 }
    ] })
    .createPointMark()
    .encodeTheta({ field: "a" })
    .encodeR({ field: "r", scale: { zero: true } });
}

test("creates complete theta and radial axes above marks", () => {
  const base = polarProgram();
  const program = base
    .createThetaAxis({ ticksAndLabels: { values: [0, 10] } })
    .createRadialAxis({ ticksAndLabels: { values: [0, 10, 20] } });

  assert.deepEqual(program.semanticSpec.guides.axis, {
    theta: {
      scale: "theta",
      coordinate: "polar",
      title: "a"
    },
    radius: {
      scale: "radius",
      coordinate: "polar",
      title: "r"
    }
  });
  assert.equal(program.graphicSpec.objects.thetaAxisLine.type, "path");
  assert.equal(program.graphicSpec.objects.radialAxisLine.type, "line");
  assert.equal(program.graphicSpec.objects.thetaAxisTicks.items.length, 2);
  assert.equal(program.graphicSpec.objects.radialAxisLabels.items.length, 3);
  assert.equal(program.graphicSpec.objects.radialAxisTitle.properties.x, 210);
  assert.equal(program.graphicSpec.objects.radialAxisTitle.properties.y, 158);
  const order = graphicDrawOrder(program);
  assert.equal(order.indexOf("point") < order.indexOf("thetaAxisLine"), true);
  assert.equal(order.indexOf("point") < order.indexOf("radialAxisLine"), true);
  assert.deepEqual(
    program.trace.children.at(-1).children.map(child => child.op),
    [
      "createRadialAxisLine",
      "createRadialAxisTicks",
      "createRadialAxisLabels",
      "createRadialAxisTitle"
    ]
  );
  assert.equal(base.semanticSpec.guides.axis, undefined);
});

test("edits focused Polar axis components without raw graphic targets", () => {
  const created = polarProgram()
    .createThetaAxis()
    .createRadialAxis();
  const edited = created
    .editThetaAxisLine({ lineWidth: 2 })
    .editThetaAxisTicks({ count: 3, length: 8 })
    .editThetaAxisLabels({ count: 3, fontSize: 12 })
    .editThetaAxisTitle({ text: "Angle" })
    .editRadialAxisLine({ color: "#111827" })
    .editRadialAxisTicks({ values: [0, 20] })
    .editRadialAxisLabels({ values: [0, 20] })
    .editRadialAxisTitle({ offset: 10 });

  assert.equal(edited.graphicSpec.objects.thetaAxisLine.properties.strokeWidth, 2);
  assert.equal(edited.graphicSpec.objects.thetaAxisTicks.items.length >= 2, true);
  assert.equal(edited.semanticSpec.guides.axis.theta.title, "Angle");
  assert.equal(edited.graphicSpec.objects.radialAxisLine.properties.stroke, "#111827");
  assert.equal(edited.graphicSpec.objects.radialAxisTicks.items.length, 2);
  assert.equal(edited.graphicSpec.objects.radialAxisTitle.properties.y, 160);
  assert.equal(created.semanticSpec.guides.axis.theta.title, "a");
});

test("supports an arbitrary radial-axis angle from the aggregate action", () => {
  const program = polarProgram().createRadialAxis({
    angle: 180,
    ticksAndLabels: { values: [0, 20] }
  });
  const line = program.graphicSpec.objects.radialAxisLine.properties;
  assert.equal(Math.abs(line.x2 - 150) < 1e-10, true);
  assert.equal(line.y2, 270);
  assert.equal(program.guideConfigs.axis.radius.layout.angle, 180);
});

test("dispatches createAxes and rematerializes Polar axis consumers", () => {
  const created = polarProgram().createAxes({
    theta: { ticksAndLabels: { values: [0, 10] } },
    radius: { ticksAndLabels: { values: [0, 20] } }
  });
  assert.deepEqual(
    created.trace.children.at(-1).children.map(child => child.op),
    ["createThetaAxis", "createRadialAxis"]
  );
  const before = created.graphicSpec.objects.thetaAxisLine.properties.commands;
  const resized = created.editCanvas({ width: 400, height: 400 });
  assert.notDeepEqual(
    resized.graphicSpec.objects.thetaAxisLine.properties.commands,
    before
  );
  const reversed = resized.editScale({ id: "theta", reverse: true });
  assert.notDeepEqual(
    reversed.graphicSpec.objects.thetaAxisTicks,
    resized.graphicSpec.objects.thetaAxisTicks
  );
});

test("validates Polar axis conflicts before returning partial state", () => {
  const base = polarProgram();
  assert.throws(
    () => base.createThetaAxis({
      ticksAndLabels: { count: 3, values: [0] }
    }),
    /cannot use count and values together/
  );
  assert.throws(
    () => base.createRadialAxis({ angle: Infinity }),
    /angle must be finite/
  );
  assert.equal(base.semanticSpec.guides.axis, undefined);
  assert.equal(base.graphicSpec.objects.thetaAxisLine, undefined);
});
