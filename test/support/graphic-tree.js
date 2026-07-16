import {
  findGraphicParent,
  walkGraphicDrawOrder,
  walkGraphicTree
} from "../../src/grammar/schemas/graphicTree.js";

function requireProgram(program) {
  if (program?.graphicSpec === undefined) {
    throw new TypeError("Graphic-tree test helpers require a program.");
  }
  return program.graphicSpec;
}

export function graphicTreeSnapshot(program) {
  const graphicSpec = requireProgram(program);
  const nodes = [];
  const drawOrder = [];

  walkGraphicTree(graphicSpec, entry => {
    if (entry.kind !== "object") return;
    const parent = findGraphicParent(graphicSpec, entry.id);
    nodes.push({
      id: entry.id,
      type: entry.object.type,
      parent: parent?.kind === "parent" ? parent.id : null,
      children: [...(entry.object.children ?? [])],
      itemIds: (entry.object.items ?? []).map(item => item.id)
    });
  });
  walkGraphicDrawOrder(graphicSpec, ({ id }) => drawOrder.push(id));

  return {
    roots: [...graphicSpec.order],
    nodes,
    drawOrder
  };
}

export function graphicDrawOrder(program) {
  const graphicSpec = requireProgram(program);
  const ids = [];
  walkGraphicDrawOrder(graphicSpec, ({ id }) => {
    if (id !== "plot-main") ids.push(id);
  });
  return ids;
}

export function concreteGraphicSnapshot(program, { exclude = [] } = {}) {
  const graphicSpec = requireProgram(program);
  const excluded = new Set(exclude);
  return Object.fromEntries(
    Object.entries(graphicSpec.objects)
      .filter(([id]) => !excluded.has(id))
      .map(([id, object]) => {
        const { children: _children, ...concrete } = object;
        return [id, concrete];
      })
  );
}
