import { test, expect, afterEach } from "vitest";
import { bindings, input, emit, consume, clearInput } from "../game/core/input";
import { useShell } from "../game/state/store";
afterEach(clearInput);
test("semantic presses only trigger once until released", () => {
  expect(bindings.KeyE).toBe("interact");
  emit("interact", true);
  expect(consume("interact")).toBe(true);
  emit("interact", true);
  expect(consume("interact")).toBe(false);
  emit("interact", false);
  emit("interact", true);
  expect(consume("interact")).toBe(true);
});
test("clearing on pause releases held motion and look", () => {
  emit("forward", true);
  input.lookX = 100;
  clearInput();
  expect(input.held.size).toBe(0);
  expect(input.lookX).toBe(0);
});
test("settings updates preserve unrelated configuration", () => {
  useShell.getState().setSettings({ volume: 0.2 });
  expect(useShell.getState().settings.sensitivity).toBe(1);
  expect(useShell.getState().settings.volume).toBe(0.2);
});
