import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

import { startStaticServer } from "../support/static-server.js";

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));

test("renders both primitive-only Polar point Gate charts in a browser", async () => {
  const server = await startStaticServer(repositoryRoot);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("console", message => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", error => errors.push(error.message));
    const response = await page.goto(
      new URL("test/gates/roadmap3-polar-point/", server.baseUrl).href,
      { waitUntil: "networkidle" }
    );
    assert.equal(response.ok(), true);
    await page.waitForFunction(() => window.__polarPointGate !== undefined);
    assert.deepEqual(await page.evaluate(() => window.__polarPointGate), {
      cars: { width: 520, height: 520, points: 400 },
      fashion: { width: 560, height: 560, points: 498 }
    });
    assert.deepEqual(errors, []);
    await page.close();
  } finally {
    await browser.close();
    await server.close();
  }
});
