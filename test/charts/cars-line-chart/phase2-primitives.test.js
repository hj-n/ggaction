import assert from "node:assert/strict";
import test from "node:test";

import {
  createMonotoneEditCarsLineChart,
  createStepCarsLineChart
} from "../../../examples/cars-line-chart/program.js";
import {
  createMockCanvasContext,
  findCanvasCalls
} from "../../support/canvas.js";
import { loadCars } from "../../support/data.js";
import {
  createConstantDashPrimitives,
  createCurveMonotoneEditPrimitives,
  createCurveStepPrimitives,
  createDashReassignmentPrimitives,
  createGroupReassignmentPrimitives,
  createNamedDashVocabularyPrimitives
} from "./phase2-primitives.program.js";
import {
  DEFAULT_DASH_PATTERNS,
  NAMED_DASH_PATTERNS,
  createCarsLineCurvePrimitiveValues,
  createConstantDashPrimitiveValues,
  createDashReassignmentPrimitiveValues,
  createGroupReassignmentPrimitiveValues,
  createNamedDashPrimitiveValues,
  createMonotoneReferenceCommands,
  createStepReferenceCommands
} from "./phase2-reference-values.js";
import {
  createCarsLineChartPrimitives,
  renderCarsLineChartPrimitives
} from "./primitive.program.js";

const cars = loadCars();

function withoutTrends(graphicSpec) {
  const { trends: _, ...objects } = graphicSpec.objects;
  return { objects, order: graphicSpec.order };
}

test("locks the midpoint step command fixture independently", () => {
  assert.deepEqual(
    createStepReferenceCommands([
      { x: 0, y: 0 },
      { x: 2, y: 2 },
      { x: 4, y: 1 }
    ]),
    [
      { op: "M", x: 0, y: 0 },
      { op: "L", x: 1, y: 0 },
      { op: "L", x: 1, y: 2 },
      { op: "L", x: 2, y: 2 },
      { op: "L", x: 3, y: 2 },
      { op: "L", x: 3, y: 1 },
      { op: "L", x: 4, y: 1 }
    ]
  );
});

test("locks the monotone cubic command fixture independently", () => {
  assert.deepEqual(
    createMonotoneReferenceCommands([
      { x: 0, y: 0 },
      { x: 2, y: 2 },
      { x: 4, y: 1 }
    ]),
    [
      { op: "M", x: 0, y: 0 },
      {
        op: "C",
        x1: 2 / 3,
        y1: 2 / 3,
        x2: 2 - 2 / 3,
        y2: 2,
        x: 2,
        y: 2
      },
      {
        op: "C",
        x1: 8 / 3,
        y1: 2,
        x2: 10 / 3,
        y2: 4 / 3,
        x: 4,
        y: 1
      }
    ]
  );
  assert.throws(
    () => createMonotoneReferenceCommands([
      { x: 1, y: 0 },
      { x: 1, y: 2 }
    ]),
    /strictly increasing x/
  );
});

test("authors the approved-target step geometry with raw primitive commands", () => {
  const values = createCarsLineCurvePrimitiveValues(cars);
  const baseline = createCarsLineChartPrimitives(cars);
  const program = createCurveStepPrimitives(cars);
  const context = createMockCanvasContext();

  renderCarsLineChartPrimitives(program, context);

  assert.deepEqual(program.semanticSpec, baseline.semanticSpec);
  assert.deepEqual(program.graphicSpec.order, baseline.graphicSpec.order);
  assert.deepEqual(withoutTrends(program.graphicSpec), withoutTrends(baseline.graphicSpec));
  assert.deepEqual(
    program.graphicSpec.objects.trends.children.map(
      child => child.properties.commands
    ),
    values.stepCommands
  );
  assert.deepEqual(
    program.graphicSpec.objects.trends.children.map(
      child => child.properties.commands.length
    ),
    [34, 34, 34]
  );
  assert.equal(findCanvasCalls(context, "bezierCurveTo").length, 0);
  assert.equal(findCanvasCalls(context, "lineTo").length, 123);
  assert.deepEqual(baseline.graphicSpec.objects.trends.children.map(
    child => child.properties.commands.length
  ), [12, 12, 12]);
});

test("authors the approved-target monotone edit with cubic commands", () => {
  const values = createCarsLineCurvePrimitiveValues(cars);
  const baseline = createCarsLineChartPrimitives(cars);
  const program = createCurveMonotoneEditPrimitives(cars);
  const context = createMockCanvasContext();

  renderCarsLineChartPrimitives(program, context);

  assert.deepEqual(program.semanticSpec, baseline.semanticSpec);
  assert.deepEqual(program.graphicSpec.order, baseline.graphicSpec.order);
  assert.deepEqual(withoutTrends(program.graphicSpec), withoutTrends(baseline.graphicSpec));
  assert.deepEqual(
    program.graphicSpec.objects.trends.children.map(
      child => child.properties.commands
    ),
    values.monotoneCommands
  );
  assert.deepEqual(
    program.graphicSpec.objects.trends.children.map(
      child => child.properties.strokeWidth
    ),
    [4, 4, 4]
  );
  assert.equal(findCanvasCalls(context, "bezierCurveTo").length, 33);
  assert.equal(findCanvasCalls(context, "lineTo").length, 24);
  assert.deepEqual(baseline.graphicSpec.objects.trends.children.map(
    child => child.properties.strokeWidth
  ), [2, 2, 2]);
});

test("keeps curve primitive programs free of future public curve actions", () => {
  for (const program of [
    createCurveStepPrimitives(cars),
    createCurveMonotoneEditPrimitives(cars)
  ]) {
    const operations = program.trace.children.map(node => node.op);
    assert.equal(operations.includes("editLineMark"), false);
    assert.equal(operations.includes("createLineMark"), false);
    assert.equal(operations.at(-1), "editGraphics");
    assert.deepEqual(program.actionStack, []);
  }
});

test("matches approved curve primitives with user-facing action flows", () => {
  const pairs = [
    [createCurveStepPrimitives(cars), createStepCarsLineChart(cars), "createTitle"],
    [
      createCurveMonotoneEditPrimitives(cars),
      createMonotoneEditCarsLineChart(cars),
      "editLineMark"
    ]
  ];

  for (const [primitive, publicProgram, finalAction] of pairs) {
    const primitiveContext = createMockCanvasContext();
    const publicContext = createMockCanvasContext();
    renderCarsLineChartPrimitives(primitive, primitiveContext);
    renderCarsLineChartPrimitives(publicProgram, publicContext);

    assert.deepEqual(publicProgram.semanticSpec, primitive.semanticSpec);
    assert.deepEqual(publicProgram.graphicSpec, primitive.graphicSpec);
    assert.deepEqual(publicProgram.graphicSpec.order, primitive.graphicSpec.order);
    assert.deepEqual(publicContext.calls, primitiveContext.calls);
    assert.equal(publicProgram.trace.children.at(-1).op, finalAction);
    assert.deepEqual(publicProgram.actionStack, []);
  }
});

test("locks named and default dash recipes independently", () => {
  assert.deepEqual(NAMED_DASH_PATTERNS, {
    solid: [],
    dashed: [6, 4],
    dotted: [1, 3],
    dashdot: [6, 3, 1, 3]
  });
  assert.deepEqual(DEFAULT_DASH_PATTERNS, [
    [], [8, 4], [3, 3], [12, 4], [8, 3, 2, 3]
  ]);
});

test("authors four named dash styles and a matching dash legend", () => {
  const values = createNamedDashPrimitiveValues(cars);
  const program = createNamedDashVocabularyPrimitives(cars);
  const context = createMockCanvasContext();

  renderCarsLineChartPrimitives(program, context);

  assert.deepEqual(values.keys, [8, 4, 6, 3]);
  assert.equal(values.validCars.some(row => row.Cylinders === 5), false);
  assert.deepEqual(
    program.semanticSpec.scales.find(scale => scale.id === "strokeDash").range,
    ["solid", "dashed", "dotted", "dashdot"]
  );
  assert.deepEqual(
    program.graphicSpec.objects.trends.children.map(child => child.properties.strokeDash),
    Object.values(NAMED_DASH_PATTERNS)
  );
  assert.deepEqual(
    program.graphicSpec.objects.seriesLegendSymbols.children.map(
      child => child.properties.strokeDash
    ),
    Object.values(NAMED_DASH_PATTERNS)
  );
  assert.deepEqual(
    program.graphicSpec.objects.seriesLegendLabels.children.map(
      child => child.properties.text
    ),
    ["8", "4", "6", "3"]
  );
  assert.equal(findCanvasCalls(context, "setLineDash").length > 0, true);
});

test("authors a scale-free constant dotted line after legend cleanup", () => {
  const values = createConstantDashPrimitiveValues(cars);
  const program = createConstantDashPrimitives(cars);

  assert.equal(values.series.length, 1);
  assert.deepEqual(program.semanticSpec.layers[0].encoding.strokeDash, {
    datum: "dotted"
  });
  assert.deepEqual(
    program.semanticSpec.scales.map(scale => scale.id),
    ["x", "y", "originDash"]
  );
  assert.equal(program.semanticSpec.guides.legend, undefined);
  assert.deepEqual(program.graphicSpec.order, ["canvas", "trends"]);
  assert.deepEqual(
    program.graphicSpec.objects.trends.children[0].properties.strokeDash,
    [1, 3]
  );
});

test("authors group-only Cylinder series with no scale or legend", () => {
  const values = createGroupReassignmentPrimitiveValues(cars);
  const program = createGroupReassignmentPrimitives(cars);

  assert.deepEqual(values.keys, [8, 4, 6, 3, 5]);
  assert.deepEqual(program.semanticSpec.layers[0].encoding.group, {
    field: "Cylinders",
    fieldType: "nominal"
  });
  assert.equal(program.semanticSpec.layers[0].encoding.strokeDash, undefined);
  assert.equal(program.semanticSpec.guides.legend, undefined);
  assert.equal(program.graphicSpec.objects.trends.children.length, 5);
  assert.deepEqual(
    program.graphicSpec.objects.trends.children.map(child => child.properties.strokeDash),
    [[], [], [], [], []]
  );
});

test("authors dash reassignment with retained old scale and refreshed legend", () => {
  const values = createDashReassignmentPrimitiveValues(cars);
  const program = createDashReassignmentPrimitives(cars);

  assert.deepEqual(values.keys, [8, 4, 6, 3, 5]);
  assert.deepEqual(program.semanticSpec.layers[0].encoding.strokeDash, {
    field: "Cylinders",
    fieldType: "nominal",
    scale: "strokeDash"
  });
  assert.deepEqual(
    program.semanticSpec.scales.map(scale => scale.id),
    ["x", "y", "originDash", "strokeDash"]
  );
  assert.deepEqual(program.semanticSpec.guides.legend.series, {
    channels: ["strokeDash"],
    scales: ["strokeDash"],
    title: "Cylinders"
  });
  assert.deepEqual(
    program.graphicSpec.objects.trends.children.map(child => child.properties.strokeDash),
    DEFAULT_DASH_PATTERNS
  );
  assert.deepEqual(
    program.graphicSpec.objects.seriesLegendLabels.children.map(
      child => child.properties.text
    ),
    ["8", "4", "6", "3", "5"]
  );
});

test("keeps dash and reassignment targets primitive-only", () => {
  for (const program of [
    createNamedDashVocabularyPrimitives(cars),
    createConstantDashPrimitives(cars),
    createGroupReassignmentPrimitives(cars),
    createDashReassignmentPrimitives(cars)
  ]) {
    const operations = program.trace.children.map(node => node.op);
    for (const futureAction of [
      "createLineMark", "encodeGroup", "encodeStrokeDash", "createLegend"
    ]) {
      assert.equal(operations.includes(futureAction), false, futureAction);
    }
    assert.deepEqual(program.actionStack, []);
  }
});
