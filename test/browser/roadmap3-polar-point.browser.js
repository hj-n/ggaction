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

test("renders both public Polar point charts in a browser", async () => {
  const server = await startStaticServer(repositoryRoot);
  const browser = await chromium.launch({ headless: true });
  try {
    const { page, errors } = await openBrowserPage(
      browser,
      new URL("test/charts/polar-points/", server.baseUrl).href,
      { waitFor: () => window.__polarPoints !== undefined }
    );
    assert.deepEqual(await windowValue(page, "__polarPoints"), {
      cars: { width: 520, height: 520, points: 400 },
      fashion: { width: 560, height: 560, points: 498 }
    });
    assertNoBrowserErrors(errors, "Roadmap 3 Polar points");
    await page.close();
  } finally {
    await browser.close();
    await server.close();
  }
});
