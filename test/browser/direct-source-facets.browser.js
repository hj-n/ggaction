import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

import {
  assertNoBrowserErrors,
  openBrowserPage,
  windowValue
} from "../support/browser.js";
import { startStaticServer } from "../support/static-server.js";

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));

test("renders every approved direct-source facet primitive in a browser", async () => {
  const server = await startStaticServer(repositoryRoot);
  const browser = await chromium.launch({ headless: true });
  try {
    const { page, errors } = await openBrowserPage(
      browser,
      new URL("test/charts/cars-origin-scatterplot-facet/", server.baseUrl).href,
      { waitFor: () => window.__directFacets !== undefined }
    );
    assert.deepEqual(await windowValue(page, "__directFacets"), {
      scatterplot: { width: 932, height: 282, nestedCanvasCount: 3 },
      histogram: { width: 756, height: 578, nestedCanvasCount: 3 }
    });
    assertNoBrowserErrors(errors, "direct-source facets");
    await page.close();
  } finally {
    await browser.close();
    await server.close();
  }
});
