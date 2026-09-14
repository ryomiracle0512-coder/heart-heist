import { test } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { begin, snapshot, warp } from "./helpers";
test("record greybox frame baseline at 1920x1080", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await begin(page);
  await warp(page, [0, 1, 12]);
  const samples: number[] = [];
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(500);
    samples.push((await snapshot(page)).fps);
  }
  writeFileSync(
    "docs/evidence/performance-greybox.json",
    JSON.stringify(
      {
        viewport: [1920, 1080],
        preset: "medium",
        browser: "local Chrome",
        sampleFPS: samples,
        average: samples.reduce((a, b) => a + b, 0) / samples.length,
        min: Math.min(...samples),
        note: "Local development build; not a representative-laptop or mobile hardware claim.",
      },
      null,
      2,
    ),
  );
  await page.screenshot({ path: "docs/evidence/05-greybox-baseline.png" });
});
