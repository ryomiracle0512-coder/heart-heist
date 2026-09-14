import { useGame, newRun } from "../state/gameStore";
import { runtime, useShell, type Vec3 } from "../state/store";
export const devTools = {
  reset: newRun,
  look: (yaw: number, pitch = 0) => {
    runtime.yaw = yaw;
    runtime.pitch = pitch;
  },
  snapshot: () => ({
    position: [...runtime.position],
    fps: runtime.fps,
    drawCalls: runtime.drawCalls,
    triangles: runtime.triangles,
    screen: useShell.getState().screen,
    mission: structuredClone(useGame.getState().mission),
  }),
  teleport: (p: Vec3, yaw = 0) => {
    runtime.teleport = p;
    runtime.yaw = yaw;
    runtime.pitch = 0;
  },
};
declare global {
  interface Window {
    __HEIST_DEV__?: typeof devTools;
  }
}
if (import.meta.env.DEV) window.__HEIST_DEV__ = devTools;
