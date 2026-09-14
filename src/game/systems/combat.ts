import { type Mission, emitNoise, evidence } from "../state/mission";
import type { Vec3 } from "../levels/harbor";
import { occluded } from "./spatial";
export function attack(s: Mission, kind: "primary" | "melee", aim: Vec3) {
  if (s.heart.mode === "carried") {
    s.message = "両手が塞がっている。Qで心臓を降ろすか、Tで牽引に切り替える。";
    return;
  }
  if (s.cooldown > 0 || s.reloadTime > 0 || s.alert === "ESCAPE") return;
  if (kind === "primary" && s.player.ammo === 0) {
    s.cooldown = 0.6;
    s.message = "弾切れ。Rで装填する。";
    return;
  }
  s.cooldown = kind === "primary" ? 0.42 : 0.8;
  if (kind === "primary") {
    s.player.ammo--;
    s.stats.shots++;
  }
  emitNoise(s, s.player.position, kind === "primary" ? 32 : 8);
  const origin: Vec3 = [
    s.player.position[0],
    s.player.position[1] + 0.5,
    s.player.position[2],
  ];
  let target: Mission["guards"][number] | null = null,
    best = kind === "primary" ? 38 : 2.7;
  for (const guard of s.guards) {
    if (guard.health <= 0) continue;
    const p: Vec3 = [
      guard.position[0],
      guard.position[1] + 0.15,
      guard.position[2],
    ];
    const dx = p[0] - origin[0],
      dy = p[1] - origin[1],
      dz = p[2] - origin[2];
    const t = dx * aim[0] + dy * aim[1] + dz * aim[2];
    const perpendicular = Math.sqrt(
      Math.max(0, dx * dx + dy * dy + dz * dz - t * t),
    );
    if (
      t > 0 &&
      t < best &&
      perpendicular < (kind === "primary" ? 0.56 : 1.15) &&
      !occluded(origin, p, s)
    ) {
      target = guard;
      best = t;
    }
  }
  if (target) {
    target.health = Math.max(0, target.health - (kind === "primary" ? 40 : 65));
    target.timer = 0;
    target.windup = 0;
    target.mode = "curious";
    s.stats.hits++;
    s.message =
      target.health === 0
        ? "警備員を無力化。足音と周囲の警戒に注意。"
        : "命中。警備員がひるんだ。遮蔽物へ移動しよう。";
    evidence(s, "combat");
    if (target.health === 0) evidence(s, `disabled:${target.id}`);
  } else {
    s.message =
      kind === "primary"
        ? "射撃が外れた。近づくか、遮蔽物から狙い直す。"
        : "近接攻撃は届かなかった。";
  }
}
export function reload(s: Mission) {
  if (
    s.reloadTime === 0 &&
    s.player.ammo < 8 &&
    s.player.reserve > 0 &&
    s.heart.mode !== "carried"
  ) {
    s.reloadTime = 1.5;
    s.message = "装填中…";
  } else if (s.heart.mode === "carried")
    s.message = "心臓を降ろしてから装填する。";
}
export function combatTimers(s: Mission, dt: number) {
  s.cooldown = Math.max(0, s.cooldown - dt);
  if (s.reloadTime > 0) {
    s.reloadTime = Math.max(0, s.reloadTime - dt);
    if (s.reloadTime === 0) {
      const count = Math.min(8 - s.player.ammo, s.player.reserve);
      s.player.ammo += count;
      s.player.reserve -= count;
      s.message = "装填完了。";
    }
  }
}
