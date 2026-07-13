import { mkdir, readdir, rm } from "node:fs/promises";

const output = new URL("../../.artifacts/test/png/", import.meta.url);
await mkdir(output, { recursive: true });

for (const entry of await readdir(output, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith(".png")) {
    await rm(new URL(entry.name, output));
  }
}
