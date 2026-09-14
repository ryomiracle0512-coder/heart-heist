import { test, expect } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { begin, warp, snapshot, interact } from "./helpers";
test("presentation, quality settings, narrow viewport and 1080p frame measurements", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1920, height: 1080 });
  await begin(page);
  await warp(page, [0, 1, 12]);
  const samples: number[] = [];
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(500);
    samples.push((await snapshot(page)).fps);
  }
  writeFileSync(
    "docs/evidence/performance-presentation.json",
    JSON.stringify(
      {
        viewport: [1920, 1080],
        preset: "medium",
        browser: "local Chrome",
        sampleFPS: samples,
        average: samples.reduce((a, b) => a + b, 0) / samples.length,
        min: Math.min(...samples),
        note: "Local Chrome development build with procedural presentation and audio; not mobile or general PC hardware evidence.",
      },
      null,
      2,
    ),
  );
  expect(Math.min(...samples)).toBeGreaterThanOrEqual(30);
  for (const width of [1440, 1000]) {
    await page.setViewportSize({ width, height: 900 });
    await page.keyboard.press("Escape");
    await page.screenshot({ path: `docs/evidence/06-menu-${width}.png` });
    await page.getByRole("button", { name: "操作と設定" }).click();
    await page.getByRole("combobox").selectOption("low");
    await page.getByRole("button", { name: /港に戻る/ }).click();
    await warp(page, [-15, 1, -15]);
    await interact(page);
    await page.screenshot({ path: `docs/evidence/06-suspicious-${width}.png` });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});
