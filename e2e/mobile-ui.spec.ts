import { test, expect } from "@playwright/test";
import { snapshot } from "./helpers";
for (const width of [844, 667])
  test(`mobile layout and lifecycle ${width}`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width, height: width === 844 ? 390 : 375 },
      hasTouch: true,
      isMobile: true,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://127.0.0.1:5173/");
    await expect(
      page.getByRole("button", { name: /潜入を開始/ }),
    ).toBeEnabled();
    await page.getByRole("button", { name: /潜入を開始/ }).tap();
    const bounds = await page.locator(".touch-button").evaluateAll((buttons) =>
      buttons.map((b) => {
        const r = b.getBoundingClientRect();
        return {
          width: r.width,
          height: r.height,
          left: r.left,
          right: r.right,
          bottom: r.bottom,
        };
      }),
    );
    for (const b of bounds) {
      expect(b.width).toBeGreaterThanOrEqual(48);
      expect(b.height).toBeGreaterThanOrEqual(48);
      expect(b.left).toBeGreaterThanOrEqual(0);
      expect(b.right).toBeLessThanOrEqual(width);
      expect(b.bottom).toBeLessThanOrEqual(width === 844 ? 390 : 375);
    }
    const cdp = await context.newCDPSession(page),
      box = await page.getByTestId("touch-stick").boundingBox();
    if (!box) throw Error("stick missing");
    const x = box.x + box.width / 2,
      y = box.y + box.height / 2;
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ id: 1, x, y }],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ id: 1, x, y: y - 42 }],
    });
    await page.waitForTimeout(300);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchCancel",
      touchPoints: [],
    });
    await page.waitForTimeout(100);
    const stopped = await snapshot(page);
    await page.waitForTimeout(400);
    expect(
      Math.hypot(
        ...[
          (await snapshot(page)).position[0] - stopped.position[0],
          (await snapshot(page)).position[2] - stopped.position[2],
        ],
      ),
    ).toBeLessThan(0.15);
    await page.screenshot({ path: `docs/evidence/mobile/hud-${width}.png` });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole("button", { name: /港に戻る/ })).toBeDisabled();
    await expect(
      page.getByText("スマホを横向きにしてください。横向きで再開できます。"),
    ).toBeVisible();
    await page.setViewportSize({ width, height: width === 844 ? 390 : 375 });
    await page.getByRole("button", { name: "操作と設定" }).tap();
    await page.getByLabel("左利きのタッチ配置").check();
    await page.getByLabel("文字を大きく").check();
    await page.getByRole("button", { name: /港に戻る/ }).tap();
    await expect(page.locator(".touch-controls")).toHaveClass(/left-handed/);
    await page.screenshot({
      path: `docs/evidence/mobile/hud-left-large-${width}.png`,
    });
    await page.getByRole("button", { name: "一時停止", exact: true }).tap();
    await page.reload();
    await expect(
      page.getByRole("button", { name: "続きから", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "続きから", exact: true }).tap();
    await expect(page.locator(".touch-controls")).toHaveClass(/left-handed/);
    expect(errors).toEqual([]);
    await context.close();
  });
test("keyboard camera, shooting and pause require no pointer lock", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: /潜入を開始/ })).toBeEnabled();
  await page.getByRole("button", { name: /潜入を開始/ }).focus();
  await page.keyboard.press("Enter");
  const before = await snapshot(page);
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(400);
  await page.keyboard.up("ArrowRight");
  expect((await snapshot(page)).yaw).toBeLessThan(before.yaw - 0.4);
  await page.keyboard.down("KeyJ");
  await page.waitForTimeout(200);
  await page.keyboard.up("KeyJ");
  expect((await snapshot(page)).mission.stats.shots).toBeGreaterThan(0);
  expect(await page.evaluate(() => !!document.pointerLockElement)).toBe(false);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: /港に戻る/ })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText("現在の目的")).toBeVisible();
});

test("two touch contacts can move, aim and fire together", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:5173/");
  await expect(page.getByRole("button", { name: /潜入を開始/ })).toBeEnabled();
  await page.getByRole("button", { name: /潜入を開始/ }).tap();
  const cdp = await context.newCDPSession(page);
  const stick = await page.getByTestId("touch-stick").boundingBox(),
    fire = await page
      .getByRole("button", { name: "撃つ", exact: true })
      .boundingBox();
  if (!stick || !fire) throw Error("controls missing");
  const p = {
      id: 1,
      x: stick.x + stick.width / 2,
      y: stick.y + stick.height / 2,
    },
    q = { id: 2, x: fire.x + fire.width / 2, y: fire.y + fire.height / 2 };
  const before = await snapshot(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [p],
  });
  p.y -= 42;
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [p],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [p, q],
  });
  q.x += 30;
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [p, q],
  });
  await page.waitForTimeout(350);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  const after = await snapshot(page);
  expect(after.mission.stats.shots).toBeGreaterThan(0);
  expect(Math.abs(after.yaw - before.yaw)).toBeGreaterThan(0.03);
  expect(
    Math.hypot(
      after.position[0] - before.position[0],
      after.position[2] - before.position[2],
    ),
  ).toBeGreaterThan(0.5);
  const shots = after.mission.stats.shots;
  await page.waitForTimeout(600);
  expect((await snapshot(page)).mission.stats.shots).toBe(shots);
  await context.close();
});
