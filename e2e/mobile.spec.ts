import { test, expect, type Page, type CDPSession } from "@playwright/test";
import { snapshot } from "./helpers";
test.use({
  viewport: { width: 844, height: 390 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 1,
});
class Fingers {
  points = new Map<number, { x: number; y: number; id: number }>();
  constructor(public cdp: CDPSession) {}
  async down(id: number, x: number, y: number) {
    this.points.set(id, { id, x, y });
    await this.send("touchStart");
  }
  async move(id: number, x: number, y: number) {
    this.points.set(id, { id, x, y });
    await this.send("touchMove");
  }
  async up(id: number) {
    this.points.delete(id);
    await this.send("touchEnd");
  }
  async send(type: string) {
    await this.cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: [...this.points.values()],
    });
  }
}
async function turn(page: Page, f: Fingers, yaw: number, pitch = 0) {
  for (let i = 0; i < 30; i++) {
    const s = await snapshot(page),
      dyaw = Math.atan2(Math.sin(yaw - s.yaw), Math.cos(yaw - s.yaw)),
      dp = pitch - s.pitch;
    if (Math.abs(dyaw) < 0.015 && Math.abs(dp) < 0.015) return;
    const dx = Math.max(-170, Math.min(170, -dyaw / 0.002)),
      dy = Math.max(-65, Math.min(65, -dp / 0.002));
    await f.down(2, 470, 145);
    await f.move(2, 470 + dx, 145 + dy);
    await page.waitForTimeout(25);
    await f.up(2);
  }
  throw Error("touch look did not reach target angle");
}
async function walkTouch(page: Page, f: Fingers, x: number, z: number) {
  const r = await page.getByTestId("touch-stick").boundingBox();
  if (!r) throw Error("stick absent");
  const cx = r.x + r.width / 2,
    cy = r.y + r.height / 2;
  let on = false;
  const end = Date.now() + 55000;
  while (Date.now() < end) {
    const s = await snapshot(page),
      dx = x - s.position[0],
      dz = z - s.position[2],
      d = Math.hypot(dx, dz);
    if (d < 0.7) {
      if (on) await f.up(1);
      return;
    }
    const yaw = Math.atan2(-dx, -dz);
    const error = Math.abs(
      Math.atan2(Math.sin(yaw - s.yaw), Math.cos(yaw - s.yaw)),
    );
    if (error > 0.1) {
      if (on) {
        await f.up(1);
        on = false;
      }
      await turn(page, f, yaw);
    }
    if (!on) {
      await f.down(1, cx, cy);
      on = true;
    }
    await f.move(1, cx, cy - 42);
    await page.waitForTimeout(Math.min(180, (d / 4.2) * 700));
  }
  throw Error(
    `touch walk timeout ${x},${z}: ${JSON.stringify((await snapshot(page)).position)}`,
  );
}
async function interact(page: Page) {
  await page.locator('[data-action="interact"]').tap();
  await page.waitForTimeout(180);
}
async function extra(page: Page, name: string) {
  await page.getByRole("button", { name: "ほかの操作", exact: true }).tap();
  await page.getByRole("button", { name, exact: true }).tap();
  await page.waitForTimeout(180);
}
async function fight(page: Page, f: Fingers, id: number) {
  for (let i = 0; i < 18; i++) {
    const s = await snapshot(page),
      g = s.mission.guards[id];
    if (g.health <= 0) return;
    const dx = g.position[0] - s.position[0],
      dz = g.position[2] - s.position[2];
    await turn(
      page,
      f,
      Math.atan2(-dx, -dz),
      Math.atan2(
        g.position[1] + 0.15 - (s.position[1] + 0.5),
        Math.hypot(dx, dz),
      ),
    );
    if (s.mission.player.ammo === 0) {
      await extra(page, "装填");
      await page.waitForTimeout(1700);
    }
    const r = await page
      .getByRole("button", { name: "撃つ", exact: true })
      .boundingBox();
    if (!r) throw Error("fire absent");
    await f.down(3, r.x + r.width / 2, r.y + r.height / 2);
    await page.waitForTimeout(500);
    await f.up(3);
  }
  throw Error("guard survived");
}
for (const route of ["trade", "stealth", "combat", "mixed"])
  test(`touch only clean ${route} to escape`, async ({ page }) => {
    test.setTimeout(300000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const f = new Fingers(await page.context().newCDPSession(page));
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: /潜入を開始/ }),
    ).toBeEnabled();
    expect(
      await page.getByLabel("操作方法", { exact: true }).inputValue(),
    ).toBe("touch");
    await page.getByRole("button", { name: /潜入を開始/ }).tap();
    if (route === "combat") {
      await walkTouch(page, f, 1, 12);
      await fight(page, f, 0);
      await walkTouch(page, f, 1, -1);
      await interact(page);
      await walkTouch(page, f, 1, -9);
      await fight(page, f, 1);
      await walkTouch(page, f, -7, -10);
      await walkTouch(page, f, -7, -23);
      await interact(page);
      await walkTouch(page, f, -7, -17);
      await walkTouch(page, f, 8, -17);
    } else if (route === "stealth") {
      await walkTouch(page, f, -15, -15);
      await interact(page);
      await page.getByRole("button", { name: "しゃがむ", exact: true }).tap();
      await walkTouch(page, f, -10, -17);
      await walkTouch(page, f, -10, -10);
      await walkTouch(page, f, -7, -10);
      await walkTouch(page, f, -7, -21);
      await interact(page);
      await walkTouch(page, f, -7, -17);
      await walkTouch(page, f, 8, -17);
      await interact(page);
    } else {
      await walkTouch(page, f, -25, 14);
      await interact(page);
      await page
        .getByRole("button", { name: "箱を探してくる", exact: true })
        .tap();
      await walkTouch(page, f, -26, -8);
      await interact(page);
      await walkTouch(page, f, -25, 14);
      await interact(page);
      await page.getByRole("button", { name: "箱を渡す", exact: true }).tap();
      if (route === "mixed") {
        await walkTouch(page, f, -15, 12);
        await walkTouch(page, f, -15, -15);
        await interact(page);
        await walkTouch(page, f, -15, 10);
      }
      await walkTouch(page, f, 1, 12);
      await walkTouch(page, f, 1, -1);
      await interact(page);
      await walkTouch(page, f, 1, -9);
      await walkTouch(page, f, 8, -17);
      await interact(page);
    }
    expect((await snapshot(page)).mission.doors.chamber).toBe(true);
    await walkTouch(page, f, 8, -23);
    await interact(page);
    expect((await snapshot(page)).mission.power.heart).toBe(false);
    if (
      await page.getByRole("button", { name: "立つ", exact: true }).isVisible()
    )
      await page.getByRole("button", { name: "立つ", exact: true }).tap();
    await interact(page);
    if (route !== "trade") {
      await page.getByRole("button", { name: "牽引へ", exact: true }).tap();
      await page.waitForTimeout(200);
    }
    await page.screenshot({ path: `docs/evidence/mobile/${route}-heart.png` });
    await walkTouch(page, f, 8, -17);
    await walkTouch(page, f, 20, -17);
    await walkTouch(page, f, 20, 20);
    await walkTouch(page, f, -14, 20);
    await interact(page);
    expect((await snapshot(page)).mission.heart.mode).toBe("installed");
    await interact(page);
    const r = await page
      .getByRole("button", { name: "上昇", exact: true })
      .boundingBox();
    if (!r) throw Error("lift absent");
    await f.down(3, r.x + r.width / 2, r.y + r.height / 2);
    await page.waitForTimeout(3300);
    await f.up(3);
    await turn(page, f, 0);
    const st = await page.getByTestId("touch-stick").boundingBox();
    if (!st) throw Error("stick absent");
    await f.down(1, st.x + st.width / 2, st.y + st.height / 2);
    await f.move(1, st.x + st.width / 2, st.y + st.height / 2 - 42);
    await expect(
      page.getByText("HEIST COMPLETE / A NEW CAPABILITY"),
    ).toBeVisible({ timeout: 22000 });
    await f.up(1);
    const result = await snapshot(page);
    if (route === "trade" || route === "stealth")
      expect(result.mission.stats.shots).toBe(0);
    if (route === "combat") expect(result.mission.evidence).toContain("combat");
    if (route === "mixed")
      expect(result.mission.evidence).toEqual(
        expect.arrayContaining(["trade", "side-circuit"]),
      );
    expect(errors).toEqual([]);
    await page.screenshot({
      path: `docs/evidence/mobile/${route}-complete.png`,
    });
  });
