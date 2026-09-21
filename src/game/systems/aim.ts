import type { Mission } from "../state/mission";
import { runtime } from "../state/store";
import { occluded } from "./spatial";
export function angleDifference(a: number, b: number) {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}
export function assistAim(s: Mission, dt: number) {
  if (s.alert === "ESCAPE" || s.heart.mode === "carried") return;
  const origin: [number, number, number] = [
    runtime.position[0],
    runtime.position[1] + 0.5,
    runtime.position[2],
  ];
  const candidates = s.guards
    .filter((g) => g.health > 0)
    .map((g) => {
      const p: [number, number, number] = [
        g.position[0],
        g.position[1] + 0.15,
        g.position[2],
      ];
      const dx = p[0] - origin[0],
        dy = p[1] - origin[1],
        dz = p[2] - origin[2];
      const yaw = Math.atan2(-dx, -dz),
        pitch = Math.atan2(dy, Math.hypot(dx, dz));
      return {
        p,
        yaw,
        pitch,
        distance: Math.hypot(dx, dy, dz),
        angle: Math.hypot(
          angleDifference(yaw, runtime.yaw),
          pitch - runtime.pitch,
        ),
      };
    })
    .filter(
      (g) => g.distance < 30 && g.angle < 0.35 && !occluded(origin, g.p, s),
    )
    .sort((a, b) => a.angle - b.angle);
  const g = candidates[0];
  if (!g) return;
  const step = (Math.min(dt, 0.1) * Math.PI) / 2;
  runtime.yaw += Math.max(
    -step,
    Math.min(step, angleDifference(g.yaw, runtime.yaw)),
  );
  runtime.pitch += Math.max(-step, Math.min(step, g.pitch - runtime.pitch));
}
