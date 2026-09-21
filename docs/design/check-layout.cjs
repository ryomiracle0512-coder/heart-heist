const path = require("node:path");
const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 1000 },
    deviceScaleFactor: 1,
  });
  let errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(
    process.env.HEIST_DESIGN_URL ||
      "http://127.0.0.1:4180/design/control-preview.html",
  );
  let cases = [];
  for (const device of ["phone", "small", "pc"])
    for (const scene of ["explore", "combat", "carry", "flight"])
      for (const size of ["normal", "large"])
        for (const hand of ["right", "left"]) {
          for (const [id, v] of Object.entries({ device, scene, size, hand }))
            await page.locator("#" + id).selectOption(v);
          const issues = await page.evaluate(() => {
            const root = document
              .getElementById("screen")
              .getBoundingClientRect();
            const ids = [
              ".objective",
              ".status",
              ".pause",
              ".alert",
              ".target",
              ".move",
              ".actions",
              ".notification",
              ".keyboard",
            ];
            let a = [];
            for (const id of ids) {
              const el = document.querySelector(id);
              if (
                !el.getClientRects().length ||
                getComputedStyle(el).display === "none"
              )
                continue;
              const r = el.getBoundingClientRect();
              a.push({ id, x: r.x, y: r.y, r: r.right, b: r.bottom });
            }
            let fail = [];
            for (let i = 0; i < a.length; i++) {
              const r = a[i];
              if (
                r.x < root.x ||
                r.r > root.right + 1 ||
                r.y < root.y ||
                r.b > root.bottom + 1
              )
                fail.push("outside " + r.id);
              for (let j = i + 1; j < a.length; j++) {
                const b = a[j];
                if (
                  Math.min(r.r, b.r) - Math.max(r.x, b.x) > 1 &&
                  Math.min(r.b, b.b) - Math.max(r.y, b.y) > 1
                )
                  fail.push("overlap " + r.id + " " + b.id);
              }
            }
            for (const e of document.querySelectorAll("#screen button")) {
              if (!e.getClientRects().length) continue;
              const r = e.getBoundingClientRect();
              if (r.width < 48 || r.height < 48) fail.push("small " + e.id);
            }
            return fail;
          });
          cases.push({ device, scene, size, hand, issues });
        }
  for (const [device, scene, name] of [
    ["phone", "explore", "mobile-exploration"],
    ["small", "carry", "mobile-carry"],
    ["phone", "flight", "mobile-flight"],
    ["pc", "combat", "keyboard-combat"],
    ["portrait", "explore", "portrait-pause"],
  ]) {
    for (const [id, v] of Object.entries({
      device,
      scene,
      size: "normal",
      hand: "right",
    }))
      await page.locator("#" + id).selectOption(v);
    await page
      .locator("#screen")
      .screenshot({ path: path.join(__dirname, "evidence", name + ".png") });
  }
  await page.locator("#device").selectOption("phone");
  await page.getByRole("button", { name: "ほかの操作", exact: true }).click();
  await page.getByRole("button", { name: "装填", exact: true }).click();
  if (!(await page.locator("#dialog-text").innerText()).includes("装填"))
    errors.push("dialog failed");
  await page.keyboard.press("Escape");
  if (await page.locator("#overlay").isVisible()) errors.push("Escape failed");
  const fs = require("fs");
  const result = {
    date: "2026-09-21",
    scope: "Design prototype only; not game or physical-device verification",
    cases,
    errors,
    screenshots: 5,
  };
  fs.writeFileSync(
    path.join(__dirname, "evidence", "layout-check.json"),
    JSON.stringify(result, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        cases: cases.length,
        failures: cases.filter((c) => c.issues.length),
        errors,
      },
      null,
      2,
    ),
  );
  await browser.close();
  if (errors.length || cases.some((c) => c.issues.length)) process.exitCode = 1;
})();
