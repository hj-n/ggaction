import { isPlainObject } from "../../core/immutable.js";

function requireGraphicSpec(graphicSpec) {
  if (
    !isPlainObject(graphicSpec) ||
    !isPlainObject(graphicSpec.objects) ||
    !Array.isArray(graphicSpec.order)
  ) {
    throw new TypeError("A graphic tree requires objects and order.");
  }
  return graphicSpec;
}

export function findGraphic(graphicSpec, target) {
  requireGraphicSpec(graphicSpec);
  const object = graphicSpec.objects[target];
  if (object !== undefined) {
    return { id: target, object, kind: "object" };
  }
  for (const [ownerId, owner] of Object.entries(graphicSpec.objects)) {
    const itemIndex = owner.items?.findIndex(item => item.id === target);
    if (itemIndex !== undefined && itemIndex !== -1) {
      return {
        id: target,
        object: owner.items[itemIndex],
        kind: "item",
        ownerId,
        owner,
        itemIndex
      };
    }
  }
  return undefined;
}

export function requireGraphic(graphicSpec, target) {
  const found = findGraphic(graphicSpec, target);
  if (found === undefined) {
    throw new Error(`Unknown graphic target "${target}".`);
  }
  return found;
}

export function findGraphicParent(graphicSpec, target) {
  requireGraphicSpec(graphicSpec);
  const found = findGraphic(graphicSpec, target);
  if (found?.kind === "item") {
    return {
      id: found.ownerId,
      object: found.owner,
      kind: "itemOwner",
      index: found.itemIndex
    };
  }
  for (const [id, candidate] of Object.entries(graphicSpec.objects)) {
    const index = candidate.children?.indexOf(target);
    if (index !== undefined && index !== -1) {
      return { id, object: candidate, kind: "parent", index };
    }
  }
  return undefined;
}

export function graphicSiblings(graphicSpec, target) {
  const parent = findGraphicParent(graphicSpec, target);
  if (parent?.kind === "parent") return parent.object.children;
  if (parent?.kind === "itemOwner") {
    return parent.object.items.map(item => item.id);
  }
  return graphicSpec.order;
}

function visitNamed(graphicSpec, id, visitor, path, visited) {
  if (path.includes(id)) {
    throw new Error(`Graphic attachment cycle includes "${id}".`);
  }
  const object = graphicSpec.objects[id];
  if (object === undefined) {
    throw new Error(`Unknown attached graphic "${id}".`);
  }
  if (visited.has(id)) {
    throw new Error(`Graphic "${id}" is attached more than once.`);
  }
  visited.add(id);
  visitor({ id, object, kind: "object", depth: path.length });
  for (const item of object.items ?? []) {
    visitor({
      id: item.id,
      object: item,
      kind: "item",
      ownerId: id,
      depth: path.length + 1
    });
  }
  for (const childId of object.children ?? []) {
    visitNamed(graphicSpec, childId, visitor, [...path, id], visited);
  }
}

export function walkGraphicTree(graphicSpec, visitor) {
  requireGraphicSpec(graphicSpec);
  if (typeof visitor !== "function") {
    throw new TypeError("walkGraphicTree requires a visitor function.");
  }
  const visited = new Set();
  for (const id of graphicSpec.order) {
    visitNamed(graphicSpec, id, visitor, [], visited);
  }
  const orphan = Object.keys(graphicSpec.objects).find(id => !visited.has(id));
  if (orphan !== undefined) {
    throw new Error(`Graphic "${orphan}" is not attached to the graphic tree.`);
  }
}

export function walkGraphicDrawOrder(graphicSpec, visitor) {
  walkGraphicTree(graphicSpec, entry => {
    if (entry.kind === "object") visitor(entry);
  });
}

export function collectGraphicSubtreeIds(graphicSpec, target) {
  const found = requireGraphic(graphicSpec, target);
  if (found.kind === "item") {
    throw new Error("Generated graphic items do not own named subtrees.");
  }
  const ids = [];
  const visit = id => {
    ids.push(id);
    for (const childId of graphicSpec.objects[id].children ?? []) visit(childId);
  };
  visit(target);
  return ids;
}
