import { type Mission, type Guard, transition } from "../state/mission";
import { type Vec3 } from "../levels/harbor";
import { occluded } from "./spatial";
const angles = [0, 0.7, -0.7, 1.4, -1.4, 2.2, -2.2, Math.PI];
function moveGuard(
  g: Guard,
  target: Vec3,
  s: Mission,
  dt: number,
  speed = 1.8,
) {
  const dx = target[0] - g.position[0],
    dz = target[2] - g.position[2];
  if (Math.hypot(dx, dz) < 0.6) return;
  const base = Math.atan2(dx, dz);
  let best: Vec3 | null = null,
    score = Infinity;
  for (const angle of angles) {
    const next: Vec3 = [
      g.position[0] + Math.sin(base + angle) * speed * dt,
      1,
      g.position[2] + Math.cos(base + angle) * speed * dt,
    ];
    if (occluded(g.position, next, s, "", 0.4)) continue;
    const candidate = Math.hypot(target[0] - next[0], target[2] - next[2]);
    if (candidate < score) {
      best = next;
      score = candidate;
    }
  }
  if (best) {
    g.yaw = Math.atan2(-(best[0] - g.position[0]), -(best[2] - g.position[2]));
    g.position = best;
  }
}
export function canSee(g: Guard, s: Mission, crouch: boolean) {
  const p: Vec3 = [
    s.player.position[0],
    s.player.position[1] + (crouch ? 0.05 : 0.58),
    s.player.position[2],
  ];
  const eye: Vec3 = [g.position[0], g.position[1] + 0.55, g.position[2]];
  const dx = p[0] - eye[0],
    dz = p[2] - eye[2],
    dist = Math.hypot(dx, dz);
  const facing =
    (-Math.sin(g.yaw) * dx - Math.cos(g.yaw) * dz) / Math.max(0.001, dist);
  return (
    dist < (crouch ? 10 : 16) &&
    (facing > 0.3 || dist < 2) &&
    !occluded(eye, p, s)
  );
}
export function updateAI(s: Mission, dt: number, crouch: boolean) {
  if (s.alert === "ESCAPE" || s.alert === "COMPLETE" || s.player.health <= 0)
    return;
  for (const g of s.guards) {
    if (g.health <= 0) continue;
    g.timer += dt;
    g.cooldown = Math.max(0, g.cooldown - dt);
    const distraction = s.elapsed < s.distractionUntil && s.power.heart;
    const sees = canSee(g, s, crouch) && !distraction;
    const hears =
      s.noise &&
      s.noise.until > s.elapsed &&
      Math.hypot(
        s.noise.position[0] - g.position[0],
        s.noise.position[2] - g.position[2],
      ) < s.noise.radius;
    if (sees) {
      g.lastKnown = [...s.player.position];
      g.suspicion = Math.min(
        1,
        g.suspicion + dt * (crouch ? 0.28 : 0.7) * (s.power.side ? 1 : 0.65),
      );
      if (g.suspicion >= 1) {
        if (g.mode !== "combat") {
          s.stats.detections++;
          if (s.alert === "CALM" || s.alert === "SUSPICIOUS")
            transition(
              s,
              "ALERT",
              "警備無線「侵入者を確認！」遮蔽物で視線を切れ。",
            );
        }
        g.mode = "combat";
        g.timer = 0;
      } else {
        g.mode = "suspicious";
        g.yaw = Math.atan2(
          -(s.player.position[0] - g.position[0]),
          -(s.player.position[2] - g.position[2]),
        );
      }
    } else if (g.mode === "combat") {
      g.mode = "search";
      g.timer = 0;
      g.windup = 0;
      s.message = "警備無線「見失った。最後の位置を捜索する」";
    } else if (hears && g.mode !== "search") {
      g.lastKnown = [...s.noise!.position];
      if (g.mode === "patrol" || g.mode === "return") {
        g.mode = "curious";
        g.timer = 0;
        if (s.alert === "CALM")
          transition(s, "SUSPICIOUS", "警備無線「物音がした。確認する」");
      }
    } else if (!sees) g.suspicion = Math.max(0, g.suspicion - dt * 0.18);
    if (distraction) {
      g.mode = "investigate";
      g.lastKnown = [-25, 1, 8];
    }
    if (g.mode === "curious" && g.timer > 0.6) {
      g.mode = "investigate";
      g.timer = 0;
    }
    if (g.mode === "combat") {
      const dx = s.player.position[0] - g.position[0],
        dz = s.player.position[2] - g.position[2],
        dist = Math.hypot(dx, dz);
      g.yaw = Math.atan2(-dx, -dz);
      if (dist > 9) moveGuard(g, g.lastKnown, s, dt, 2.1);
      else if (g.health < 50 && g.cooldown > 1)
        moveGuard(
          g,
          [g.position[0] + (g.id === "guard-0" ? 3 : -3), 1, g.position[2] + 2],
          s,
          dt,
          1.3,
        );
      if (sees && g.cooldown === 0) {
        g.windup += dt;
        if (g.windup >= 0.85) {
          s.player.health = Math.max(0, s.player.health - 9);
          s.stats.damage += 9;
          s.message = "被弾。遮蔽物に入り、視線を切ろう。";
          g.cooldown = 3;
          g.windup = 0;
        }
      } else g.windup = 0;
    } else if (g.mode === "investigate" || g.mode === "search") {
      moveGuard(g, g.lastKnown, s, dt);
      if (g.timer > 8 && !distraction) {
        g.mode = "return";
        g.timer = 0;
        g.suspicion = 0;
      }
    } else if (g.mode === "return") {
      moveGuard(g, g.home, s, dt);
      if (
        Math.hypot(g.position[0] - g.home[0], g.position[2] - g.home[2]) < 1
      ) {
        g.mode = "patrol";
        g.timer = 0;
      }
    } else if (g.mode === "patrol") {
      const target: Vec3 = [
        g.home[0] + (g.patrolIndex % 2 === 0 ? 3 : -3),
        1,
        g.home[2],
      ];
      moveGuard(g, target, s, dt, 1.1);
      if (
        Math.hypot(g.position[0] - target[0], g.position[2] - target[2]) < 0.8
      )
        g.patrolIndex++;
    }
  }
}
