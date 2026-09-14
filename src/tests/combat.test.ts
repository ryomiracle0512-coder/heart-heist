import { test, expect } from "vitest";
import { freshMission } from "../game/state/mission";
import { attack, reload, combatTimers } from "../game/systems/combat";
import { canSee, updateAI } from "../game/systems/ai";
test("hitscan needs alignment, range and unoccluded target", () => {
  const s = freshMission();
  s.player.position = [0, 1, 0];
  s.guards = [{ ...s.guards[0], position: [0, 1, -2], home: [0, 1, -2] }];
  attack(s, "primary", [1, 0, 0]);
  expect(s.guards[0].health).toBe(100);
  for (let i = 0; i < 3; i++) {
    s.cooldown = 0;
    attack(s, "primary", [0, 0, -1]);
  }
  expect(s.guards[0].health).toBe(0);
  expect(s.stats.hits).toBe(3);
  expect(s.player.ammo).toBe(4);
});
test("carrying blocks firing and reload; no ammo is created", () => {
  const s = freshMission();
  s.heart.mode = "carried";
  attack(s, "primary", [0, 0, -1]);
  expect(s.player.ammo).toBe(8);
  s.player.ammo = 0;
  reload(s);
  expect(s.reloadTime).toBe(0);
  s.heart.mode = "free";
  s.player.reserve = 3;
  reload(s);
  combatTimers(s, 1.5);
  expect(s.player.ammo).toBe(3);
  expect(s.player.reserve).toBe(0);
});
test("cover and field of view hide player; crouching reduces visibility range", () => {
  const s = freshMission();
  const g = s.guards[0];
  g.position = [0, 1, 14];
  g.yaw = 0;
  s.player.position = [0, 0.82, 2];
  expect(canSee(g, s, false)).toBe(true);
  expect(canSee(g, s, true)).toBe(false);
  g.yaw = Math.PI;
  expect(canSee(g, s, false)).toBe(false);
  g.position = [-4, 1, 8];
  g.yaw = 0;
  s.player.position = [-4, 0.82, 2];
  expect(canSee(g, s, false)).toBe(false);
});
test("guards investigate sound without magically tracking hidden player", () => {
  const s = freshMission();
  s.player.position = [-25, 1, 20];
  const g = s.guards[0];
  g.position = [0, 1, 10];
  s.noise = { position: [3, 1, 10], radius: 10, until: 2 };
  updateAI(s, 0.1, false);
  expect(g.mode).toBe("curious");
  expect(g.lastKnown).toEqual([3, 1, 10]);
  s.elapsed = 3;
  s.noise = null;
  updateAI(s, 1, false);
  expect(g.mode).toBe("investigate");
  expect(g.lastKnown).not.toEqual(s.player.position);
});
test("detection builds before attack; wind-up delays damage; breaking sight starts search", () => {
  const s = freshMission();
  s.guards = [
    { ...s.guards[0], position: [0, 1, 10], home: [0, 1, 10], yaw: 0 },
  ];
  s.player.position = [0, 0.82, 7];
  updateAI(s, 0.5, false);
  expect(s.player.health).toBe(100);
  for (let i = 0; i < 25; i++) {
    s.elapsed += 0.1;
    updateAI(s, 0.1, false);
  }
  expect(s.stats.detections).toBeGreaterThan(0);
  expect(s.player.health).toBeLessThan(100);
  s.player.position = [-25, 1, 20];
  updateAI(s, 0.1, false);
  expect(s.guards[0].mode).toBe("search");
});
