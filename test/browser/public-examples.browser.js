import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

import { publicCharts } from "../../examples/registry.js";
import {
  assertNoBrowserErrors,
  openBrowserPage,
  windowValue
} from "../support/browser.js";
import { startStaticServer } from "../support/static-server.js";

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));
const examples = publicCharts({ browser: true });

let browser;
let server;

test.before(async () => {
  server = await startStaticServer(repositoryRoot);
  browser = await chromium.launch({ headless: true });
});

test.after(async () => {
  await browser?.close();
  await server?.close();
});

assert.equal(examples.length > 0, true);

for (const example of examples) {
  test(`renders ${example.id} at its logical Canvas size`, async () => {
    const { page, errors } = await openBrowserPage(
      browser,
      new URL(`examples/${example.browser.path}`, server.baseUrl).href,
      {
        waitFor: () => {
          const status = document.querySelector("#status")?.textContent ?? "";
          return status.length > 0 && !/^Loading\b/i.test(status);
        }
      }
    );
    const size = await page.locator(example.browser.canvas).evaluate(canvas => ({
      width: canvas.width,
      height: canvas.height
    }));
    assert.deepEqual(size, {
      width: example.width,
      height: example.height
    }, `${example.id} Canvas size`);
    if (example.browser.state) {
      assert.deepEqual(
        await windowValue(page, example.browser.state.global),
        example.browser.state.expected,
        `${example.id} browser state`
      );
    }
    assertNoBrowserErrors(errors, example.id);
    await page.close();
  });
}
