import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../../../src/index.js";
import { resolveStoredSelection } from
  "../../../../src/materialization/selection/state.js";

const rows = Object.freeze([
  Object.freeze({ category: "A", split: "early", value: 1 }),
  Object.freeze({ category: "A", split: "late", value: 2 }),
  Object.freeze({ category: "B", split: "early", value: 3 }),
  Object.freeze({ category: "B", split: "late", value: 4 })
]);

function base() {
  return chart()
    .createCanvas({
      width: 520,
      height: 360,
      margin: { top: 60, right: 120, bottom: 70, left: 70 }
    })
    .createData({ values: rows });
}

test("creates a complete violin plot from the shortest positional call", () => {
  const before = base();
  const program = before.createViolinPlot({ x: "category", y: "value" });
  const layer = program.semanticSpec.layers[0];
  const node = program.trace.children.at(-1);

  assert.equal(layer.id, "violinPlot");
  assert.equal(layer.mark.type, "area");
  assert.equal(layer.encoding.x.fieldType, "nominal");
  assert.equal(layer.encoding.y.fieldType, "quantitative");
  assert.equal(program.graphicSpec.objects.violinPlot.items.length, 2);
  assert.deepEqual(node.children.map(child => child.op), [
    "createAreaMark",
    "encodeDensity",
    "createGuides"
  ]);
  assert.ok(program.semanticSpec.guides.axis.x);
  assert.ok(program.semanticSpec.guides.axis.y);
  assert.ok(program.semanticSpec.guides.grid.horizontal);
  assert.equal(program.semanticSpec.guides.legend, undefined);
  assert.equal(before.semanticSpec.layers.length, 0);
});

test("creates split halves, color, fill-owned outlines, and explicit guides", () => {
  const program = base().createViolinPlot({
    id: "violins",
    x: { field: "category", fieldType: "nominal" },
    y: { field: "value", fieldType: "quantitative" },
    split: { field: "split", domain: ["early", "late"] },
    color: {
      field: "split",
      scale: { domain: ["early", "late"], range: ["#2563eb", "#dc2626"] }
    },
    density: {
      bandwidth: 1,
      extent: [0, 5],
      steps: 12,
      width: { band: 0.6, resolve: "independent" }
    },
    area: { opacity: 0.7, strokeWidth: 1.5 },
    guides: {
      axes: false,
      grid: false,
      legend: { title: "Period", direction: "vertical" }
    }
  });
  const paths = program.graphicSpec.objects.violins.items;
  const node = program.trace.children.at(-1);

  assert.equal(paths.length, 4);
  assert.deepEqual(paths.map(path => path.properties.fill), [
    "#2563eb", "#dc2626", "#2563eb", "#dc2626"
  ]);
  assert.deepEqual(
    paths.map(path => path.properties.stroke),
    paths.map(path => path.properties.fill)
  );
  assert.equal(paths.every(path => path.properties.strokeWidth === 1.5), true);
  assert.equal(program.semanticSpec.guides.axis, undefined);
  assert.equal(program.semanticSpec.guides.grid, undefined);
  assert.equal(program.semanticSpec.guides.legend.color.title, "Period");
  assert.deepEqual(node.children.map(child => child.op), [
    "createAreaMark",
    "configureAreaStrokeFromFill",
    "encodeDensity",
    "encodeColor",
    "createGuides"
  ]);
});

test("supports horizontal placement and complete guide opt-out", () => {
  const program = base().createViolinPlot({
    x: { field: "value", scale: { domain: [0, 5] } },
    y: "category",
    density: { bandwidth: 1, extent: [0, 5], steps: 10 },
    guides: false
  });
  const transform = program.semanticSpec.datasets[1].transform[0];

  assert.equal(transform.placement.channel, "y");
  assert.equal(program.semanticSpec.layers[0].encoding.x.field, "value_value");
  assert.equal(program.semanticSpec.layers[0].encoding.y.field, "category");
  assert.deepEqual(program.semanticSpec.guides, {});
  assert.equal(program.graphicSpec.objects.horizontalGridLines, undefined);
});

test("suppresses a redundant category-color legend unless explicitly requested", () => {
  const automatic = base().createViolinPlot({
    x: "category",
    y: "value",
    color: { field: "category" }
  });
  const explicit = base().createViolinPlot({
    x: "category",
    y: "value",
    color: { field: "category" },
    guides: { legend: {} }
  });

  assert.equal(automatic.semanticSpec.guides.legend, undefined);
  assert.ok(explicit.semanticSpec.guides.legend.color);
});

test("preflights invalid positional, split, color, and appearance contracts atomically", () => {
  const before = base();
  assert.throws(
    () => before.createViolinPlot({ x: "value", y: "value" }),
    /one categorical axis and one quantitative axis/
  );
  assert.throws(
    () => before.createViolinPlot({
      x: "category",
      y: "value",
      split: { field: "category" }
    }),
    /split field must differ/
  );
  assert.throws(
    () => before.createViolinPlot({
      x: "category",
      y: "value",
      color: { field: "split" }
    }),
    /color must encode its category or split field/
  );
  assert.throws(
    () => before.createViolinPlot({
      x: "category",
      y: "value",
      color: { field: "category" },
      area: { fill: "red" }
    }),
    /fill cannot be combined with color/
  );
  assert.throws(
    () => before.createViolinPlot({
      x: "category",
      y: "value",
      density: { width: { band: 2 } }
    }),
    /band must be in/
  );
  assert.equal(before.semanticSpec.layers.length, 0);
  assert.equal(before.semanticSpec.datasets.length, 1);
  assert.equal(before.graphicSpec.objects.violinPlot, undefined);
});

test("rematerializes, selects, highlights, and filters at complete profile grain", () => {
  const original = base().createViolinPlot({
    id: "violins",
    x: "category",
    y: "value",
    split: { field: "split" },
    color: { field: "split" },
    density: { bandwidth: 1, extent: [0, 5], steps: 12 },
    guides: false
  });
  const resized = original.editCanvas({ width: 600 });
  const selected = resized.selectMarks({
    target: "violins",
    field: "split",
    op: "eq",
    value: "early"
  });
  const highlighted = selected.highlightMarks({
    selection: "violinsSelection",
    fill: "#111827",
    dimOthers: { opacity: 0.05 }
  });
  const filtered = original.filterMarks({
    target: "violins",
    field: "category",
    op: "eq",
    value: "A"
  });

  assert.notDeepEqual(
    resized.graphicSpec.objects.violins,
    original.graphicSpec.objects.violins
  );
  assert.equal(resolveStoredSelection(selected).keys.length, 2);
  assert.equal(
    highlighted.graphicSpec.objects.violins.items
      .filter(item => item.properties.fill === "#111827").length,
    2
  );
  assert.equal(
    highlighted.graphicSpec.objects.violins.items
      .filter(item => item.properties.opacity === 0.05).length,
    2
  );
  assert.equal(filtered.graphicSpec.objects.violins.items.length, 2);
  assert.deepEqual(filtered.resolvedScales.x.domain, ["A"]);
  assert.equal(original.graphicSpec.objects.violins.items.length, 4);
});

test("replays categorical density per facet and shares compatible overlay scales", () => {
  const source = base().createViolinPlot({
    id: "first",
    x: "category",
    y: "value",
    density: { bandwidth: 1, extent: [0, 5], steps: 12 },
    guides: false
  });
  const overlay = source.createViolinPlot({
    id: "second",
    data: "data",
    x: "category",
    y: "value",
    density: { bandwidth: 1.2, extent: [0, 5], steps: 10 },
    guides: false
  });
  const faceted = source.facet({ field: "split", guides: { legend: false } });

  assert.deepEqual(overlay.semanticSpec.layers.map(layer => [
    layer.encoding.x.scale,
    layer.encoding.y.scale
  ]), [["x", "y"], ["x", "y"]]);
  assert.equal(overlay.graphicSpec.objects.first.items.length, 2);
  assert.equal(overlay.graphicSpec.objects.second.items.length, 2);
  assert.equal(faceted.compositionSpec.children.length, 2);
  for (const id of faceted.compositionSpec.children) {
    const child = faceted.children[id];
    const replayed = child.semanticSpec.datasets.find(dataset =>
      dataset.id.startsWith(`${id}-firstDensityData`)
    );
    assert.ok(replayed);
    assert.equal(replayed.transform[0].placement.type, "category");
    assert.equal(child.graphicSpec.objects.first.items.length, 2);
  }
});
