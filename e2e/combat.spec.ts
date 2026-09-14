import { test, expect } from "@playwright/test";
import { begin, warp, snapshot } from "./helpers";
test("aimed shots disable a guard, reload consumes reserve and kill persists", async ({
  page,
}) => {
  await begin(page);
  await warp(page, [0, 1, 7]);
  for (let i = 0; i < 12; i++) {
    const snap = await snapshot(page);
    const g = snap.mission.guards[0];
    if (g.health === 0) break;
    const dx = g.position[0] - snap.position[0],
      dz = g.position[2] - snap.position[2],
      dist = Math.hypot(dx, dz);
    await page.evaluate(
      ([yaw, pitch]) => window.__HEIST_DEV__!.look(yaw, pitch),
      [
        Math.atan2(-dx, -dz),
        Math.atan2(g.position[1] + 0.15 - (snap.position[1] + 0.5), dist),
      ],
    );
    await page.mouse.down();
    await page.waitForTimeout(150);
    await page.mouse.up();
    await page.waitForTimeout(280);
  }
  expect((await snapshot(page)).mission.guards[0].health).toBe(0);
  await page.keyboard.press("KeyR");
  await page.waitForTimeout(1800);
  expect((await snapshot(page)).mission.player.ammo).toBe(8);
  expect((await snapshot(page)).mission.player.reserve).toBeLessThan(40);
  await page.keyboard.press("Escape");
  await page.reload();
  await page.getByRole("button", { name: "続きから", exact: true }).click();
  expect((await snapshot(page)).mission.guards[0].health).toBe(0);
  await page.screenshot({ path: "docs/evidence/04-combat.png" });
});
