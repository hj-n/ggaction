import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { init, parse } from "es-module-lexer";

await init;

export function moduleSpecifiers(source) {
  const [imports] = parse(source);
  return imports.map(entry => ({
    specifier: entry.n,
    dynamic: entry.d >= 0
  }));
}

export function resolveLocalModule(file, specifier) {
  const target = path.resolve(path.dirname(file), specifier);
  if (path.extname(target) !== "") return target;
  for (const candidate of [`${target}.js`, path.join(target, "index.js")]) {
    if (existsSync(candidate)) return candidate;
  }
  return `${target}.js`;
}

export function moduleScripts(source) {
  return [...source.matchAll(
    /<script\b(?=[^>]*\btype=["']module["'])[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi
  )].map(match => match[1]);
}

export function collectReachableModules(entries, { boundary } = {}) {
  const queue = [...entries].map(file => path.resolve(file));
  const reachable = new Set();
  while (queue.length > 0) {
    const file = queue.shift();
    if (reachable.has(file) || !existsSync(file)) continue;
    reachable.add(file);
    const source = readFileSync(file, "utf8");
    const specifiers = file.endsWith(".html")
      ? moduleScripts(source)
      : moduleSpecifiers(source)
        .filter(entry => entry.specifier?.startsWith("."))
        .map(entry => entry.specifier);
    for (const specifier of specifiers) {
      const resolved = resolveLocalModule(file, specifier);
      if (boundary && !resolved.startsWith(`${path.resolve(boundary)}${path.sep}`)) {
        continue;
      }
      queue.push(resolved);
    }
  }
  return reachable;
}
