import { test, expect } from "@playwright/test";
import { begin, warp } from "./helpers";
test("inspect open abyss from the escape approach", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await begin(page);
  await warp(page, [0, 18, -58]);
  await page.evaluate(() => window.__HEIST_DEV__!.look(0, -0.35));
  await page.waitForTimeout(100);
  await page.screenshot({ path: "docs/evidence/07-abyss.png" });
  expect(errors).toEqual([]);
});
