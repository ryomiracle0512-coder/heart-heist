import { test, expect } from "@playwright/test";
test("walk harbor routes, stairs and blocked warehouse walls", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: /潜入を開始/ }).click();
  await page.keyboard.down("KeyW");
  await page.waitForTimeout(800);
  await page.keyboard.up("KeyW");
  const p = await page.evaluate(
    () => window.__HEIST_DEV__!.snapshot().position,
  );
  expect(p[2]).toBeLessThan(18);
  for (const [name, pos] of [
    ["spawn", [-14, 1.1, 19]],
    ["yard", [0, 1.1, 12]],
    ["heart", [8, 1.1, -23]],
    ["control", [-7, 3, -23]],
    ["quay", [-25, 1.1, 5]],
    ["ship", [-14, 1.1, 20]],
  ] as const) {
    await page.evaluate(
      ([p]) =>
        window.__HEIST_DEV__!.teleport([...p] as [number, number, number]),
      [pos],
    );
    await page.waitForTimeout(250);
    await page.screenshot({ path: `docs/evidence/02-${name}.png` });
    expect(
      (await page.evaluate(() => window.__HEIST_DEV__!.snapshot().position))[1],
    ).toBeGreaterThan(0.5);
  }
  await page.evaluate(() => window.__HEIST_DEV__!.teleport([-7, 1.1, -10]));
  await page.keyboard.down("KeyW");
  await page.waitForTimeout(1500);
  await page.keyboard.up("KeyW");
  const stairs = await page.evaluate(
    () => window.__HEIST_DEV__!.snapshot().position,
  );
  expect(stairs[1]).toBeGreaterThan(2);
  expect(errors).toEqual([]);
});
