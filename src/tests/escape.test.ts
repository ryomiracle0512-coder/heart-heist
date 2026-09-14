import { test, expect } from "vitest";
import { freshMission } from "../game/state/mission";
import {
  extractionReached,
  updateEscape,
  worldSignals,
} from "../game/systems/escape";
test("completion requires altitude, corridor, ignition and a powered ship", () => {
  const s = freshMission();
  updateEscape(s, 0.1, [0, 12, -60]);
  expect(s.alert).toBe("CALM");
  s.alert = "ESCAPE";
  updateEscape(s, 0.1, [0, 12, -60]);
  expect(s.alert).toBe("ESCAPE");
  s.ship.ignited = true;
  updateEscape(s, 0.1, [0, 5, -60]);
  expect(s.alert).toBe("ESCAPE");
  updateEscape(s, 0.1, [28, 12, -60]);
  expect(s.alert).toBe("ESCAPE");
  updateEscape(s, 0.1, [0, 12, -60]);
  expect(s.alert).toBe("COMPLETE");
  expect(s.events[0].cause).toMatch(/深淵/);
  expect(extractionReached([0, 12, -55])).toBe(false);
});
test("six world states have distinct signal labels and lighting", () => {
  expect(new Set(Object.values(worldSignals).map((v) => v.label)).size).toBe(6);
  expect(new Set(Object.values(worldSignals).map((v) => v.lamp)).size).toBe(6);
});
