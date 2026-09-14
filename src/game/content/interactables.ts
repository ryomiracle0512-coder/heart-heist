import { z } from "zod";
import { vectorSchema, type Vec3 } from "../levels/harbor";
import { type Mission, doorOpen } from "../state/mission";
const schema = z.object({
  id: z.string(),
  name: z.string(),
  position: vectorSchema,
  kind: z.enum(["door", "terminal", "item", "npc", "socket", "heart"]),
  radius: z.number().positive(),
});
export const interactables = z.array(schema).parse([
  {
    id: "main",
    name: "正面シャッター",
    kind: "door",
    position: [1, 1.4, -4],
    radius: 3.5,
  },
  {
    id: "side",
    name: "側面の電源盤",
    kind: "terminal",
    position: [-15, 1.2, -17],
    radius: 3,
  },
  {
    id: "control",
    name: "制御端末",
    kind: "terminal",
    position: [-7, 2.6, -24],
    radius: 2.8,
  },
  {
    id: "keycard",
    name: "監督者のキーカード",
    kind: "item",
    position: [-8, 2.6, -21],
    radius: 2.4,
  },
  {
    id: "chamber",
    name: "心臓室の扉",
    kind: "door",
    position: [8.25, 1.3, -20],
    radius: 3.4,
  },
  {
    id: "heart",
    name: "浮遊心臓",
    kind: "heart",
    position: [8, 1.5, -25],
    radius: 3,
  },
  {
    id: "fixer",
    name: "港の仲介人・ナギ",
    kind: "npc",
    position: [-25, 1, 12],
    radius: 3.2,
  },
  {
    id: "crate",
    name: "封印された密輸箱",
    kind: "item",
    position: [-26, 1, -10],
    radius: 2.8,
  },
  {
    id: "socket",
    name: "廃船の心臓ソケット",
    kind: "socket",
    position: [-14, 1.3, 21],
    radius: 4,
  },
  {
    id: "cargo",
    name: "貨物用シャッター",
    kind: "door",
    position: [16, 1.3, -17],
    radius: 3,
  },
  {
    id: "supplies",
    name: "救急・弾薬キャッシュ",
    kind: "item",
    position: [-3, 1, -26],
    radius: 2.5,
  },
]);
export function distance(a: Vec3, b: Vec3) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}
export function available(s: Mission, id: string) {
  return !(
    (id === "socket" && s.heart.mode === "mounted") ||
    (id === "keycard" && s.inventory.includes("keycard")) ||
    (id === "crate" &&
      (s.inventory.includes("crate") || s.deal === "complete")) ||
    (id === "heart" &&
      (s.heart.mode === "carried" ||
        s.heart.mode === "towed" ||
        s.heart.mode === "installed")) ||
    (id === "supplies" && s.evidence.includes("supplies")) ||
    (["main", "chamber", "cargo"].includes(id) && doorOpen(s, id))
  );
}
export function nearest(s: Mission, p: Vec3) {
  let best: (typeof interactables)[number] | null = null;
  let d = Infinity;
  for (const item of interactables) {
    if (!available(s, item.id)) continue;
    const pos = item.id === "heart" ? s.heart.position : item.position;
    const value = distance(p, pos);
    if (value < item.radius && value < d) {
      best = { ...item, position: pos };
      d = value;
    }
  }
  return best;
}
export function prompt(s: Mission, id: string) {
  if (id === "heart")
    return s.heart.mode === "mounted"
      ? "ケーブルを外す"
      : "心臓を持つ / T 牽引";
  if (id === "socket")
    return s.heart.mode === "installed" ? "船を点火する" : "心臓を接続する";
  if (id === "main")
    return s.inventory.includes("code") && s.elapsed < s.codeExpires
      ? "コードで入る"
      : "シャッターをこじ開ける";
  if (id === "side")
    return s.power.side ? "側面回路を切る" : "側面回路を復旧する";
  if (id === "control") return "心臓室のロックを解除";
  return interactables.find((i) => i.id === id)?.name ?? "";
}
