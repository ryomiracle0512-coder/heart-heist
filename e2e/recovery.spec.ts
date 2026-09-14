import { test, expect } from "@playwright/test";
import { begin, warp, snapshot } from "./helpers";
test("real guard defeat restores a playable checkpoint within five seconds", async ({
  page,
}) => {
  test.setTimeout(90000);
  await begin(page);
  await warp(page, [0, 1, 7]);
  let defeatedAt = 0;
  const deadline = Date.now() + 80000;
  while (Date.now() < deadline) {
    const s = await snapshot(page);
    if (s.mission.player.health <= 0) {
      defeatedAt = Date.now();
      break;
    }
    await page.waitForTimeout(150);
  }
  expect(defeatedAt).toBeGreaterThan(0);
  await expect
    .poll(async () => (await snapshot(page)).mission.player.health, {
      timeout: 5000,
      intervals: [100],
    })
    .toBeGreaterThan(0);
  await expect
    .poll(async () => (await snapshot(page)).position[2], { timeout: 1500 })
    .toBeGreaterThan(15);
  const revived = await snapshot(page);
  expect(revived.position[2]).toBeGreaterThan(15);
  await page.keyboard.down("KeyW");
  await page.waitForTimeout(350);
  await page.keyboard.up("KeyW");
  expect((await snapshot(page)).position[2]).toBeLessThan(revived.position[2]);
});
