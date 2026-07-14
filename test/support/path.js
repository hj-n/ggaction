export function linearPathCommands(points, { close = false } = {}) {
  const commands = [
    { op: "M", x: points[0].x, y: points[0].y },
    ...points.slice(1).map(point => ({ op: "L", x: point.x, y: point.y }))
  ];
  if (close) commands.push({ op: "Z" });
  return commands;
}

export function linearCommandPoints(commands) {
  return commands
    .filter(command => command.op === "M" || command.op === "L")
    .map(command => ({ x: command.x, y: command.y }));
}
