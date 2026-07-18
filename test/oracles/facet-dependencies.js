export function expectedFacetReplay({ anchor, datasets, layerData }) {
  const byId = new Map(datasets.map((dataset, index) => [dataset.id, { dataset, index }]));
  const depths = new Map([[anchor, 0]]);

  function visit(id) {
    if (depths.has(id)) return depths.get(id);
    const entry = byId.get(id);
    if (entry === undefined) throw new Error(`Oracle dataset ${id} is missing.`);
    const depth = visit(entry.dataset.source) + 1;
    depths.set(id, depth);
    return depth;
  }

  const replayIds = new Set();
  for (const data of Object.values(layerData)) {
    let current = data;
    while (current !== anchor) {
      replayIds.add(current);
      current = byId.get(current).dataset.source;
    }
  }
  return [...replayIds]
    .map(id => ({ ...byId.get(id), depth: visit(id) }))
    .sort((left, right) => left.depth - right.depth || left.index - right.index)
    .map(({ dataset }) => dataset.id);
}

