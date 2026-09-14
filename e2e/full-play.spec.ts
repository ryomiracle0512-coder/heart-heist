import { test, expect } from "@playwright/test";
import { begin, walk, interact, snapshot, defeatGuard } from "./helpers";
// Complete traversals: no repositioning, inventory injection or mission shortcuts.
for (const route of ["combat", "stealth", "trade", "mixed"])
  test(`clean start ${route}: walk every leg and pilot escape`, async ({
    page,
  }) => {
    test.setTimeout(240000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await begin(page);
    if (route === "combat") {
      await walk(page, 1, 12);
      await defeatGuard(page, 0);
      await walk(page, 1, -1);
      await interact(page);
      await walk(page, 1, -9);
      await defeatGuard(page, 1);
      await walk(page, -7, -10);
      await walk(page, -7, -23);
      await interact(page);
      await walk(page, -7, -17);
      await walk(page, 8, -17);
    } else if (route === "stealth") {
      await walk(page, -15, -15);
      await interact(page);
      await page.keyboard.down("KeyC");
      await walk(page, -10, -17);
      await walk(page, -10, -10);
      await walk(page, -7, -10);
      await walk(page, -7, -21);
      await interact(page);
      await walk(page, -7, -17);
      await walk(page, 8, -17);
      await interact(page);
    } else {
      await walk(page, -25, 14);
      await interact(page);
      await page.getByRole("button", { name: "箱を探してくる" }).click();
      await walk(page, -26, -8);
      await interact(page);
      await walk(page, -25, 14);
      await interact(page);
      await page.getByRole("button", { name: "箱を渡す", exact: true }).click();
      if (route === "mixed") {
        await walk(page, -15, 12);
        await walk(page, -15, -15);
        await interact(page);
        await walk(page, -15, 10);
      }
      await walk(page, 1, 12);
      await walk(page, 1, -1);
      await interact(page);
      await walk(page, 1, -9);
      await walk(page, 8, -17);
      await interact(page);
    }
    expect((await snapshot(page)).mission.doors.chamber).toBe(true);
    await walk(page, 8, -23);
    await interact(page);
    expect((await snapshot(page)).mission.power.heart).toBe(false);
    await page.keyboard.up("KeyC");
    await interact(page);
    if (route !== "trade") {
      await page.keyboard.press("KeyT");
      await page.waitForTimeout(160);
      expect((await snapshot(page)).mission.heart.mode).toBe("towed");
    }
    await walk(page, 8, -17);
    await walk(page, 20, -17);
    await walk(page, 20, 20);
    await walk(page, -14, 20);
    await interact(page);
    expect((await snapshot(page)).mission.heart.mode).toBe("installed");
    await interact(page);
    await page.keyboard.down("Space");
    await page.waitForTimeout(3200);
    await page.keyboard.up("Space");
    await page.keyboard.down("KeyW");
    await page.keyboard.down("ShiftLeft");
    await expect(
      page.getByText("HEIST COMPLETE / A NEW CAPABILITY"),
    ).toBeVisible({ timeout: 22000 });
    await page.keyboard.up("KeyW");
    await page.keyboard.up("ShiftLeft");
    const end = await snapshot(page);
    if (route === "stealth" || route === "trade")
      expect(end.mission.stats.shots).toBe(0);
    if (route === "combat") expect(end.mission.evidence).toContain("combat");
    if (route === "mixed")
      expect(end.mission.evidence).toEqual(
        expect.arrayContaining(["trade", "side-circuit"]),
      );
    await page.screenshot({ path: `docs/evidence/07-clean-${route}.png` });
    expect(errors).toEqual([]);
  });
