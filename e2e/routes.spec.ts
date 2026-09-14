import { test, expect } from "@playwright/test";
import { begin, warp, walk, interact, snapshot, defeatGuard } from "./helpers";
for (const method of ["combat", "stealth", "trade", "mixed"])
  test(`${method}: shared doors, heart transport and installation`, async ({
    page,
  }) => {
    test.setTimeout(150000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await begin(page);
    if (method === "combat") {
      await warp(page, [1, 1, -1]);
      await interact(page);
      expect((await snapshot(page)).mission.doors.main).toBe(true);
      await warp(page, [0, 1, 7]);
      await defeatGuard(page, 0);
      await warp(page, [7, 1, -7]);
      await defeatGuard(page, 1);
      await warp(page, [22, 1, -18]);
      await defeatGuard(page, 2);
      await warp(page, [-7, 2.9, -23]);
      await interact(page);
    }
    if (method === "stealth" || method === "mixed") {
      await warp(page, [-15, 1, -15]);
      await interact(page);
      expect((await snapshot(page)).mission.power.side).toBe(false);
      await warp(page, [-8, 2.9, -20.7]);
      await interact(page);
      expect((await snapshot(page)).mission.inventory).toContain("keycard");
      if (method === "mixed") {
        await warp(page, [1, 1, -1]);
        await interact(page);
        await warp(page, [0, 1, 7]);
        await defeatGuard(page, 0);
        await warp(page, [7, 1, -7]);
        await defeatGuard(page, 1);
        await warp(page, [22, 1, -18]);
        await defeatGuard(page, 2);
      }
      await warp(page, [8, 1, -18]);
      await interact(page);
    }
    if (method === "trade") {
      await warp(page, [-25, 1, 14]);
      await interact(page);
      await page.getByRole("button", { name: "箱を探してくる" }).click();
      await warp(page, [-26, 1, -8]);
      await interact(page);
      await warp(page, [-25, 1, 14]);
      await interact(page);
      await page.getByRole("button", { name: "箱を渡す", exact: true }).click();
      expect((await snapshot(page)).mission.inventory).toContain("code");
      await warp(page, [1, 1, -1]);
      await interact(page);
      await warp(page, [8, 1, -18]);
      await interact(page);
    }
    expect((await snapshot(page)).mission.doors.chamber).toBe(true);
    await warp(page, [8, 1, -23]);
    await page.screenshot({ path: `docs/evidence/03-${method}-heart.png` });
    await interact(page);
    expect((await snapshot(page)).mission.alert).toBe("LOCKDOWN");
    await interact(page);
    expect((await snapshot(page)).mission.heart.mode).toBe("carried");
    await walk(page, 8, -17);
    await walk(page, 20, -17);
    await walk(page, 20, 20);
    await walk(page, -14, 20);
    await interact(page);
    expect((await snapshot(page)).mission.heart.mode).toBe("installed");
    expect((await snapshot(page)).mission.alert).toBe("ESCAPE");
    await page.screenshot({ path: `docs/evidence/03-${method}-installed.png` });
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
    await page.screenshot({ path: `docs/evidence/05-${method}-complete.png` });
    expect((await snapshot(page)).mission.alert).toBe("COMPLETE");
    expect(errors).toEqual([]);
  });
