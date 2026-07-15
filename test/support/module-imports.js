import { existsSync } from "node:fs";
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
