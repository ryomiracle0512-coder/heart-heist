import { test, expect, afterEach } from "vitest";
import {
  emit,
  input,
  clearInput,
  setMove,
  movement,
  lookDelta,
  consume,
  tap,
} from "../game/core/input";
import { assistAim } from "../game/systems/aim";
import { freshMission } from "../game/state/mission";
import { runtime } from "../game/state/store";
afterEach(clearInput);
test("independent owners do not release another source", () => {
  emit("primary", true, "finger");
  emit("primary", true, "mouse");
  emit("primary", false, "mouse");
  expect(input.held.has("primary")).toBe(true);
  emit("primary", false, "finger");
  expect(input.held.has("primary")).toBe(false);
});
test("analog diagonal is capped while small movement keeps its magnitude", () => {
  setMove(1, 1);
  expect(Math.hypot(movement().x, movement().z)).toBeCloseTo(1);
  setMove(0.2, 0.3);
  expect(movement()).toEqual({ x: 0.2, z: 0.3 });
  clearInput();
  expect(movement()).toEqual({ x: 0, z: 0 });
});
test("keyboard angular speed is independent of frame rate", () => {
  emit("lookRight", true);
  for (const fps of [30, 60, 120]) {
    let angle = 0;
    for (let i = 0; i < fps; i++) angle += lookDelta(1 / fps, 1).yaw;
    expect(angle).toBeCloseTo((-Math.PI / 180) * 100);
  }
});
test("tap remains pending exactly once after pointer release", () => {
  tap("interact");
  expect(input.held.has("interact")).toBe(false);
  expect(consume("interact")).toBe(true);
  expect(consume("interact")).toBe(false);
});
test("clear on interruption discards pressed, axes and camera delta", () => {
  setMove(0.5, -1);
  tap("interact");
  input.lookX = 300;
  clearInput();
  expect(consume("interact")).toBe(false);
  expect(lookDelta(1 / 60, 1)).toEqual({ yaw: 0, pitch: 0 });
  expect(movement()).toEqual({ x: 0, z: 0 });
});
test("aim assistance cannot rotate toward an occluded guard", () => {
  const s = freshMission();
  runtime.position = [1, 1, 2];
  runtime.yaw = 0;
  runtime.pitch = 0;
  s.guards.forEach((g) => (g.health = 0));
  s.guards[0].health = 100;
  s.guards[0].position = [1, 1, -10];
  assistAim(s, 0.1);
  expect(runtime.pitch).toBe(0);
});
