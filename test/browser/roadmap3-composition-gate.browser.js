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

test("renders every Gate G primitive dashboard in a browser", async () => {
  const server = await startStaticServer(repositoryRoot);
  const browser = await chromium.launch({ headless: true });
  try {
    const { page, errors } = await openBrowserPage(
      browser,
      new URL("test/gates/program-composition/", server.baseUrl).href,
      { waitFor: () => window.__compositionGate !== undefined }
    );
    assert.deepEqual(await windowValue(page, "__compositionGate"), {
      unequal: { width: 792, height: 352, nestedCanvases: 2 },
      nested: { width: 820, height: 618, nestedCanvases: 4 },
      replacement: { width: 772, height: 344, nestedCanvases: 2 }
    });
    assertNoBrowserErrors(errors, "Roadmap 3 program composition Gate G");
    await page.close();
  } finally {
    await browser.close();
    await server.close();
  }
});
