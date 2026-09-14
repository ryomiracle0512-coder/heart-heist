import { test, expect } from "@playwright/test";
for (const width of [1440, 1000])
  test(`foundation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(page.getByRole("button", { name: /潜入を開始/ })).toBeEnabled({
      timeout: 45000,
    });
    await page.getByRole("button", { name: /潜入を開始/ }).click();
    await expect(page.getByText("現在の目的")).toBeVisible();
    await page.keyboard.down("KeyW");
    await page.waitForTimeout(500);
    await page.keyboard.up("KeyW");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: /港に戻る/ })).toBeVisible();
    await page.getByRole("button", { name: "操作と設定" }).click();
    await expect(page.getByLabel("音量")).toBeVisible();
    await page.getByRole("button", { name: /港に戻る/ }).click();
    await expect(page.getByText("現在の目的")).toBeVisible();
    await page.screenshot({ path: `docs/evidence/01-foundation-${width}.png` });
    await page.reload();
    await expect(
      page.getByRole("button", { name: /潜入を開始/ }),
    ).toBeEnabled();
    expect(errors).toEqual([]);
  });
