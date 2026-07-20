import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const docsRoot = path.join(root, "docs");
const pagesFile = path.join(docsRoot, "_data/pages.yml");
const actionCatalogFile = path.join(root, "agent_docs/contract/ACTION_INDEX.json");
const pageMetadataFile = path.join(docsRoot, "_data/page_metadata.json");
const outputFile = path.join(docsRoot, "search-index.json");

function pageRegistry(source) {
  return [...source.matchAll(/^- title:\s+(.+)\n((?: {2}.+\n?)+)/gm)].map(match => ({
    title: match[1],
    ...Object.fromEntries([...match[2].matchAll(
      /^ {2}([a-z_]+):\s*(.+)$/gm
    )].map(property => [property[1], property[2]]))
  }));
}

async function pathForUrl(url) {
  if (url === "/") return path.join(docsRoot, "index.md");
  const relative = url.replace(/^\//, "").replace(/\/$/, "");
  const direct = path.join(docsRoot, `${relative}.md`);
  try {
    await access(direct);
    return direct;
  } catch {
    return path.join(docsRoot, relative, "index.md");
  }
}

function frontMatter(source, key) {
  const block = source.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? "";
  return block.match(new RegExp(`^${key}:\\s+(.+)$`, "m"))?.[1];
}

function cleanText(source) {
  return source
    .replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, " ")
    .replace(/\{%[\s\S]*?%\}|\{\{[\s\S]*?\}\}/g, " ")
    .replace(/<!--([\s\S]*?)-->/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[`*_>#|~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function heading(source) {
  const explicit = source.match(/\{#([A-Za-z][A-Za-z0-9_-]*)\}\s*$/)?.[1];
  const label = cleanText(source.replace(/\{#[A-Za-z][A-Za-z0-9_-]*\}\s*$/, ""));
  const id = explicit ?? label.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return { label, id };
}

function sourceSections(source) {
  const body = source.replace(/^---\n[\s\S]*?\n---\n+/, "");
  const sections = [];
  let current = { heading: undefined, body: [] };
  let fence;
  for (const line of body.split("\n")) {
    const marker = line.match(/^(```|~~~)/)?.[1];
    if (marker) {
      fence = fence === marker ? undefined : (fence ?? marker);
      current.body.push(line);
      continue;
    }
    const match = !fence && line.match(/^#{2,3}\s+(.+)$/);
    if (match) {
      sections.push(current);
      current = { heading: heading(match[1]), body: [] };
    } else if (!/^#\s+/.test(line)) {
      current.body.push(line);
    }
  }
  sections.push(current);
  return sections;
}

function summary(text) {
  if (text.length <= 240) return text;
  const shortened = text.slice(0, 237);
  const boundary = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, boundary > 160 ? boundary : 237)}…`;
}

export async function buildDocSearchIndex() {
  const [pagesSource, catalogSource, pageMetadataSource] = await Promise.all([
    readFile(pagesFile, "utf8"),
    readFile(actionCatalogFile, "utf8"),
    readFile(pageMetadataFile, "utf8")
  ]);
  const actions = JSON.parse(catalogSource).actions;
  const pageMetadata = JSON.parse(pageMetadataSource);
  const metadata = new Map(actions.map(action => [action.name, action]));
  const entries = [];

  for (const page of pageRegistry(pagesSource)) {
    const source = await readFile(await pathForUrl(page.url), "utf8");
    const sections = sourceSections(source);
    const pageSummary = pageMetadata[page.url]?.description ??
      frontMatter(source, "description") ?? cleanText(sections[0].body.join("\n"));
    entries.push({
      pageTitle: page.title,
      url: page.url,
      summary: summary(pageSummary),
      keywords: [page.title]
    });
    for (const section of sections.slice(1)) {
      if (!section.heading?.id) continue;
      const actionName = section.heading.label.match(/^([A-Za-z][A-Za-z0-9]*)/)?.[1];
      const action = metadata.get(actionName);
      entries.push({
        pageTitle: page.title,
        sectionTitle: section.heading.label,
        url: `${page.url}#${section.heading.id}`,
        summary: summary(cleanText(section.body.join("\n"))),
        keywords: action
          ? [action.name, action.layer, action.domain]
          : [page.title, section.heading.label]
      });
    }
  }
  return entries;
}

export async function generateDocSearchIndex({ check = false } = {}) {
  const expected = `${JSON.stringify(await buildDocSearchIndex())}\n`;
  if (check) {
    const current = await readFile(outputFile, "utf8");
    if (current !== expected) {
      throw new Error("Generated documentation search index is stale. Run npm run docs:search.");
    }
    return;
  }
  await writeFile(outputFile, expected);
  process.stdout.write("generated compact documentation search index\n");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await generateDocSearchIndex({ check: process.argv.includes("--check") });
}
