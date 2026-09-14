import { updateAI } from "./ai";
import { combatTimers } from "./combat";
import { restoreCheckpoint } from "../state/gameStore";
import { updateEscape } from "./escape";
import { emitNoise } from "../state/mission";
import { useGame, dispatch } from "../state/gameStore";
import { runtime, useShell } from "../state/store";
import { input, consume } from "../core/input";
import { nearest } from "../content/interactables";
import { transportStep, occluded } from "./spatial";
export function updateGame(dt: number) {
  const previous = useGame.getState().mission;
  if (useShell.getState().screen !== "play" || previous.dialogue) return;
  const s = structuredClone(previous);
  s.elapsed += dt;
  s.player.position = [...runtime.position];
  s.player.yaw = runtime.yaw;
  combatTimers(s, dt);
  updateAI(s, dt, input.held.has("crouch"));
  if (s.player.health <= 0) {
    s.defeatTime += dt;
    s.message = "倒れた。直前のチェックポイントから復帰する…";
    useGame.setState({ mission: s });
    if (s.defeatTime >= 1.8) restoreCheckpoint();
    return;
  }
  transportStep(s, s.player.position, runtime.yaw);
  if (
    s.heart.mode === "towed" &&
    (input.held.has("forward") || input.held.has("back"))
  )
    emitNoise(s, s.heart.position, 18);
  updateEscape(s, dt, runtime.position);
  useGame.setState({ mission: s });
  if (consume("interact")) {
    if (s.alert === "ESCAPE") dispatch({ type: "ignite" });
    else {
      const item = nearest(s, runtime.position);
      if (item && !occluded(runtime.position, item.position, s, item.id))
        dispatch({
          type: "interact",
          id: item.id,
          position: [...runtime.position],
        });
      else if (s.heart.mode === "towed") {
        s.heart.mode = "carried";
        s.message = "心臓を持ち上げた。";
        useGame.setState({ mission: s });
      }
    }
  }
  if (consume("tow")) dispatch({ type: "tow" });
  if (consume("cancel")) dispatch({ type: "drop" });
  if (consume("reload")) dispatch({ type: "reload" });
  if (consume("melee"))
    dispatch({
      type: "melee",
      direction: [
        -Math.sin(runtime.yaw) * Math.cos(runtime.pitch),
        Math.sin(runtime.pitch),
        -Math.cos(runtime.yaw) * Math.cos(runtime.pitch),
      ],
    });
  if (input.held.has("primary"))
    dispatch({
      type: "primary",
      direction: [
        -Math.sin(runtime.yaw) * Math.cos(runtime.pitch),
        Math.sin(runtime.pitch),
        -Math.cos(runtime.yaw) * Math.cos(runtime.pitch),
      ],
    });
}
