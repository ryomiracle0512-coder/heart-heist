import { z } from "zod";
import { vectorSchema, spawn } from "../levels/harbor";
export const alertSchema = z.enum([
  "CALM",
  "SUSPICIOUS",
  "ALERT",
  "LOCKDOWN",
  "ESCAPE",
  "COMPLETE",
]);
export type Alert = z.infer<typeof alertSchema>;
export const guardSchema = z.object({
  id: z.string(),
  position: vectorSchema,
  home: vectorSchema,
  yaw: z.number(),
  health: z.number().min(0).max(100),
  mode: z.enum([
    "patrol",
    "curious",
    "investigate",
    "suspicious",
    "combat",
    "search",
    "return",
  ]),
  suspicion: z.number().min(0).max(1),
  lastKnown: vectorSchema,
  timer: z.number(),
  cooldown: z.number(),
  windup: z.number(),
  patrolIndex: z.number().int(),
});
export const missionSchema = z.object({
  version: z.literal(1),
  elapsed: z.number().nonnegative(),
  alert: alertSchema,
  player: z.object({
    position: vectorSchema,
    yaw: z.number(),
    health: z.number().min(0).max(100),
    ammo: z.number().int().min(0).max(8),
    reserve: z.number().int().min(0).max(80),
  }),
  heart: z.object({
    mode: z.enum(["mounted", "free", "carried", "towed", "installed"]),
    position: vectorSchema,
  }),
  power: z.object({ side: z.boolean(), heart: z.boolean() }),
  doors: z.object({ main: z.boolean(), chamber: z.boolean() }),
  inventory: z.array(z.enum(["crate", "keycard", "code"])),
  deal: z.enum(["none", "accepted", "refused", "complete", "betrayed"]),
  codeExpires: z.number(),
  distractionUntil: z.number(),
  evidence: z.array(z.string()),
  events: z
    .array(z.object({ at: z.number(), cause: z.string(), state: alertSchema }))
    .max(100),
  message: z.string(),
  dialogue: z.enum(["offer", "return", "thanks"]).nullable(),
  guards: z.array(guardSchema),
  ship: z.object({
    position: vectorSchema,
    boost: numberSchema(),
    ignited: z.boolean(),
  }),
  stats: z.object({
    shots: z.number(),
    hits: z.number(),
    detections: z.number(),
    damage: z.number(),
  }),
  cooldown: z.number(),
  reloadTime: z.number(),
  defeatTime: z.number(),
  noise: z
    .object({ position: vectorSchema, radius: z.number(), until: z.number() })
    .nullable(),
});
function numberSchema() {
  return z.number().nonnegative();
}
export type Mission = z.infer<typeof missionSchema>;
export type Guard = z.infer<typeof guardSchema>;
export function freshMission(): Mission {
  return missionSchema.parse({
    version: 1,
    elapsed: 0,
    alert: "CALM",
    player: { position: [...spawn], yaw: 0, health: 100, ammo: 8, reserve: 40 },
    heart: { mode: "mounted", position: [8, 1.5, -25] },
    power: { side: true, heart: true },
    doors: { main: false, chamber: false },
    inventory: [],
    deal: "none",
    codeExpires: 0,
    distractionUntil: 0,
    evidence: [],
    events: [],
    message: "倉庫の青い光が目標だ。正面、整備口、岸壁の仲介人を調べよう。",
    dialogue: null,
    guards: [
      [-1, 1, 0],
      [7, 1, -11],
      [22, 1, -24],
    ].map((p, i) => ({
      id: `guard-${i}`,
      position: p,
      home: [...p],
      yaw: i === 0 ? 0 : Math.PI / 2,
      health: 100,
      mode: "patrol",
      suspicion: 0,
      lastKnown: [...p],
      timer: 0,
      cooldown: 0,
      windup: 0,
      patrolIndex: 0,
    })),
    ship: { position: [-14, 0, 26], boost: 0, ignited: false },
    stats: { shots: 0, hits: 0, detections: 0, damage: 0 },
    cooldown: 0,
    reloadTime: 0,
    defeatTime: 0,
    noise: null,
  });
}
export function evidence(s: Mission, value: string) {
  if (!s.evidence.includes(value)) s.evidence.push(value);
}
export function transition(s: Mission, next: Alert, cause: string) {
  const rank: Record<Alert, number> = {
    CALM: 0,
    SUSPICIOUS: 1,
    ALERT: 2,
    LOCKDOWN: 3,
    ESCAPE: 4,
    COMPLETE: 5,
  };
  if (rank[next] < rank[s.alert]) {
    s.message = cause;
    return;
  }
  if (s.alert !== next) {
    s.alert = next;
    s.events.push({ at: s.elapsed, cause, state: next });
    if (s.events.length > 100) s.events.shift();
  }
  s.message = cause;
}
export function emitNoise(
  s: Mission,
  position: Mission["player"]["position"],
  radius: number,
) {
  s.noise = { position: [...position], radius, until: s.elapsed + 2 };
}
export function doorOpen(s: Mission, id: string) {
  switch (id) {
    case "main":
      return s.doors.main && s.power.heart;
    case "side":
      return !s.power.side;
    case "chamber":
      return s.doors.chamber;
    case "cargo":
      return !s.power.heart;
    default:
      return true;
  }
}
export function objective(s: Mission): string {
  if (s.alert === "COMPLETE") return "脱出成功 — 次の深淵へ";
  if (s.alert === "ESCAPE")
    return s.ship.ignited
      ? "Spaceで上昇。港の北、光のゲートへ操縦する"
      : "Eで点火 — 船に空を取り戻す";
  if (s.heart.mode === "carried" || s.heart.mode === "towed")
    return "貨物出口から廃船へ — 心臓をソケットに接続";
  if (s.heart.mode === "free") return "心臓を運ぶ（E）か牽引する（T）";
  if (s.doors.chamber) return "心臓室へ — 電源ケーブルを外す";
  if (s.inventory.includes("keycard") || s.inventory.includes("code"))
    return "入手した権限で心臓室の扉を開く";
  if (s.deal === "accepted")
    return s.inventory.includes("crate")
      ? "箱を岸壁の仲介人に届ける"
      : "岸壁の北にある密輸箱を回収";
  if (!s.power.side) return "整備口から入り、制御室のカードを探す";
  return "倉庫の心臓を探す — 正面・整備口・仲介人";
}
