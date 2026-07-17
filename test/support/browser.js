import assert from "node:assert/strict";

export async function openBrowserPage(browser, url, { waitFor } = {}) {
  const page = await browser.newPage();
  const errors = [];
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", error => errors.push(error.message));

  const response = await page.goto(url, { waitUntil: "networkidle" });
  assert.equal(response?.ok(), true, `${url} failed to load`);
  if (waitFor) await page.waitForFunction(waitFor);
  return { page, errors };
}

export async function windowValue(page, name) {
  return page.evaluate(key => window[key], name);
}

export function assertNoBrowserErrors(errors, label) {
  assert.deepEqual(errors, [], `${label} browser errors`);
}
