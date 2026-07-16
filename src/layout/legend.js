export function measureLegendSymbolHeight(config) {
  return Math.max(...config.symbol.layers.map(layer => {
    if (layer.type === "swatch") return layer.height;
    if (layer.type === "point") return layer.size * 2;
    return layer.lineWidth;
  }));
}

export function measureLegendTextWidth(value) {
  return String(value).length * 7;
}

export function resolveLegendGrid(config, width, count) {
  const labels = config.domain.map(String);
  const itemWidths = labels.map(
    label => width + config.labels.offset + label.length * 7
  );
  const columnCount = Math.min(config.columns ?? count, count);
  const rowCount = Math.ceil(count / columnCount);
  const cells = Array.from({ length: count }, (_, index) => {
    if (config.direction === "horizontal") {
      return { column: index % columnCount, row: Math.floor(index / columnCount) };
    }
    return {
      column: Math.floor(index / rowCount),
      row: index % rowCount
    };
  });
  const actualColumns = Math.max(...cells.map(cell => cell.column)) + 1;
  const actualRows = Math.max(...cells.map(cell => cell.row)) + 1;
  const columnWidths = Array.from({ length: actualColumns }, (_, column) =>
    Math.max(...cells.map((cell, index) =>
      cell.column === column ? itemWidths[index] : 0
    ))
  );
  const gridWidth = columnWidths.reduce((sum, value) => sum + value, 0) +
    config.itemGap * Math.max(0, actualColumns - 1);
  const rowHeight = Math.max(
    config.labels.fontSize,
    measureLegendSymbolHeight(config)
  );
  const gridHeight = rowHeight * actualRows +
    config.itemGap * Math.max(0, actualRows - 1);
  return { cells, columnWidths, gridWidth, gridHeight, rowHeight };
}

export function alignLegendStart(bounds, width, align) {
  if (align === "left") return bounds.x;
  if (align === "right") return bounds.x + bounds.width - width;
  return bounds.x + (bounds.width - width) / 2;
}
