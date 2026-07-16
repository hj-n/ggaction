import { measureTextWidth } from "../../core/textMetrics.js";
import { findGraphic, requireGraphic } from "./graphicTree.js";

function unionBounds(bounds) {
  if (bounds.length === 0) return undefined;
  return {
    left: Math.min(...bounds.map(item => item.left)),
    right: Math.max(...bounds.map(item => item.right)),
    top: Math.min(...bounds.map(item => item.top)),
    bottom: Math.max(...bounds.map(item => item.bottom))
  };
}

function primitiveBounds(type, properties = {}) {
  const strokeExtent = (properties.strokeWidth ?? 0) / 2;
  if (type === "circle") {
    if (![properties.x, properties.y, properties.radius].every(Number.isFinite)) {
      return undefined;
    }
    const radius = properties.radius + strokeExtent;
    return {
      left: properties.x - radius,
      right: properties.x + radius,
      top: properties.y - radius,
      bottom: properties.y + radius
    };
  }
  if (type === "rect") {
    if (![properties.x, properties.y, properties.width, properties.height]
      .every(Number.isFinite)) return undefined;
    return {
      left: properties.x - strokeExtent,
      right: properties.x + properties.width + strokeExtent,
      top: properties.y - strokeExtent,
      bottom: properties.y + properties.height + strokeExtent
    };
  }
  if (type === "line") {
    if (![properties.x1, properties.y1, properties.x2, properties.y2]
      .every(Number.isFinite)) return undefined;
    return {
      left: Math.min(properties.x1, properties.x2) - strokeExtent,
      right: Math.max(properties.x1, properties.x2) + strokeExtent,
      top: Math.min(properties.y1, properties.y2) - strokeExtent,
      bottom: Math.max(properties.y1, properties.y2) + strokeExtent
    };
  }
  if (type === "text") {
    if (
      !Number.isFinite(properties.x) ||
      !Number.isFinite(properties.y) ||
      !Number.isFinite(properties.fontSize) ||
      typeof properties.text !== "string"
    ) return undefined;
    const width = measureTextWidth(properties.text, properties);
    const align = properties.textAlign ?? "left";
    const left = align === "center" ? -width / 2 :
      ["right", "end"].includes(align) ? -width : 0;
    const baseline = properties.textBaseline ?? "alphabetic";
    const [top, bottom] = baseline === "middle"
      ? [-properties.fontSize / 2, properties.fontSize / 2]
      : ["top", "hanging"].includes(baseline)
        ? [0, properties.fontSize]
        : ["bottom", "ideographic"].includes(baseline)
          ? [-properties.fontSize, 0]
          : [-properties.fontSize * 0.8, properties.fontSize * 0.2];
    const rotation = properties.rotation ?? 0;
    const cosine = Math.cos(rotation);
    const sine = Math.sin(rotation);
    const corners = [
      [left, top],
      [left + width, top],
      [left + width, bottom],
      [left, bottom]
    ].map(([x, y]) => ({
      x: properties.x + x * cosine - y * sine,
      y: properties.y + x * sine + y * cosine
    }));
    return {
      left: Math.min(...corners.map(point => point.x)),
      right: Math.max(...corners.map(point => point.x)),
      top: Math.min(...corners.map(point => point.y)),
      bottom: Math.max(...corners.map(point => point.y))
    };
  }
  if (type === "path") {
    const commands = properties.commands;
    if (!Array.isArray(commands)) return undefined;
    const points = commands.flatMap(command => {
      if (command.op === "M" || command.op === "L") return [{ x: command.x, y: command.y }];
      if (command.op === "C") return [
        { x: command.x1, y: command.y1 },
        { x: command.x2, y: command.y2 },
        { x: command.x, y: command.y }
      ];
      return [];
    }).filter(point => Number.isFinite(point.x) && Number.isFinite(point.y));
    if (points.length === 0) return undefined;
    return {
      left: Math.min(...points.map(point => point.x)) - strokeExtent,
      right: Math.max(...points.map(point => point.x)) + strokeExtent,
      top: Math.min(...points.map(point => point.y)) - strokeExtent,
      bottom: Math.max(...points.map(point => point.y)) + strokeExtent
    };
  }
  return undefined;
}

function objectBounds(graphicSpec, id, object, ancestors) {
  if (ancestors.includes(id)) {
    throw new Error(`Graphic attachment cycle includes "${id}".`);
  }
  const own = object.items === undefined
    ? primitiveBounds(object.type, object.properties)
    : unionBounds(object.items.flatMap(item => {
        const bounds = primitiveBounds(item.type ?? object.type, item.properties);
        return bounds === undefined ? [] : [bounds];
      }));
  const descendants = (object.children ?? []).flatMap(childId => {
    const child = findGraphic(graphicSpec, childId);
    if (child?.kind !== "object") {
      throw new Error(`Unknown attached graphic "${childId}".`);
    }
    const bounds = objectBounds(graphicSpec, childId, child.object, [...ancestors, id]);
    return bounds === undefined ? [] : [bounds];
  });
  return unionBounds([...(own === undefined ? [] : [own]), ...descendants]);
}

export function resolveConcreteGraphicBounds(graphicSpec, target) {
  const found = requireGraphic(graphicSpec, target);
  if (found.kind === "item") {
    return primitiveBounds(found.object.type ?? found.owner.type, found.object.properties);
  }
  return objectBounds(graphicSpec, found.id, found.object, []);
}

export function unionConcreteGraphicBounds(graphicSpec, targets) {
  if (!Array.isArray(targets)) {
    throw new TypeError("Graphic bounds targets must be an array.");
  }
  return unionBounds(targets.flatMap(target => {
    const bounds = resolveConcreteGraphicBounds(graphicSpec, target);
    return bounds === undefined ? [] : [bounds];
  }));
}
