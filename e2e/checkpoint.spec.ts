import { test, expect } from "@playwright/test";
import { begin, warp, interact, snapshot } from "./helpers";
test("reload before and after disconnect preserves doors, inventory and circuit state", async ({
  page,
}) => {
  await begin(page);
  await warp(page, [-15, 1, -15]);
  await interact(page);
  await warp(page, [-8, 2.9, -20.7]);
  await interact(page);
  await page.keyboard.press("Escape");
  await page.reload();
  await page.getByRole("button", { name: "続きから", exact: true }).click();
  expect((await snapshot(page)).mission.inventory).toContain("keycard");
  expect((await snapshot(page)).mission.power.side).toBe(false);
  await warp(page, [8, 1, -18]);
  await interact(page);
  await warp(page, [8, 1, -23]);
  await interact(page);
  await page.keyboard.press("Escape");
  await page.reload();
  await page.getByRole("button", { name: "続きから", exact: true }).click();
  expect((await snapshot(page)).mission.heart.mode).toBe("free");
  expect((await snapshot(page)).mission.alert).toBe("LOCKDOWN");
  await interact(page);
  expect((await snapshot(page)).mission.heart.mode).toBe("carried");
});
test("corrupt save offers a clean restart without crashing", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem("heart-heist.checkpoint.v1", "{broken"),
  );
  await page.reload();
  await expect(page.getByText(/保存データを読み込めません/)).toBeVisible();
  await page.getByRole("button", { name: /潜入を開始/ }).click();
  expect((await snapshot(page)).mission.alert).toBe("CALM");
});
