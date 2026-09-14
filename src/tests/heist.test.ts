import { describe, test, expect } from "vitest";
import { freshMission, doorOpen } from "../game/state/mission";
import { applyEvent } from "../game/systems/heist";
import { SaveRepository } from "../game/core/save";
import { interactables } from "../game/content/interactables";
import { segmentBox, transportStep } from "../game/systems/spatial";
function route(method: string) {
  let s = freshMission();
  const interact = (id: string) => {
    const position = interactables.find((i) => i.id === id)!.position;
    s.player.position = [...position];
    s = applyEvent(s, { type: "interact", id, position });
  };
  if (method === "combat") {
    interact("main");
    interact("control");
  }
  if (method === "stealth" || method === "mixed") {
    interact("side");
    interact("keycard");
    if (method === "mixed") interact("main");
    interact("chamber");
  }
  if (method === "trade") {
    interact("fixer");
    s = applyEvent(s, { type: "choice", choice: "accept" });
    interact("crate");
    interact("fixer");
    s = applyEvent(s, { type: "choice", choice: "deliver" });
    interact("main");
    interact("chamber");
  }
  interact("heart");
  expect(s.heart.mode).toBe("free");
  expect(s.power.heart).toBe(false);
  expect(doorOpen(s, "cargo")).toBe(true);
  expect(doorOpen(s, "main")).toBe(false);
  interact("heart");
  expect(s.heart.mode).toBe("carried");
  s.heart.position = [-14, 1.3, 21];
  interact("socket");
  expect(s.alert).toBe("ESCAPE");
  expect(s.heart.mode).toBe("installed");
  return s;
}
describe("three shared heist approaches", () => {
  for (const method of ["combat", "stealth", "trade", "mixed"])
    test(`${method} must remove, transport and install the heart`, () => {
      const s = route(method);
      expect(s.evidence).toContain("heart-disconnected");
      expect(s.evidence).toContain("installed");
      if (method === "mixed")
        expect(s.evidence).toEqual(
          expect.arrayContaining(["keycard", "forced-entry"]),
        );
    });
});
test("locked heart cannot be stolen and remote interaction is rejected", () => {
  let s = freshMission();
  s = applyEvent(s, { type: "interact", id: "heart", position: [8, 1.5, -25] });
  expect(s.heart.mode).toBe("mounted");
  s = applyEvent(s, { type: "interact", id: "control", position: [0, 1, 0] });
  expect(s.doors.chamber).toBe(false);
});
test("trade code expires while physical keycard remains valid", () => {
  let s = freshMission();
  s.inventory = ["code"];
  s.codeExpires = 5;
  s.elapsed = 6;
  s = applyEvent(s, {
    type: "interact",
    id: "chamber",
    position: [8, 1.3, -20],
  });
  expect(s.doors.chamber).toBe(false);
  s.inventory.push("keycard");
  s = applyEvent(s, {
    type: "interact",
    id: "chamber",
    position: [8, 1.3, -20],
  });
  expect(s.doors.chamber).toBe(true);
});
test("wall segments obstruct towing and broken tethers leave recoverable heart", () => {
  expect(segmentBox([0, 1, 0], [10, 1, 0], [5, 1, 0], [2, 2, 2])).toBe(true);
  const s = freshMission();
  s.heart.mode = "towed";
  s.heart.position = [8, 1, -25];
  transportStep(s, [8, 1, 0], 0);
  expect(s.heart.mode).toBe("free");
  expect(s.heart.position).toEqual([8, 1, -25]);
});
test("versioned checkpoint preserves all mission fields and rejects corrupt or old saves", () => {
  const data = new Map<string, string>();
  const repo = new SaveRepository({
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => {
      data.set(k, v);
    },
    removeItem: (k) => {
      data.delete(k);
    },
  });
  const s = route("stealth");
  s.guards[0].health = 0;
  expect(repo.save(s)).toBe(true);
  expect(repo.load()).toEqual({ kind: "ok", mission: s });
  data.set("heart-heist.checkpoint.v1", "{broken");
  expect(repo.load().kind).toBe("invalid");
  data.set("heart-heist.checkpoint.v1", JSON.stringify({ ...s, version: 0 }));
  expect(repo.load().kind).toBe("invalid");
  repo.clear();
  expect(repo.load().kind).toBe("empty");
});
test("blocked browser storage does not crash gameplay", () => {
  const repo = new SaveRepository({
    getItem: () => {
      throw Error("blocked");
    },
    setItem: () => {
      throw Error("quota");
    },
    removeItem: () => {
      throw Error("blocked");
    },
  });
  expect(repo.save(freshMission())).toBe(false);
  expect(() => repo.clear()).not.toThrow();
});
