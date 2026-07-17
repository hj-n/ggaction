export function parseFashionTsneCsv(source) {
  if (typeof source !== "string") {
    throw new TypeError("Fashion t-SNE CSV source must be a string.");
  }
  return source.trim().split(/\r?\n/).slice(1).map(line => {
    const [xPosition, yPosition, label, labelName] = line.split(",");
    return {
      x_pos: Number(xPosition),
      y_pos: Number(yPosition),
      label: Number(label),
      label_name: labelName
    };
  });
}
