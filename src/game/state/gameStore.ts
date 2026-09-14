import { create } from "zustand";
import { freshMission, type Mission } from "./mission";
import { applyEvent, type GameEvent } from "../systems/heist";
import { runtime, useShell } from "./store";
import { saves } from "../core/save";
import { spawn } from "../levels/harbor";
export const useGame = create<{
  mission: Mission;
  checkpoint: Mission;
  saveStatus: string;
}>(() => ({
  mission: freshMission(),
  checkpoint: freshMission(),
  saveStatus: "",
}));
export function checkpoint() {
  const s = structuredClone(useGame.getState().mission);
  s.player.position = [...runtime.position];
  s.player.yaw = runtime.yaw;
  s.dialogue = null;
  useGame.setState({
    checkpoint: s,
    saveStatus: saves.save(s)
      ? "チェックポイント保存済み"
      : "保存できません。このタブでは続行できます。",
  });
}
export function dispatch(event: GameEvent) {
  const before = useGame.getState().mission;
  const after = applyEvent(before, event);
  useGame.setState({ mission: after });
  if (
    after.guards.some((g, i) => g.health === 0 && before.guards[i].health > 0)
  ) {
    const cp = structuredClone(useGame.getState().checkpoint);
    cp.guards = cp.guards.map((g) =>
      after.guards.find((a) => a.id === g.id)?.health === 0
        ? { ...g, health: 0 }
        : g,
    );
    useGame.setState({ checkpoint: cp });
    saves.save(cp);
  }
  if (
    before.heart.mode !== after.heart.mode ||
    before.doors.chamber !== after.doors.chamber ||
    before.inventory.join() !== after.inventory.join() ||
    before.deal !== after.deal ||
    before.power.side !== after.power.side
  )
    checkpoint();
}
export function newRun() {
  const mission = freshMission();
  saves.clear();
  runtime.teleport = [...spawn];
  runtime.yaw = 0;
  runtime.pitch = 0;
  useGame.setState({
    mission,
    checkpoint: structuredClone(mission),
    saveStatus: "",
  });
}
export function restoreCheckpoint() {
  const s = structuredClone(useGame.getState().checkpoint);
  s.player.health = Math.max(65, s.player.health);
  s.defeatTime = 0;
  s.dialogue = null;
  runtime.teleport = [...s.player.position];
  runtime.yaw = s.player.yaw;
  runtime.pitch = 0;
  useGame.setState({ mission: s });
  useShell.getState().setScreen("play");
}
export function loadRun() {
  const result = saves.load();
  if (result.kind === "ok") {
    const s = result.mission;
    s.dialogue = null;
    runtime.teleport = [...s.player.position];
    runtime.yaw = s.player.yaw;
    runtime.pitch = 0;
    useGame.setState({
      mission: s,
      checkpoint: structuredClone(s),
      saveStatus: "チェックポイントを復元",
    });
    return true;
  }
  return false;
}
