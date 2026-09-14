import { type Mission, transition } from "../state/mission";
import type { Vec3 } from "../levels/harbor";
export function extractionReached(position: Vec3) {
  return position[2] < -57 && position[1] >= 10 && Math.abs(position[0]) < 22;
}
export function updateEscape(s: Mission, dt: number, position: Vec3) {
  if (s.alert !== "ESCAPE") return;
  s.ship.boost = Math.max(0, s.ship.boost - dt);
  s.ship.position = [position[0], position[1] - 1.5, position[2]];
  s.heart.position = [position[0], position[1], position[2]];
  if (s.ship.ignited && extractionReached(position))
    transition(
      s,
      "COMPLETE",
      "港の包囲を突破。奪った心臓が、まだ見ぬ深淵への航路を開いた。",
    );
}
export const worldSignals = {
  CALM: {
    color: "#7eb9b5",
    lamp: "#e6c190",
    label: "通常稼働",
    radio: "港湾管制「夜間搬送を継続」",
  },
  SUSPICIOUS: {
    color: "#e8c47b",
    lamp: "#dfad4e",
    label: "異常を調査中",
    radio: "警備無線「停電と物音を確認する」",
  },
  ALERT: {
    color: "#ffab77",
    lamp: "#ed804c",
    label: "侵入者を捜索",
    radio: "警備無線「持ち場を離れ、侵入者を捜索」",
  },
  LOCKDOWN: {
    color: "#ff7f71",
    lamp: "#f05442",
    label: "封鎖・増援接近",
    radio: "港湾管制「主電源喪失。貨物出口へ増援を回せ」",
  },
  ESCAPE: {
    color: "#91ebdf",
    lamp: "#63eacb",
    label: "浮遊機構オンライン",
    radio: "船内音声「心臓を認識。操縦を引き継いで」",
  },
  COMPLETE: {
    color: "#b6f3df",
    lamp: "#a3f2d7",
    label: "航路を獲得",
    radio: "船内音声「深淵の入口を確認」",
  },
} as const;
