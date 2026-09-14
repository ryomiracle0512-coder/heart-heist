import { expect, type Page } from "@playwright/test";
export async function snapshot(page: Page) {
  return page.evaluate(() => window.__HEIST_DEV__!.snapshot());
}
export async function warp(page: Page, p: [number, number, number], yaw = 0) {
  await page.evaluate(
    ([p, yaw]) =>
      window.__HEIST_DEV__!.teleport(
        p as [number, number, number],
        yaw as number,
      ),
    [p, yaw],
  );
  await page.waitForTimeout(180);
}
export async function walk(page: Page, x: number, z: number, tolerance = 0.55) {
  const deadline = Date.now() + 45000;
  let best = Infinity,
    stuck = 0;
  while (Date.now() < deadline) {
    const { position: p } = await snapshot(page);
    const dist = Math.hypot(x - p[0], z - p[2]);
    if (dist < tolerance) {
      await page.keyboard.up("KeyW");
      return;
    }
    if (dist >= best - 0.02) stuck++;
    else stuck = 0;
    best = dist;
    if (stuck > 15)
      throw new Error(`Walk stuck at ${p.join(",")} toward ${x},${z}`);
    const yaw = Math.atan2(-(x - p[0]), -(z - p[2]));
    await page.evaluate((yaw) => window.__HEIST_DEV__!.look(yaw), yaw);
    await page.keyboard.down("KeyW");
    await page.waitForTimeout(Math.min(200, (dist / 4) * 1000));
  }
  throw Error(`Walk timeout ${x},${z}`);
}
export async function interact(page: Page) {
  await page.keyboard.up("KeyW");
  await page.keyboard.press("KeyE");
  await page.waitForTimeout(160);
}
export async function begin(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("button", { name: /潜入を開始/ })).toBeEnabled();
  await page.getByRole("button", { name: /潜入を開始/ }).click();
}
export async function defeatGuard(page: Page, id: number) {
  for (let i = 0; i < 20; i++) {
    const s = await snapshot(page),
      g = s.mission.guards[id];
    if (g.health === 0) return;
    const dx = g.position[0] - s.position[0],
      dz = g.position[2] - s.position[2];
    await page.evaluate(
      ([yaw, pitch]) => window.__HEIST_DEV__!.look(yaw, pitch),
      [
        Math.atan2(-dx, -dz),
        Math.atan2(
          g.position[1] + 0.15 - (s.position[1] + 0.5),
          Math.hypot(dx, dz),
        ),
      ],
    );
    if (s.mission.player.ammo === 0) {
      await page.keyboard.press("KeyR");
      await page.waitForTimeout(1700);
    }
    await page.mouse.down();
    await page.waitForTimeout(110);
    await page.mouse.up();
    await page.waitForTimeout(350);
  }
  throw Error(`Guard ${id} survived aimed shots`);
}
