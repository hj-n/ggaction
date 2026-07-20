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

test("renders every approved composition layout in a browser", async () => {
  const server = await startStaticServer(repositoryRoot);
  const browser = await chromium.launch({ headless: true });
  try {
    const { page, errors } = await openBrowserPage(
      browser,
      new URL("test/charts/program-composition/variants/layouts/", server.baseUrl).href,
      { waitFor: () => window.__compositionLayouts !== undefined }
    );
    assert.deepEqual(await windowValue(page, "__compositionLayouts"), {
      unequal: { width: 792, height: 352, nestedCanvases: 2 },
      nested: { width: 820, height: 618, nestedCanvases: 4 },
      replacement: { width: 772, height: 344, nestedCanvases: 2 }
    });
    assertNoBrowserErrors(errors, "program composition layouts");
    await page.close();
  } finally {
    await browser.close();
    await server.close();
  }
});
