---
layout: default
title: PNG Rendering
---

[Documentation home](./index.md) · [Core concepts](./core-concepts.md)

# PNG Rendering

The Node-only `ggaction/png` entry point renders a completed program directly
to a PNG file without opening a browser.

```javascript
import { renderToPNG } from "ggaction/png";

const result = await renderToPNG(program, {
  output: "./output/chart.png"
});

console.log(result.output, result.width, result.height, result.bytes);
```

`renderToPNG` creates missing output directories and uses the same Canvas
renderer as browser output. It therefore reads only the program's fully
materialized `graphicSpec`.

## Render test programs

The repository keeps user-authored programs under `test/programs/` and their
PNG export tests under `test/render/`. Generate all test images with:

```bash
npm run test:render
```

Generated files are written to the ignored `test/output/` directory. Each
render test also verifies the PNG signature and expected image dimensions.
